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
    const fields = await prisma.formField.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, fields });
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

    const fields = await req.json();
    if (!Array.isArray(fields)) {
      return NextResponse.json({ success: false, error: "Invalid payload, must be an array of fields" }, { status: 400 });
    }

    const existingFields = await prisma.formField.findMany();
    const existingIds = existingFields.map((f: any) => f.id);
    const incomingIds = fields.filter((f: any) => f.id).map((f: any) => f.id);
    const toDelete = existingIds.filter((id: number) => !incomingIds.includes(id));

    if (toDelete.length > 0) {
      await prisma.formField.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const { id, label, fieldName, fieldType, required, placeholder, options } = field;

      await prisma.formField.upsert({
        where: { id: id || 0 },
        update: {
          label,
          fieldName,
          fieldType,
          required: !!required,
          placeholder: placeholder || "",
          options: options || "",
          order: i + 1,
        },
        create: {
          label,
          fieldName,
          fieldType,
          required: !!required,
          placeholder: placeholder || "",
          options: options || "",
          order: i + 1,
        },
      });
    }

    await logActivity(admin.id, "Memperbarui formulir pendaftaran dinamis", req.headers.get("x-forwarded-for") || "");

    const updatedFields = await prisma.formField.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, fields: updatedFields });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
