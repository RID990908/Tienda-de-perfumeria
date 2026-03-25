import { NextResponse } from "next/server";
import { handleError } from "../../../../../lib/errorHandler";
import * as authController from "../../../../../features/auth/controllers/authController";

export async function POST(req) {
  try {
    const { user, token } = await authController.login(req);

    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      data: { user },
      timestamp: new Date().toISOString(),
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
