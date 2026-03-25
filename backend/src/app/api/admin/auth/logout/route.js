import { handleError, handleSuccess } from "../../../../../lib/errorHandler";

export async function POST() {
  try {
    const response = handleSuccess(null, 200, "SesiÃ³n cerrada");

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}

