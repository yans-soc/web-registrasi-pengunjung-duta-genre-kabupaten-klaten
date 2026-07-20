import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { logActivity } from "@/lib/activityLogger";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    
    if (token) {
      const decoded = await verifyJWT(token);
      if (decoded) {
        await logActivity(decoded.id, "LOGOUT", `Admin ${decoded.username} berhasil logout`);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });

    // Delete cookie by setting maxAge to 0
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
