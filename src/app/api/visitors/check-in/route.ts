import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { verifyTicketSignature } from "@/lib/signature";
import { logActivity } from "@/lib/activityLogger";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Sesi Anda telah habis. Silakan login kembali." },
        { status: 401 }
      );
    }

    const { uuid, uniqueCode, signature } = await req.json();

    if (!uuid || !uniqueCode || !signature) {
      return NextResponse.json(
        { error: "UUID, uniqueCode, dan signature harus disertakan." },
        { status: 400 }
      );
    }

    const visitor = await prisma.visitor.findUnique({
      where: { uuid },
    });

    if (!visitor) {
      return NextResponse.json(
        { error: "Data pengunjung tidak ditemukan." },
        { status: 404 }
      );
    }

    if (visitor.unique_code !== uniqueCode) {
      return NextResponse.json(
        { error: "Kode unik tidak cocok dengan data pengunjung." },
        { status: 400 }
      );
    }

    if (visitor.status === "BLACKLISTED") {
      return NextResponse.json(
        { error: "Check-in ditolak! Pengunjung ini berada dalam daftar hitam (Blacklisted)." },
        { status: 403 }
      );
    }

    const blacklisted = await prisma.blacklist.findFirst({
      where: {
        OR: [
          { value: visitor.full_name },
          { value: visitor.uuid },
          { value: visitor.nik },
        ],
      },
    });
    if (blacklisted) {
      return NextResponse.json(
        { error: `Check-in ditolak! Pengunjung terdaftar dalam daftar hitam. Alasan: ${blacklisted.reason || "Tidak ada alasan"}` },
        { status: 403 }
      );
    }

    if (visitor.status === "CHECKED_IN" || visitor.status === "CHECKED IN") {
      return NextResponse.json(
        {
          error: "Pengunjung sudah melakukan check-in sebelumnya.",
          visitor: {
            name: visitor.full_name,
            ticketCode: visitor.unique_code,
            checkInTime: visitor.checked_in_at,
            checkedInBy: "Sistem",
          }
        },
        { status: 400 }
      );
    }

    let isValidSignature = verifyTicketSignature(uniqueCode, visitor.full_name, "REGISTERED", signature);
    if (!isValidSignature) {
      isValidSignature = verifyTicketSignature(uniqueCode, visitor.full_name, "PENDING", signature);
    }

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Signature tiket tidak valid. Tiket diduga dimanipulasi." },
        { status: 400 }
      );
    }

    const updatedVisitor = await prisma.$transaction(async (tx: any) => {
      const current = await tx.visitor.findUnique({
        where: { uuid },
      });

      if (current.status === "CHECKED_IN" || current.status === "CHECKED IN") {
        throw new Error("ALREADY_CHECKED_IN");
      }

      return await tx.visitor.update({
        where: { uuid },
        data: {
          status: "CHECKED_IN",
          checked_in_at: new Date(),
        },
      });
    });

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await logActivity(
      decoded.id,
      `CHECK_IN: Berhasil check-in pengunjung ${visitor.full_name} (${visitor.unique_code})`,
      ip
    );

    return NextResponse.json({
      success: true,
      message: "Check-in berhasil",
      visitor: {
        name: updatedVisitor.full_name,
        ticketCode: updatedVisitor.unique_code,
        status: updatedVisitor.status,
        checkInTime: updatedVisitor.checked_in_at,
        checkedInBy: decoded.username || "Admin",
      },
    });
  } catch (error: any) {
    if (error.message === "ALREADY_CHECKED_IN") {
      return NextResponse.json(
        { error: "Pengunjung sudah melakukan check-in sebelumnya (terdeteksi persaingan data)." },
        { status: 400 }
      );
    }
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}