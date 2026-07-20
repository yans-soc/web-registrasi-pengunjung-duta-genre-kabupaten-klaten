import { prisma } from "./prisma";

export async function logActivity(adminId: number, activity: string, ipAddress?: string) {
  try {
    await prisma.activityLog.create({
      data: {
        admin_id: adminId,
        activity,
        ip_address: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
}
