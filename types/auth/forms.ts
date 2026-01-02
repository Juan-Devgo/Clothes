import { LoginData, RegisterData, User, VerifyCodeData } from './types';
import { ValidationErrors, CmsErrors } from './errors';

/**
 * Estados de formularios (Server Actions responses)
 */

export interface FormState<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  validationErrors?: ValidationErrors;
  cmsErrors?: CmsErrors;
}

/**
 * Mapeo de códigos HTTP a mensajes de error personalizados
 */
export type CmsErrorMessages = Partial<Record<number, string>> & {
  default?: string;
};

/**
 * Configuración para el hook useAuthForm
 */
export interface UseAuthFormConfig<T extends FormState = FormState> {
  action: (formData: FormData) => T | Promise<T>;
  onSuccess?: (message: string) => Promise<void> | void;
  /** Retorna true si ya manejó el toast, false/void para que useAuthForm muestre el toast */
  onCmsError?: (error: CmsErrors) => boolean | void | Promise<boolean | void>;
  successMessage?: string;
  validationErrorMessage?: string;
  cmsErrorMessages?: CmsErrorMessages;
}

/**
 * LoginFormState: Se autentica y guarda JWT + usuario
 * Flujo: Login → Token guardado → Redirige a dashboard
 */
export interface LoginFormState extends FormState<LoginData> {
  token?: string; // JWT que se guarda en cookies/localStorage
  user?: User; // Datos del usuario autenticado
}

/**
 * RegisterFormState: Solo crea la cuenta, NO autentica
 * Flujo: Register → Cuenta creada → Redirige a login
 */
export interface RegisterFormState extends FormState<RegisterData> {
  // ❌ Sin token ni user aquí
  // El usuario debe ir a login después
  accountCreated?: boolean;
}

export interface ResetPasswordFormState extends FormState<VerifyCodeData> {}

export interface VerifyUserFormState extends FormState<VerifyCodeData> {}
