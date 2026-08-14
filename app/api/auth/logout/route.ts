import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Customer logged out successfully.",
    });
  } catch (error) {
    console.error("[Logout API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log out customer." },
      { status: 500 }
    );
  }
}
