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

// POST: batch reorder (body = array of { id, order }) OR single create
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Support { updates: [...] } wrapper from handleReorderSection
    const payload = body.updates ?? body;

    if (Array.isArray(payload)) {
      // Batch update for reordering / visibility
      for (const item of payload) {
        const { id, order, isVisible, name, content } = item;
        const stringContent =
          content !== undefined
            ? typeof content === "object"
              ? JSON.stringify(content)
              : content
            : undefined;

        await prisma.customSection.update({
          where: { id },
          data: {
            ...(order !== undefined && { order }),
            ...(isVisible !== undefined && { isVisible }),
            ...(name !== undefined && { name }),
            ...(stringContent !== undefined && { content: stringContent }),
          },
        });
      }
      await logActivity(
        admin.id,
        "Mengurutkan / memperbarui seksi kustom",
        req.headers.get("x-forwarded-for") || ""
      );
      return NextResponse.json({ success: true, message: "Sections updated successfully" });
    } else {
      // Individual section create or update
      const { id, name, isVisible, order, content } = payload;
      const stringContent =
        content !== undefined
          ? typeof content === "object"
            ? JSON.stringify(content)
            : content
          : undefined;

      if (id) {
        const updated = await prisma.customSection.update({
          where: { id },
          data: {
            ...(name !== undefined && { name }),
            ...(isVisible !== undefined && { isVisible }),
            ...(order !== undefined && { order }),
            ...(stringContent !== undefined && { content: stringContent }),
          },
        });
        await logActivity(
          admin.id,
          `Memperbarui seksi kustom '${updated.name}'`,
          req.headers.get("x-forwarded-for") || ""
        );
        return NextResponse.json({ success: true, section: updated });
      }

      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: single section update (content, visibility, name, order)
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, isVisible, order, content } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const stringContent =
      content !== undefined
        ? typeof content === "object"
          ? JSON.stringify(content)
          : content
        : undefined;

    const updated = await prisma.customSection.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(isVisible !== undefined && { isVisible }),
        ...(order !== undefined && { order }),
        ...(stringContent !== undefined && { content: stringContent }),
      },
    });

    await logActivity(
      admin.id,
      `Memperbarui seksi kustom '${updated.name}'`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({ success: true, section: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
