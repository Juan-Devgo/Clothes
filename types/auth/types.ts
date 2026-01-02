import z from 'zod';
import {
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyCodeSchema,
} from './schemas';

/**
 * Tipos derivados de los esquemas de Zod
 * Estos tipos son type-safe y se actualizan automáticamente con los esquemas
 */

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
export type VerifyCodeFormData = z.infer<typeof VerifyCodeSchema>;

/**
 * Tipos de datos para formularios
 */
export interface LoginData {
  identifier?: string;
  password?: string;
}

export interface RegisterData {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

export interface VerifyCodeData {
  username: string;
  email: string;
  password: string;
  type: 'reset-password' | 'auth-register' | undefined;
  code: string[];
}

/**
 * Tipos de usuario
 */
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser {
  user: User | null;
  error?: { status: number; message: string };
}

/**
 * Tipo para guardar datos del usuario en la cookie temporal durante la verificación de código
 */
export interface UserDataVerifyCode {
  type: 'auth-register' | 'reset-password';
  email: string;
  username: string;
  password: string;
}

/**
 * Tipos para enviar emails
 */
interface Code {
  code: string;
  expiresAt: Date;
}

export interface EmailUser {
  username: string;
  email: string;
  registrationCode?: Code;
  resetCode?: Code;
}

export interface VerifyCodeParams {
  email: string;
  code: string;
  type: 'auth-register' | 'reset-password';
}
