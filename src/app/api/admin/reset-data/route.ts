import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { logActivity } from "@/lib/activityLogger";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role.toLowerCase() !== "superadmin") {
      return NextResponse.json({ error: "Hanya Super Admin yang diizinkan." }, { status: 403 });
    }

    const deleteCount = await prisma.visitor.deleteMany({});

    await logActivity(decoded.id, "RESET_DATA", `Melakukan reset data pengunjung. Menghapus ${deleteCount.count} data pengunjung.`);

    return NextResponse.json({
      success: true,
      message: `Semua data pengunjung (${deleteCount.count} record) berhasil dibersihkan dari database.`,
    });
  } catch (error) {
    console.error("Reset data error:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
