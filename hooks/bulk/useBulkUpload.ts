'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  BulkUploadEntityConfig,
  BulkUploadMode,
  ValidationRowResult,
} from '@/types/shared/bulk';
import { z } from 'zod';

export type BulkUploadStep =
  | 'idle'
  | 'review'
  | 'validated'
  | 'uploading'
  | 'done';

export interface UseBulkUploadReturn<TRow> {
  /** Paso actual del flujo */
  step: BulkUploadStep;

  /** Datos validados listos para subir */
  validatedData: TRow[] | null;

  /** Si hay una transición en curso */
  isPending: boolean;

  /** Número de filas válidas tras la validación */
  validCount: number;

  /** Errores de validación por fila */
  validationErrors: { row: number; errors: string[] }[];

  /** Resultados detallados de validación (todas las filas con datos crudos y errores por campo) */
  validationResults: ValidationRowResult[];

  /** Etiquetas de columna para la tabla de revisión */
  columnLabels: Record<string, string>;

  /** Maneja la selección de archivo: valida con Zod y muestra resultado */
  handleFileSelect: (file: File) => Promise<void>;

  /** Ejecuta la carga masiva con el modo seleccionado */
  handleUpload: (mode: BulkUploadMode) => Promise<void>;

  /** Avanza del paso de revisión al paso de selección de modo */
  handleContinueToUpload: () => void;

  /** Reinicia el estado completo */
  reset: () => void;
}

/**
 * Hook genérico para carga masiva de datos desde Excel.
 * Recibe una configuración específica por entidad y gestiona todo el flujo:
 * 1. Parseo del archivo Excel
 * 2. Validación con Zod
 * 3. Subida al servidor (append o replace)
 */
export function useBulkUpload<TRow>(
  config: BulkUploadEntityConfig<TRow>,
): UseBulkUploadReturn<TRow> {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<BulkUploadStep>('idle');
  const [validatedData, setValidatedData] = useState<TRow[] | null>(null);
  const [validCount, setValidCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    { row: number; errors: string[] }[]
  >([]);
  const [validationResults, setValidationResults] = useState<
    ValidationRowResult[]
  >([]);

  const reset = useCallback(() => {
    setStep('idle');
    setValidatedData(null);
    setValidCount(0);
    setValidationErrors([]);
    setValidationResults([]);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validar extensión
      const name = file.name.toLowerCase();
      if (!name.endsWith('.xlsx') && !name.endsWith('.csv')) {
        toast.error('Formato no soportado. Use archivos .xlsx o .csv');
        return;
      }

      try {
        // 1. Parsear el archivo
        const rawRows = await config.parseExcelFile(file);

        if (!rawRows.length) {
          toast.error('El archivo no contiene datos.');
          return;
        }

        // 2. Validar cada fila con Zod y construir resultados detallados
        const validated: TRow[] = [];
        const errors: { row: number; errors: string[] }[] = [];
        const results: ValidationRowResult[] = [];

        for (let i = 0; i < rawRows.length; i++) {
          const result = config.rowSchema.safeParse(rawRows[i]);
          if (result.success) {
            validated.push(result.data as TRow);
            results.push({
              rowNumber: i + 1,
              rawData: rawRows[i],
              isValid: true,
              fieldErrors: {},
            });
          } else {
            const flattened = z.flattenError(result.error);

            // Errores detallados por campo
            const fieldErrors: Record<string, string[]> = {};
            for (const [field, msgs] of Object.entries(flattened.fieldErrors)) {
              fieldErrors[field] = msgs as string[];
            }

            const flatErrors = Object.entries(flattened.fieldErrors)
              .flatMap(([field, msgs]) =>
                (msgs as string[]).map((msg: string) => `${field}: ${msg}`),
              )
              .concat(flattened.formErrors ?? []);

            errors.push({
              row: i + 1,
              errors: flatErrors.length
                ? flatErrors
                : ['Error de validación desconocido'],
            });

            results.push({
              rowNumber: i + 1,
              rawData: rawRows[i],
              isValid: false,
              fieldErrors,
            });
          }
        }

        setValidationErrors(errors);
        setValidationResults(results);

        if (validated.length === 0) {
          toast.error(
            `Ninguna fila es válida. ${errors.length} filas con errores.`,
          );
          setStep('review');
          return;
        }

        setValidatedData(validated);
        setValidCount(validated.length);

        if (errors.length > 0) {
          setStep('review');
          toast.success(
            `${validated.length} filas válidas. ${errors.length} filas con errores.`,
          );
        } else {
          setStep('validated');
          toast.success(
            `Archivo validado exitosamente: ${validated.length} registros listos.`,
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Error al procesar el archivo.';
        toast.error(message);
        reset();
      }
    },
    [config, reset],
  );

  const handleContinueToUpload = useCallback(() => {
    setStep('validated');
  }, []);

  const handleUpload = useCallback(
    async (mode: BulkUploadMode) => {
      if (!validatedData || validatedData.length === 0) {
        toast.error('No hay datos validados para subir.');
        return;
      }

      setStep('uploading');

      await new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            // Si es reemplazo, eliminar todos los registros existentes primero
            if (mode === 'replace') {
              toast('Eliminando registros existentes...', { icon: '🗑️' });
              const deleteResult = await config.deleteAllAction();

              if (!deleteResult.success) {
                toast.error(
                  deleteResult.message ||
                    'Error al eliminar registros existentes.',
                );
                setStep('validated');
                resolve();
                return;
              }

              toast.success(
                `${deleteResult.deleted ?? 0} registros eliminados.`,
              );
            }

            // Crear los nuevos registros
            toast('Subiendo registros...', { icon: '📤' });
            const createResult = await config.bulkCreateAction(validatedData);

            if (createResult.success) {
              toast.success(
                createResult.message ||
                  `${createResult.created ?? 0} registros creados.`,
              );
              setStep('done');
              router.refresh();
            } else {
              toast.error(createResult.message || 'Error al crear registros.');
              if ((createResult.created ?? 0) > 0) {
                setStep('done');
                router.refresh();
              } else {
                setStep('validated');
              }
            }
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Error al realizar la operación.';
            toast.error(message);
            setStep('validated');
          } finally {
            resolve();
          }
        });
      });
    },
    [validatedData, config, router, startTransition],
  );

  return {
    step,
    validatedData,
    isPending,
    validCount,
    validationErrors,
    validationResults,
    columnLabels: config.columnLabels,
    handleFileSelect,
    handleUpload,
    handleContinueToUpload,
    reset,
  };
}
