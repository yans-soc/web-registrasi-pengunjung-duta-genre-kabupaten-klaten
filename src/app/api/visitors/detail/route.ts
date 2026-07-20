import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTicketSignature } from "@/lib/signature";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid");
    const code = searchParams.get("code");
    const sig = searchParams.get("sig");

    if (!uuid || !code || !sig) {
      return NextResponse.json(
        { error: "Parameter uuid, code, dan sig harus disertakan." },
        { status: 400 }
      );
    }

    // Fetch by uuid
    const visitor = await prisma.visitor.findUnique({
      where: { uuid },
    });

    if (!visitor) {
      return NextResponse.json(
        { error: "Tiket tidak ditemukan." },
        { status: 404 }
      );
    }

    // Cross-check unique code
    if (visitor.unique_code !== code) {
      return NextResponse.json(
        { error: "Kode tiket tidak cocok dengan data pengunjung." },
        { status: 400 }
      );
    }

    // Verify digital signature
    const validReg = verifyTicketSignature(code, visitor.full_name, "REGISTERED", sig);
    const validPending = verifyTicketSignature(code, visitor.full_name, "PENDING", sig);
    const validCheckedIn = verifyTicketSignature(code, visitor.full_name, "CHECKED_IN", sig);

    if (!validReg && !validPending && !validCheckedIn) {
      return NextResponse.json(
        { error: "Tanda tangan digital tiket tidak valid. Tiket diduga telah dimanipulasi." },
        { status: 400 }
      );
    }

    // Calculate age from birth_date
    let age = 0;
    if (visitor.birth_date) {
      const birth = new Date(visitor.birth_date);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
    }

    return NextResponse.json({
      success: true,
      visitor: {
        id: visitor.id,
        ticketCode: visitor.unique_code,
        name: visitor.full_name,
        gender: visitor.gender || "-",
        birthDate: visitor.birth_date || "-",
        age: age,
        address: visitor.address || "-",
        status: visitor.status,
        checkInTime: visitor.checked_in_at,
        signature: visitor.signature,
        uuid: visitor.uuid,
      },
    });
  } catch (error) {
    console.error("Visitor detail error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}