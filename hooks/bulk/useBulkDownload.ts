'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { BulkDownloadEntityConfig } from '@/types/shared/bulk';
import { fillExcelTemplate, type ExcelFillConfig } from '@/service/excel';

export interface UseBulkDownloadReturn<TRow> {
  /** Si hay una descarga en curso */
  isPending: boolean;

  /** Genera el archivo Excel con los datos provistos y lo descarga */
  handleDownload: (data: TRow[]) => Promise<void>;
}

function buildTimestampedFileName(entityName: string): string {
  const now = new Date();

  const date = now
    .toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');

  const time = now
    .toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/a\.\s?m\.?/i, 'A.M')
    .replace(/p\.\s?m\.?/i, 'P.M')
    .replace(' ', '-');

  return `${entityName.toLowerCase()} ${date} ${time}.xlsx`;
}

/**
 * Hook genérico para descarga masiva de datos a Excel.
 * Carga la plantilla de la entidad, la rellena con los datos y la descarga.
 */
export function useBulkDownload<TRow>(
  config: BulkDownloadEntityConfig<TRow>,
): UseBulkDownloadReturn<TRow> {
  const [isPending, setIsPending] = useState(false);

  const handleDownload = useCallback(
    async (data: TRow[]) => {
      if (!data || data.length === 0) {
        toast.error('No hay datos para descargar.');
        return;
      }

      setIsPending(true);

      try {
        const mappedData = data.map(config.rowMapper);

        const excelConfig: ExcelFillConfig = {
          columnMapping: config.columnMapping,
        };

        const blob = await fillExcelTemplate(
          config.templateUrl,
          excelConfig,
          mappedData,
        );

        const fileName = buildTimestampedFileName(config.entityName);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        toast.success(`${data.length} registros descargados correctamente.`);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Error al generar el archivo de descarga.';
        toast.error(message);
      } finally {
        setIsPending(false);
      }
    },
    [config],
  );

  return { isPending, handleDownload };
}
