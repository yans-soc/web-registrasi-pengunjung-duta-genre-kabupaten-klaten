import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Akses ditolak." },
        { status: 401 }
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const totalCount = await prisma.visitor.count();
    const presentCount = await prisma.visitor.count({
      where: { status: "CHECKED_IN" },
    });
    const pendingCount = await prisma.visitor.count({
      where: { status: "REGISTERED" },
    });

    const recentRegistrations = await prisma.visitor.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
      select: {
        id: true,
        unique_code: true,
        full_name: true,
        status: true,
        created_at: true,
      },
    });

    const recentCheckIns = await prisma.visitor.findMany({
      where: { status: "CHECKED_IN" },
      orderBy: { checked_in_at: "desc" },
      take: 5,
      select: {
        id: true,
        unique_code: true,
        full_name: true,
        checked_in_at: true,
      },
    });

    const mappedRegistrations = recentRegistrations.map((r: any) => ({
      id: r.id,
      ticketCode: r.unique_code,
      name: r.full_name,
      agency: r.institution || "-",
      status: r.status === "REGISTERED" ? "PENDING" : r.status,
      createdAt: r.created_at,
    }));

    const mappedCheckIns = recentCheckIns.map((c: any) => ({
      id: c.id,
      ticketCode: c.unique_code,
      name: c.full_name,
      checkInTime: c.checked_in_at,
      admin: null, // Simple fallback as admin link is optional
    }));

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount,
        present: presentCount,
        pending: pendingCount,
        rate: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
      },
      recentRegistrations: mappedRegistrations,
      recentCheckIns: mappedCheckIns,
    });
  } catch (error: any) {
    console.error("Fetch dashboard stats error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
