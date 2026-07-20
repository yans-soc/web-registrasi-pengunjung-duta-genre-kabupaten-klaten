import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface VisitorResult {
  id: number;
  uuid: string;
  full_name: string;
  unique_code: string;
  address: string | null;
  status: string;
  signature: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length < 3) {
      return NextResponse.json(
        { error: "Kata kunci pencarian minimal 3 karakter." },
        { status: 400 }
      );
    }

    // Search by full_name OR unique_code (case-insensitive)
    const results = await prisma.visitor.findMany({
      where: {
        OR: [
          { full_name: { contains: q } },
          { unique_code: { contains: q.toUpperCase() } },
          { address: { contains: q } },
        ],
      },
      select: {
        id: true,
        uuid: true,
        full_name: true,
        unique_code: true,
        address: true,
        status: true,
        signature: true,
      },
      orderBy: { created_at: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      results: results.map((v: VisitorResult) => ({
        id: v.id,
        uuid: v.uuid,
        name: v.full_name,
        ticketCode: v.unique_code,
        address: v.address || "-",
        status: v.status,
        signature: v.signature,
      })),
    });
  } catch (error) {
    console.error("Visitor search error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}