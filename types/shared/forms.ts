/**
 * Tipos genéricos de formularios compartidos
 * Reutilizables en auth, customer y otros módulos
 */

/**
 * Errores del CMS/API
 */
export interface CmsErrors {
  status?: number;
  name?: string;
  message?: string;
  details?: Record<string, string[]>;
}

/**
 * Errores de validación genéricos
 * Las claves son los nombres de los campos del formulario
 */
export type ValidationErrors<T = Record<string, string[]>> = Partial<T>;

/**
 * Estado genérico de formularios (Server Actions responses)
 * @template TData - Tipo de datos del formulario
 * @template TValidationErrors - Tipo de errores de validación específicos
 */
export interface FormState<
  TData = unknown,
  TValidationErrors = Record<string, string[]>,
> {
  success?: boolean;
  message?: string;
  data?: TData;
  validationErrors?: ValidationErrors<TValidationErrors>;
  cmsErrors?: CmsErrors;
}

/**
 * Mapeo de códigos HTTP a mensajes de error personalizados
 */
export type CmsErrorMessages = Partial<Record<number, string>> & {
  default?: string;
};

/**
 * Configuración base para hooks de formularios
 */
export interface UseFormConfig<T extends FormState = FormState> {
  action: (formData: FormData) => T | Promise<T>;
  onSuccess?: (message: string) => Promise<void> | void;
  /** Retorna true si ya manejó el toast, false/void para que el hook muestre el toast */
  onCmsError?: (error: CmsErrors) => boolean | void | Promise<boolean | void>;
  successMessage?: string;
  validationErrorMessage?: string;
  cmsErrorMessages?: CmsErrorMessages;
}
