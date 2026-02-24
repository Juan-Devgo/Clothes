/**
 * Tipos de errores para autenticación
 */

// CmsErrors se importa desde shared/forms (fuente canónica)
export type { CmsErrors } from '@/types/shared/forms';

export interface ValidationErrors {
  identifier?: string[];
  username?: string[];
  email?: string[];
  password?: string[];
  passwordConfirm?: string[];
  currentPassword?: string[];
  newPassword?: string[];
  newPasswordConfirm?: string[];
  code?: string[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
