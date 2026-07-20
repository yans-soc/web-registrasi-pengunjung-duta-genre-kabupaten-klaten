import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTicketSignature } from "@/lib/signature";
import crypto from "crypto";

function generateUniqueCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "DG26-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateQRToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const parts = birthDateStr.split("-");
  if (parts.length !== 3) return 0;
  const birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "DG26-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const inputData = await req.json();

    // 1. Validate required spec fields
    const fullName = inputData.full_name?.trim() || "";
    const gender = inputData.gender?.trim() || "";
    const birthDate = inputData.birth_date?.trim() || "";
    const address = inputData.address?.trim() || "";

    if (!fullName) {
      return NextResponse.json(
        { error: "Nama Lengkap wajib diisi." },
        { status: 400 }
      );
    }
    if (!gender) {
      return NextResponse.json(
        { error: "Jenis Kelamin wajib dipilih." },
        { status: 400 }
      );
    }
    if (!birthDate) {
      return NextResponse.json(
        { error: "Tanggal Lahir wajib diisi." },
        { status: 400 }
      );
    }
    if (!address) {
      return NextResponse.json(
        { error: "Alamat Lengkap wajib diisi." },
        { status: 400 }
      );
    }

    // Calculate age from birth_date
    const age = calculateAge(birthDate);

    // 2. Validate ticket limits and registration period from settings
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, any> = {};
    for (const s of settings) {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch {
        settingsMap[s.key] = s.value;
      }
    }

    // Check ticket limit
    const ticketLimit = parseInt(settingsMap.ticket_limit || "0", 10);
    if (ticketLimit > 0) {
      const currentCount = await prisma.visitor.count({
        where: {
          status: { in: ["REGISTERED", "CHECKED_IN"] },
        },
      });
      if (currentCount >= ticketLimit) {
        return NextResponse.json(
          { error: "Kuota pendaftaran tiket telah habis." },
          { status: 400 }
        );
      }
    }

    // Check registration period
    const regStart = settingsMap.registration_start ? new Date(settingsMap.registration_start) : null;
    const regEnd = settingsMap.registration_end ? new Date(settingsMap.registration_end) : null;
    const now = new Date();

    if (regStart && now < regStart) {
      return NextResponse.json(
        { error: "Pendaftaran belum dibuka." },
        { status: 400 }
      );
    }
    if (regEnd && now > regEnd) {
      return NextResponse.json(
        { error: "Pendaftaran telah ditutup." },
        { status: 400 }
      );
    }

    // 3. Generate unique code and QR token with retry logic
    let uniqueCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      uniqueCode = generateUniqueCode();
      const existing = await prisma.visitor.findUnique({
        where: { unique_code: uniqueCode },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Gagal membuat kode unik. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // Generate qr_code (backward compat) and qr_token
    const qr_code = uniqueCode;
    const qr_token = generateQRToken();

    // Generate uuid upfront for signature
    const visitorUuid = crypto.randomUUID();

    // Generate ticket signature using uniqueCode + fullName + status (must match check-in verification)
    const signature = generateTicketSignature(uniqueCode, fullName, "REGISTERED");

    // 4. Create visitor in database with spec fields
    const visitor = await prisma.visitor.create({
      data: {
        uuid: visitorUuid,
        unique_code: uniqueCode,
        full_name: fullName,
        gender,
        birth_date: birthDate,
        age,
        address,
        qr_token,
        signature,
        // Legacy fields for backward compatibility
        qr_code,
        name: fullName,
        nik: "VIRTUAL-" + Date.now() + Math.floor(Math.random() * 1000),
        phone: "-",
        status: "REGISTERED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil",
      visitor: {
        id: visitor.id,
        uuid: visitor.uuid,
        uniqueCode: visitor.unique_code,
        ticketCode: visitor.qr_code,
        name: visitor.full_name,
        status: visitor.status,
        signature,
        qrToken: visitor.qr_token,
      },
    });
  } catch (error: any) {
    console.error("Register visitor error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}