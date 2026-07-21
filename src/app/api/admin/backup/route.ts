import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { logActivity } from "@/lib/activityLogger";

async function getSuperAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (!payload || !payload.id || payload.role.toLowerCase() !== "superadmin") return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getSuperAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized / Super Admin only" }, { status: 401 });
    }

    const visitors = await prisma.visitor.findMany();
    const settings = await prisma.systemSetting.findMany();
    const customSections = await prisma.customSection.findMany();
    const formFields = await prisma.formField.findMany();
    const activityLogs = await prisma.activityLog.findMany();

    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      visitors,
      settings,
      customSections,
      formFields,
      activityLogs,
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Content-Disposition", `attachment; filename="backup_dutagenre_${Date.now()}.json"`);

    return new NextResponse(jsonString, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getSuperAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized / Super Admin only" }, { status: 401 });
    }

    const { backup } = await req.json();
    if (!backup) {
      return NextResponse.json({ success: false, error: "No backup data provided" }, { status: 400 });
    }

    const data = typeof backup === "string" ? JSON.parse(backup) : backup;

    await prisma.$transaction(async (tx: any) => {
      if (Array.isArray(data.settings)) {
        await tx.systemSetting.deleteMany();
        for (const item of data.settings) {
          await tx.systemSetting.create({
            data: { key: item.key, value: item.value },
          });
        }
      }

      if (Array.isArray(data.customSections)) {
        await tx.customSection.deleteMany();
        for (const item of data.customSections) {
          await tx.customSection.create({
            data: {
              id: item.id,
              name: item.name,
              slug: item.slug,
              isVisible: item.isVisible,
              order: item.order,
              content: item.content,
            },
          });
        }
      }

      if (Array.isArray(data.formFields)) {
        await tx.formField.deleteMany();
        for (const item of data.formFields) {
          await tx.formField.create({
            data: {
              id: item.id,
              label: item.label,
              fieldName: item.fieldName,
              fieldType: item.fieldType,
              required: item.required,
              placeholder: item.placeholder,
              options: item.options,
              order: item.order,
            },
          });
        }
      }

      if (Array.isArray(data.visitors)) {
        await tx.visitor.deleteMany();
        for (const item of data.visitors) {
          await tx.visitor.create({
            data: {
              id: item.id,
              uuid: item.uuid || "",
              unique_code: item.unique_code || item.qr_code,
              full_name: item.full_name || item.name,
              gender: item.gender || "",
              birth_date: item.birth_date || "",
              age: item.age || 0,
              address: item.address || "",
              qr_code: item.unique_code || item.qr_code,
              qr_token: item.qr_token || "",
              signature: item.signature || "",
              name: item.full_name || item.name,
              nik: item.nik,
              phone: item.phone,
              email: item.email || "",
              institution: item.institution || "",
              status: item.status,
              additional_data: item.additional_data || "{}",
              checked_in_at: item.checked_in_at ? new Date(item.checked_in_at) : null,
              created_at: item.created_at ? new Date(item.created_at) : new Date(),
            },
          });
        }
      }

      if (Array.isArray(data.activityLogs)) {
        await tx.activityLog.deleteMany();
        for (const item of data.activityLogs) {
          await tx.activityLog.create({
            data: {
              id: item.id,
              admin_id: item.admin_id,
              activity: item.activity || item.action || "",
              ip_address: item.ip_address,
              created_at: item.created_at ? new Date(item.created_at) : new Date(),
            },
          });
        }
      }
    });

    await logActivity(admin.id, "Restore database dari file backup", req.headers.get("x-forwarded-for") || "");

    return NextResponse.json({ success: true, message: "Database restored successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
