import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email es requerido")
    .email("Email invalido")
    .max(255, "Email no puede exceder 255 caracteres")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Contrasena debe tener al menos 6 caracteres")
    .max(128, "Contrasena no puede exceder 128 caracteres"),
});


export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email es requerido")
    .email("Email invalido")
    .max(255, "Email no puede exceder 255 caracteres")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Contrasena debe tener al menos 8 caracteres")
    .max(128, "Contrasena no puede exceder 128 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Contrasena debe contener mayuscula, minuscula y numero",
    ),
  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres"),
});


export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Contrasena actual es requerida")
    .min(6, "Contrasena debe tener al menos 6 caracteres"),
  newPassword: z
    .string()
    .min(1, "Nueva contrasena es requerida")
    .min(8, "Nueva contrasena debe tener al menos 8 caracteres")
    .max(128, "Contrasena no puede exceder 128 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Debe contener mayuscula, minuscula y numero",
    ),
});


export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email es requerido")
    .email("Email invalido")
    .max(255, "Email no puede exceder 255 caracteres")
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email es requerido")
    .email("Email invalido")
    .toLowerCase(),
  token: z.string().min(6, "Token es requerido"),
  newPassword: z
    .string()
    .min(1, "Nueva contrasena es requerida")
    .min(8, "Contrasena debe tener al menos 8 caracteres")
    .max(128, "Contrasena no puede exceder 128 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Debe contener mayuscula, minuscula y numero",
    ),
});


export const verifyEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email es requerido")
    .email("Email invalido")
    .toLowerCase(),
  token: z.string().min(1, "Codigo es requerido").min(6),
});


const ONLY_LETTERS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]*$/;

export const createProductSchema = z.object({
  nombre: z
    .string()
    .min(1, "Nombre es requerido")
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(255, "Nombre no puede exceder 255 caracteres")
    .regex(ONLY_LETTERS_REGEX, "El nombre solo puede contener letras")
    .trim(),
  categoria: z
    .string()
    .min(1, "Categoria es requerida")
    .min(2, "Categoria debe tener al menos 2 caracteres")
    .max(255, "Categoria no puede exceder 255 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/, "La categoría solo puede contener letras (sin números)")
    .trim(),
  precio: z
    .coerce
    .number()
    .positive("Precio debe ser mayor a 0")
    .finite("Precio debe ser un numero valido")
    .max(999999.99, "Precio no puede exceder 999,999.99"),
  descripcion: z
    .string()
    .max(1000, "Descripcion no puede exceder 1000 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
  cantidad: z
    .coerce
    .number()
    .int("Cantidad debe ser un numero entero")
    .nonnegative("Cantidad no puede ser negativa")
    .default(0),
  imagen: z
    .string()
    .max(2048, "La ruta de imagen es demasiado larga")
    .optional()
    .or(z.literal("")),
  activo: z.boolean().default(true),
});


export const updateProductSchema = createProductSchema.partial();


export const productIdSchema = z.object({
  id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0, "ID debe ser mayor a 0"),
});

export const addToCartSchema = z.object({
  id_producto: z
    .number()
    .int("ID debe ser un numero entero")
    .positive("ID debe ser mayor a 0"),
  cantidad: z
    .number()
    .int("Cantidad debe ser un numero entero")
    .positive("Cantidad debe ser al menos 1")
    .default(1),
});

export const removeFromCartSchema = z.object({
  id_carrito: z
    .number()
    .int("ID debe ser un numero entero")
    .positive("ID debe ser mayor a 0"),
});

export const addInventorySchema = z.object({
  id_producto: z
    .number()
    .int("ID debe ser un numero entero")
    .positive("ID debe ser mayor a 0"),
  stock: z
    .number()
    .int("Stock debe ser un numero entero")
    .nonnegative("Stock no puede ser negativo"),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id_producto: z.number().int().positive(),
        cantidad: z.number().int().positive(),
        precio: z.number().positive(),
      }),
    )
    .min(1, "Debe haber al menos 1 item en la orden")
    .max(100, "No puede haber mas de 100 items in una orden"),
  total: z.number().positive("Total debe ser mayor a 0").finite(),
  notas: z
    .string()
    .max(500, "Notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export const updateOrderStatusSchema = z.object({
  estado: z.enum(["pendiente", "procesando", "enviado", "entregado", "cancelado"]),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .optional(),
  email: z.string().email("Email invalido").max(255).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,}$/, "Telefono invalido")
    .optional(),
  address: z
    .string()
    .max(255, "Direccion no puede exceder 255 caracteres")
    .optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sort: z.enum(["asc", "desc"]).default("asc").optional(),
  sortBy: z.enum(["nombre", "fecha", "rating"]).default("fecha").optional(),
});

export const searchProductsSchema = paginationSchema.extend({
  q: z.string().max(100, "Busqueda no puede exceder 100 caracteres").optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
});

export const validateData = (schema, data) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error.issues) {
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new Error(JSON.stringify(formattedErrors));
    }
    throw error;
  }
};


