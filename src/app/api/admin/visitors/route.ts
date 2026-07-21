import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { generateTicketSignature } from "@/lib/signature";
import { logActivity } from "@/lib/activityLogger";
import crypto from "crypto";

async function getAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (!payload || !payload.id) return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    let status = searchParams.get("status") || "ALL";
    if (status === "PRESENT") status = "CHECKED_IN";
    if (status === "PENDING") status = "REGISTERED";
    
    const exportExcel = searchParams.get("export") === "true";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { full_name: { contains: search } },
        { unique_code: { contains: search } },
        { nik: { contains: search } },
        { phone: { contains: search } },
        { institution: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (exportExcel) {
      const visitors = await prisma.visitor.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
      });
      const mapped = visitors.map((v: any) => ({
        id: v.id,
        uuid: v.uuid,
        ticketCode: v.unique_code,
        uniqueCode: v.unique_code,
        name: v.full_name,
        email: v.email || "-",
        phoneNumber: v.phone || "-",
        agency: v.institution || "-",
        status: v.status === "CHECKED_IN" ? "PRESENT" : (v.status === "REGISTERED" ? "PENDING" : v.status),
        signature: v.signature || generateTicketSignature(v.unique_code, v.full_name, "REGISTERED"),
        checkInTime: v.checked_in_at ? v.checked_in_at.toISOString() : null,
        createdAt: v.created_at.toISOString(),
        admin: null,
      }));
      return NextResponse.json({ success: true, visitors: mapped });
    }

    const [visitors, totalCount] = await Promise.all([
      prisma.visitor.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.visitor.count({ where: whereClause }),
    ]);

    const mapped = visitors.map((v: any) => ({
      id: v.id,
      uuid: v.uuid,
      ticketCode: v.unique_code,
      uniqueCode: v.unique_code,
      name: v.full_name,
      email: v.email || "-",
      phoneNumber: v.phone || "-",
      agency: v.institution || "-",
      status: v.status === "CHECKED_IN" ? "PRESENT" : (v.status === "REGISTERED" ? "PENDING" : v.status),
      signature: v.signature || generateTicketSignature(v.unique_code, v.full_name, "REGISTERED"),
      checkInTime: v.checked_in_at ? v.checked_in_at.toISOString() : null,
      createdAt: v.created_at.toISOString(),
      admin: null,
    }));

    return NextResponse.json({
      success: true,
      visitors: mapped,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Fetch visitors error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const body = await req.json();
    const { name, nik, phone, email, institution, status } = body;

    if (!name || !nik) {
      return NextResponse.json({ error: "Nama dan NIK wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.visitor.findUnique({ where: { nik } });
    if (existing) {
      return NextResponse.json({ error: "NIK sudah terdaftar." }, { status: 400 });
    }

    const uniqueCode = "DG26-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    const newVisitor = await prisma.visitor.create({
      data: {
        name,
        full_name: name,
        unique_code: uniqueCode,
        qr_code: uniqueCode,
        nik,
        phone: phone || "-",
        email: email || "",
        institution: institution || "",
        uuid: crypto.randomUUID(),
        qr_token: crypto.randomBytes(16).toString("hex"),
        status: status || "REGISTERED",
        additional_data: JSON.stringify(body.additional_data || {}),
        checked_in_at: status === "CHECKED_IN" ? new Date() : null,
      },
    });

    await logActivity(admin.id, "ADD_VISITOR", `Menambah pengunjung ${name} (${uniqueCode}) secara manual`);

    return NextResponse.json({ success: true, visitor: newVisitor });
  } catch (error: any) {
    console.error("Create visitor error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const body = await req.json();
    const { id, name, nik, phone, email, institution, status } = body;

    if (!id) return NextResponse.json({ error: "ID Pengunjung wajib disertakan." }, { status: 400 });

    const existing = await prisma.visitor.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existing) return NextResponse.json({ error: "Pengunjung tidak ditemukan." }, { status: 404 });

    const updatedData: any = {
      full_name: name || existing.full_name,
      nik: nik || existing.nik,
      phone: phone || existing.phone,
      email: email !== undefined ? email : existing.email,
      institution: institution !== undefined ? institution : existing.institution,
      status: status || existing.status,
    };

    if (status === "CHECKED_IN" && existing.status !== "CHECKED_IN") {
      updatedData.checked_in_at = new Date();
    } else if (status === "REGISTERED") {
      updatedData.checked_in_at = null;
    }

    const updated = await prisma.visitor.update({
      where: { id: parseInt(id, 10) },
      data: updatedData,
    });

    if (status === "BLACKLISTED") {
      await prisma.blacklist.upsert({
        where: { value: updated.nik },
        update: { reason: "Blacklisted by Admin" },
        create: { type: "CODE", value: updated.nik, reason: "Blacklisted by Admin" },
      });
    }

    await logActivity(admin.id, "UPDATE_VISITOR", `Memperbarui data/status pengunjung ${updated.full_name} (${updated.unique_code}) menjadi ${status}`);

    return NextResponse.json({ success: true, visitor: updated });
  } catch (error: any) {
    console.error("Update visitor error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID Pengunjung wajib disertakan." }, { status: 400 });

    const visitor = await prisma.visitor.findUnique({ where: { id: parseInt(id, 10) } });
    if (!visitor) return NextResponse.json({ error: "Pengunjung tidak ditemukan." }, { status: 404 });

    await prisma.visitor.delete({ where: { id: parseInt(id, 10) } });

    await logActivity(admin.id, "DELETE_VISITOR", `Menghapus pengunjung ${visitor.full_name} (${visitor.unique_code})`);

    return NextResponse.json({ success: true, message: "Pengunjung berhasil dihapus" });
  } catch (error: any) {
    console.error("Delete visitor error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
