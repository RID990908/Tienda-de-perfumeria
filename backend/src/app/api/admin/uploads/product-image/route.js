import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { requireAdminSession } from "../../../../../lib/adminSession";
import {
  AppError,
  ErrorTypes,
  handleError,
  handleSuccess,
} from "../../../../../lib/errorHandler";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

function getExtension(file) {
  const originalName = file.name || "upload";
  const ext = path.extname(originalName).toLowerCase();

  if (ext) {
    return ext;
  }

  switch (file.type) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}

export async function POST(req) {
  try {
    requireAdminSession(req);

    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      throw new AppError(
        "Debes enviar un archivo de imagen",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      throw new AppError(
        "Formato de imagen no permitido",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(
        "La imagen supera el limite de 5MB",
        400,
        ErrorTypes.VALIDATION_ERROR,
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const extension = getExtension(file);
    const fileName = `${randomUUID()}${extension}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);

    return handleSuccess(
      {
        path: `/uploads/products/${fileName}`,
        fileName,
      },
      201,
      "Imagen subida exitosamente",
    );
  } catch (error) {
    return handleError(error);
  }
}

