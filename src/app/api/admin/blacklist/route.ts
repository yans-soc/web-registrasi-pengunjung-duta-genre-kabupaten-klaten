import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { logActivity } from "@/lib/activityLogger";

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
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const blacklisted = await prisma.visitor.findMany({
      where: { status: "BLACKLISTED" },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({ success: true, blacklisted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Visitor ID is required" }, { status: 400 });
    }

    const visitor = await prisma.visitor.update({
      where: { id },
      data: { status: "BLACKLISTED" },
    });

    await logActivity(admin.id, `Meblacklist pengunjung '${visitor.name}'`, req.headers.get("x-forwarded-for") || "");

    return NextResponse.json({ success: true, visitor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Visitor ID is required" }, { status: 400 });
    }

    const visitor = await prisma.visitor.update({
      where: { id },
      data: { status: "REGISTERED" },
    });

    await logActivity(admin.id, `Membatalkan blacklist pengunjung '${visitor.name}'`, req.headers.get("x-forwarded-for") || "");

    return NextResponse.json({ success: true, visitor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
