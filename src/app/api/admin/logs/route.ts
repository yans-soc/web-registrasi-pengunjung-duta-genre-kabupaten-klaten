import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate & check role (only SUPER_ADMIN can view full logs)
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== "superadmin") {
      return NextResponse.json({ error: "Hanya Super Admin yang diizinkan." }, { status: 403 });
    }

    // 2. Fetch logs with admin association
    const logs = await prisma.activityLog.findMany({
      orderBy: { created_at: "desc" },
      take: 100, // Limit to recent 100 logs
      include: {
        admin: {
          select: {
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Fetch logs error:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
