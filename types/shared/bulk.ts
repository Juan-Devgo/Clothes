import { FormState } from './forms';
import { z } from 'zod';

/**
 * Resultado de una operación bulk (crear/eliminar muchos registros)
 */
export interface BulkOperationResult {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  results: BulkOperationItemResult[];
}

export interface BulkOperationItemResult {
  index: number;
  success: boolean;
  message?: string;
  status?: number;
}

/**
 * Modo de carga masiva:
 * - 'append': Agrega los nuevos registros a los existentes
 * - 'replace': Elimina todos los registros existentes y los reemplaza por los nuevos
 */
export type BulkUploadMode = 'append' | 'replace';

/**
 * Estado del formulario de carga masiva
 */
export interface BulkUploadFormState extends FormState {
  created?: number;
  deleted?: number;
  failed?: number;
}

/**
 * Resultado de validación por fila, con detalle por campo.
 * Se usa para mostrar tabla de revisión con errores específicos.
 */
export interface ValidationRowResult {
  /** Número de fila como aparece en la plantilla (1, 2, 3...) */
  rowNumber: number;
  /** Datos crudos parseados del Excel */
  rawData: Record<string, unknown>;
  /** Si la fila pasó la validación */
  isValid: boolean;
  /** Errores por campo (clave = nombre del campo, valor = mensajes de error) */
  fieldErrors: Record<string, string[]>;
}

/**
 * Configuración genérica para entidades que soportan descarga masiva a Excel.
 */
export interface BulkDownloadEntityConfig<TRow> {
  /** Nombre legible de la entidad (usado en el nombre del archivo descargado) */
  entityName: string;

  /** Ruta a la plantilla Excel en /public (ej: "/excel_templates/clientes.xlsx") */
  templateUrl: string;

  /** Mapeo: nombre de columna en plantilla → clave del objeto de datos */
  columnMapping: Record<string, string>;

  /** Convierte un registro de dominio al objeto plano que se escribe en la plantilla */
  rowMapper: (row: TRow) => Record<string, unknown>;
}

/**
 * Configuración genérica para entidades que soportan carga masiva.
 * Cada entidad (Customer, Product, etc.) debe implementar esta interfaz
 * para poder usar el hook genérico de carga masiva.
 */
export interface BulkUploadEntityConfig<TRow> {
  /** Nombre legible de la entidad en singular */
  entityName: string;

  /** Etiquetas de columna para la tabla de revisión (clave campo → nombre visible) */
  columnLabels: Record<string, string>;

  /** Esquema Zod para validar cada fila del Excel */
  rowSchema: z.ZodType<TRow>;

  /** Acción del servidor para crear registros en bulk */
  bulkCreateAction: (records: TRow[]) => Promise<BulkUploadFormState>;

  /** Acción del servidor para eliminar todos los registros */
  deleteAllAction: () => Promise<BulkUploadFormState>;

  /** Servicio para parsear el archivo Excel y obtener filas crudas */
  parseExcelFile: (file: File) => Promise<Record<string, unknown>[]>;
}
