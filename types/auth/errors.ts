/**
 * Tipos de errores para autenticación
 */

export interface CmsErrors {
  status?: number;
  name?: string;
  message?: string;
  details?: Record<string, string[]>;
}

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
