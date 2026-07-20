import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== "superadmin") {
      return NextResponse.json({ error: "Hanya Super Admin yang diizinkan." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const getPermissionsOnly = searchParams.get("permissions_only");

    if (getPermissionsOnly === "true") {
      const allPermissions = await prisma.permission.findMany();
      return NextResponse.json({ success: true, permissions: allPermissions });
    }

    const admins = await prisma.admin.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
        created_at: true,
        permissions: {
          select: {
            permission: true,
          },
        },
      },
    });

    // Format permissions into direct array of slugs for convenience
    const formattedAdmins = admins.map((admin) => ({
      ...admin,
      permissions: admin.permissions.map((p) => p.permission.slug),
    }));

    const allPermissions = await prisma.permission.findMany();

    return NextResponse.json({
      success: true,
      admins: formattedAdmins,
      allPermissions,
    });
  } catch (error) {
    console.error("Fetch admins error:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== "superadmin") {
      return NextResponse.json({ error: "Hanya Super Admin yang diizinkan." }, { status: 403 });
    }

    const body = await req.json();
    const { name, username, password, role, status, permissions } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "Semua field wajib harus diisi." }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah terdaftar." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        username,
        password_hash: hashedPassword,
        role,
        status: status || "ACTIVE",
      },
    });

    // Map permissions
    if (permissions && Array.isArray(permissions)) {
      for (const slug of permissions) {
        const perm = await prisma.permission.findUnique({ where: { slug } });
        if (perm) {
          await prisma.adminPermission.create({
            data: {
              admin_id: newAdmin.id,
              permission_id: perm.id,
            },
          });
        }
      }
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await logActivity(decoded.id, `CREATE_ADMIN: Membuat admin baru: ${name} (${role})`, ip);

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        username: newAdmin.username,
        role: newAdmin.role,
        status: newAdmin.status,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== "superadmin") {
      return NextResponse.json({ error: "Hanya Super Admin yang diizinkan." }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, username, role, status, password, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: "ID admin wajib disertakan." }, { status: 400 });
    }

    const adminId = parseInt(id);
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      return NextResponse.json({ error: "Admin tidak ditemukan." }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;
    if (username) {
      if (username !== admin.username) {
        const dup = await prisma.admin.findUnique({ where: { username } });
        if (dup) return NextResponse.json({ error: "Username sudah terdaftar." }, { status: 400 });
      }
      updateData.username = username;
    }
    if (role) updateData.role = role;
    if (password && password.trim() !== "") {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
    });

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Clear existing
      await prisma.adminPermission.deleteMany({
        where: { admin_id: adminId },
      });

      // Insert new
      for (const slug of permissions) {
        const perm = await prisma.permission.findUnique({ where: { slug } });
        if (perm) {
          await prisma.adminPermission.create({
            data: {
              admin_id: adminId,
              permission_id: perm.id,
            },
          });
        }
      }
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await logActivity(decoded.id, `UPDATE_ADMIN: Memperbarui data admin ID: ${id} (${updated.name})`, ip);

    return NextResponse.json({
      success: true,
      admin: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== "superadmin") {
      return NextResponse.json({ error: "Hanya Super Admin yang diizinkan." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID admin wajib disertakan." }, { status: 400 });
    }

    const adminId = parseInt(id);

    if (adminId === decoded.id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun Anda sendiri." }, { status: 400 });
    }

    const target = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!target) {
      return NextResponse.json({ error: "Admin tidak ditemukan." }, { status: 404 });
    }

    await prisma.admin.delete({ where: { id: adminId } });

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await logActivity(decoded.id, `DELETE_ADMIN: Menghapus admin: ${target.name} (${target.username})`, ip);

    return NextResponse.json({ success: true, message: "Admin berhasil dihapus." });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json({ error: "Kesalahan server internal" }, { status: 500 });
  }
}
