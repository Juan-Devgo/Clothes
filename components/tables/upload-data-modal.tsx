"use client";

import { useRef } from "react";
import { UploadIcon } from "../icons/upload";
import { DownloadIcon } from "../icons/download";
import WarningIcon from "../icons/warning";
import CheckedIcon from "../icons/checked";
import type { UseBulkUploadReturn } from "@/hooks/bulk";
import type { BulkUploadMode } from "@/types/shared/bulk";
import { downloadFileWithTimestamp } from "@/service/download";
import DataTable from "react-data-table-component";

interface UploadDataModalProps<TRow> {
  /** Estado y funciones del hook de carga masiva */
  bulkUpload: UseBulkUploadReturn<TRow>;
  /** Nombre de la entidad para mostrar en la UI */
  entityName: string;
  /** Ruta a la plantilla descargable (relativa a /public, ej: "/templates/clientes.xlsx") */
  templateUrl: string;
  /** Callback al cerrar el modal (tras completar o cancelar) */
  onClose: () => void;
}

export default function UploadDataModal<TRow>({
  bulkUpload,
  entityName,
  templateUrl,
  onClose,
}: UploadDataModalProps<TRow>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDownloadTemplate() {
    await downloadFileWithTimestamp({
      fileUrl: templateUrl,
      prefix: "plantilla",
      label: entityName,
    });
  }

  const {
    step,
    isPending,
    validCount,
    validationErrors,
    validationResults,
    columnLabels,
    handleFileSelect,
    handleUpload,
    handleContinueToUpload,
    reset,
  } = bulkUpload;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  function handleSelectMode(mode: BulkUploadMode) {
    handleUpload(mode);
  }

  function handleClose() {
    reset();
    onClose();
  }

  // Paso 1: Selección de archivo
  if (step === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center">
          <UploadIcon />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          Selección de datos de {entityName.toLowerCase()}
        </h3>

        <p className="text-gray-500 text-sm text-center max-w-md">
          Seleccione un archivo Excel (.xlsx) o CSV (.csv) con los datos a
          importar. Si necesita la plantilla puede descargarla aquí.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex-1 px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <DownloadIcon className="w-5 h-5" />
            Descargar Plantilla
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <UploadIcon />
            Seleccionar Archivo
          </button>
        </div>
      </div>
    );
  }

  // Paso 1.5: Revisión de validación (tabla con resultados detallados)
  if (step === "review") {
    // Construir filas para la tabla plana
    const reviewData = validationResults.map((result) => ({
      id: result.rowNumber,
      rowNumber: result.rowNumber,
      isValid: result.isValid,
      fieldErrors: result.fieldErrors,
      ...result.rawData,
    }));

    // Construir columnas dinámicamente a partir de columnLabels
    type ReviewRow = (typeof reviewData)[number];
    const reviewColumns = [
      {
        name: "#",
        selector: (row: ReviewRow) => row.rowNumber,
        width: "55px",
        style: { justifyContent: "center" },
        headerStyle: { justifyContent: "center" },
      },
      ...Object.entries(columnLabels).map(([key, label]) => ({
        name: label,
        grow: 1,
        cell: (row: ReviewRow) => {
          const fieldErr = row.fieldErrors[key];
          const hasError = fieldErr && fieldErr.length > 0;
          const raw = (row as Record<string, unknown>)[key];
          const value = raw != null ? String(raw) : "";

          if (hasError) {
            return (
              <span
                className="bg-red-300 text-red-900 rounded px-1.5 py-0.5 text-xs font-medium max-w-full truncate"
                title={fieldErr.join(", ")}
              >
                {value || "(vacío)"}
              </span>
            );
          }
          return (
            <span className="text-xs truncate max-w-full">{value || "—"}</span>
          );
        },
      })),
    ];

    return (
      <div className="flex flex-col gap-4 py-2">
        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              validationErrors.length > 0 ? "bg-amber-100" : "bg-green-100"
            }`}
          >
            {validationErrors.length > 0 ? <WarningIcon /> : <CheckedIcon />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Resultado de validación
            </h3>
            <p className="text-gray-500 text-sm">
              <span className="text-green-700 font-medium">{validCount}</span>{" "}
              registros válidos
              {validationErrors.length > 0 && (
                <>
                  {", "}
                  <span className="text-red-600 font-medium">
                    {validationErrors.length}
                  </span>{" "}
                  con errores
                </>
              )}
            </p>
          </div>
        </div>

        {/* Leyenda de colores */}
        <div className="flex gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: "#dcfce7" }}
            />
            Válido
          </span>
          {validationErrors.length > 0 && (
            <>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: "#fee2e2" }}
                />
                Fila con error
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: "#fca5a5" }}
                />
                Campo con error
              </span>
            </>
          )}
        </div>

        {/* Tabla de resultados */}
        <div className="max-h-72 overflow-auto border border-gray-200 rounded-lg">
          <DataTable
            columns={reviewColumns}
            data={reviewData}
            dense
            fixedHeader
            fixedHeaderScrollHeight="280px"
            conditionalRowStyles={[
              {
                when: (row: ReviewRow) => row.isValid,
                style: { backgroundColor: "#dcfce7" },
              },
              {
                when: (row: ReviewRow) => !row.isValid,
                style: { backgroundColor: "#fee2e2" },
              },
            ]}
            noDataComponent={
              <p className="text-gray-400 py-4">No hay datos para mostrar</p>
            }
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleContinueToUpload}
            disabled={validCount === 0}
            className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckedIcon />
            Continuar con {validCount} registros
          </button>
        </div>
      </div>
    );
  }

  // Paso 2: Archivo validado - preguntar modo
  if (step === "validated") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckedIcon />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          Archivo validado
        </h3>

        <p className="text-gray-600 text-sm text-center">
          Se encontraron <strong>{validCount}</strong> registros válidos
          {validationErrors.length > 0 && (
            <span className="text-amber-600">
              {" "}
              y <strong>{validationErrors.length}</strong> con errores (serán
              omitidos)
            </span>
          )}
          .
        </p>

        {/* Mostrar errores de validación si los hay */}
        {validationErrors.length > 0 && (
          <div className="w-full max-h-32 overflow-auto bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-amber-800 mb-1">
              Filas con errores:
            </p>
            {validationErrors.slice(0, 10).map((err) => (
              <div key={err.row} className="text-amber-700">
                <span className="font-medium">Fila {err.row}:</span>{" "}
                {err.errors.join(", ")}
              </div>
            ))}
            {validationErrors.length > 10 && (
              <p className="text-amber-600 mt-1">
                ...y {validationErrors.length - 10} filas más con errores.
              </p>
            )}
          </div>
        )}

        <p className="text-gray-500 text-sm text-center max-w-md">
          ¿Desea <strong>agregar</strong> estos registros a los existentes o{" "}
          <strong>reemplazar</strong> todos los datos actuales?
        </p>

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode("append")}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Agregar
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode("replace")}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Reemplazar Todo
          </button>
        </div>
      </div>
    );
  }

  // Paso 3: Subiendo
  if (step === "uploading") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <span className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
        <h3 className="text-lg font-semibold text-gray-900">
          Procesando datos...
        </h3>
        <p className="text-gray-500 text-sm">
          Esto puede tomar unos momentos. No cierre esta ventana.
        </p>
      </div>
    );
  }

  // Paso 4: Resultado final
  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckedIcon />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          Carga completada
        </h3>

        <p className="text-gray-500 text-sm text-center">
          Los datos se han procesado correctamente.
        </p>

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckedIcon />
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <WarningIcon />
      <p className="text-gray-500">Estado desconocido.</p>
      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
