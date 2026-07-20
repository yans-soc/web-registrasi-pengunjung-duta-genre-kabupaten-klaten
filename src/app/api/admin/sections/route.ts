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
    const sections = await prisma.customSection.findMany({
      orderBy: { order: "asc" },
    });
    const parsedSections = sections.map((sect: any) => {
      try {
        return { ...sect, content: JSON.parse(sect.content) };
      } catch {
        return sect;
      }
    });
    return NextResponse.json({ success: true, sections: parsedSections });
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

    const body = await req.json();

    if (Array.isArray(body)) {
      // Batch update for reordering / visibility
      for (const item of body) {
        const { id, order, isVisible, name, content } = item;
        const stringContent = typeof content === "object" ? JSON.stringify(content) : content;
        await prisma.customSection.update({
          where: { id },
          data: {
            order: order !== undefined ? order : undefined,
            isVisible: isVisible !== undefined ? isVisible : undefined,
            name: name !== undefined ? name : undefined,
            content: stringContent !== undefined ? stringContent : undefined,
          },
        });
      }
      await logActivity(admin.id, "Mengurutkan / memperbarui seksi kustom", req.headers.get("x-forwarded-for") || "");
      return NextResponse.json({ success: true, message: "Sections updated successfully" });
    } else {
      // Individual section update
      const { id, name, isVisible, order, content } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
      }
      const stringContent = typeof content === "object" ? JSON.stringify(content) : content;
      const updated = await prisma.customSection.update({
        where: { id },
        data: {
          name,
          isVisible,
          order,
          content: stringContent,
        },
      });
      await logActivity(admin.id, `Memperbarui seksi kustom '${updated.name}'`, req.headers.get("x-forwarded-for") || "");
      return NextResponse.json({ success: true, section: updated });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
