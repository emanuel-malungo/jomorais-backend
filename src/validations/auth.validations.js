import { z } from "zod";
import { MAX_STRING, 
         NAME_REGEX, 
         PASSWORD_REGEX 
} from "../utils/validation.utils.js";


// ===== Registro de Usuário =====
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(MAX_STRING, `Nome deve ter no máximo ${MAX_STRING} caracteres`)
    .regex(NAME_REGEX, "Nome deve conter apenas letras e espaços"),

  email: z.email("Email inválido")
    .toLowerCase()
    .max(MAX_STRING, `Email deve ter no máximo ${MAX_STRING} caracteres`),
  
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(MAX_STRING, `Senha deve ter no máximo ${MAX_STRING} caracteres`)
    .regex(PASSWORD_REGEX, "Senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 número"),
  
  tipo: z.number()
    .int()
    .min(1, "Tipo inválido")
    .max(10, "Tipo inválido")
    .default(1),
});

// ===== Login =====
export const loginSchema = z.object({
  login: z.string()
    .trim()
    .min(1, "Login é obrigatório")
    .max(MAX_STRING, `Login deve ter no máximo ${MAX_STRING} caracteres`),
  
  password: z.string()
    .min(1, "Senha é obrigatória")
});

// ===== Login no Sistema Legado =====
export const legacyLoginSchema = z.object({
  user: z.string()
    .trim()
    .min(1, "Usuário é obrigatório")
    .max(45, "Usuário deve ter no máximo 45 caracteres"),
  
  passe: z.string()
    .min(1, "Senha é obrigatória")
});

// ===== Atualização de Perfil =====
export const updateProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(MAX_STRING, `Nome deve ter no máximo ${MAX_STRING} caracteres`)
    .regex(NAME_REGEX, "Nome deve conter apenas letras e espaços")
    .optional(),
  
  email: z.email("Email inválido")
    .trim()
    .max(MAX_STRING, `Email deve ter no máximo ${MAX_STRING} caracteres`)
    .optional(),
  
  foto: z.string()
    .trim()
    .max(MAX_STRING, `Nome da foto deve ter no máximo ${MAX_STRING} caracteres`)
    .optional()
});

// ===== Mudança de Senha =====
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, "Senha atual é obrigatória"),
  
  newPassword: z.string()
    .min(8, "Nova senha deve ter pelo menos 8 caracteres")
    .max(MAX_STRING, `Nova senha deve ter no máximo ${MAX_STRING} caracteres`)
    .regex(PASSWORD_REGEX, "Nova senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 número"),
  
  confirmPassword: z.string()
    .min(1, "Confirmação de senha é obrigatória")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});
