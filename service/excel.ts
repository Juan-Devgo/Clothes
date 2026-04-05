/**
 * Servicio genérico de Excel
 *
 * Parsea archivos Excel (.xlsx) y CSV (.csv) según la estructura de plantilla del sistema:
 *
 * Estructura esperada de la plantilla (.xlsx):
 * ┌─────┬──────────────────┬──────────┬──────────┬──────────┬─────┐
 * │  A  │        B         │    C     │    D     │    E     │ ... │
 * ├─────┼──────────────────┼──────────┼──────────┼──────────┼─────┤
 * │  1  │ Tipo de Registro │  (Título mergeado de la plantilla)   │
 * │  2  │    <entidad>     │ Header1  │ Header2  │ Header3  │ ... │
 * │  3  │        1         │  dato    │  dato    │  dato    │ ... │
 * │  4  │        2         │  dato    │  dato    │  dato    │ ... │
 * └─────┴──────────────────┴──────────┴──────────┴──────────┴─────┘
 *
 * - Fila 1: Encabezado decorativo (se ignora)
 * - Fila 2, celda B: Tipo de entidad (ej: "Cliente", "Producto")
 * - Fila 2, columnas C en adelante: Nombres de columna (headers de la plantilla)
 * - Fila 3+, columna A: Números guía (se ignoran)
 * - Fila 3+, columnas C en adelante: Datos de cada registro
 */

import type ExcelJS from 'exceljs';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Mapeo de nombre de columna en la plantilla → clave del objeto de salida.
 * Ejemplo: { 'Nombre': 'first_name', 'Apellido': 'last_name' }
 */
export type ColumnMapping = Record<string, string>;

/**
 * Transformador opcional por campo. Recibe el valor crudo de la celda
 * y devuelve el valor transformado para el objeto de salida.
 */
export type FieldTransformers = Record<string, (value: unknown) => unknown>;

/**
 * Configuración para parsear un archivo Excel de una entidad específica.
 */
export interface ExcelParseConfig {
  /** Mapeo: nombre de columna en plantilla → clave del objeto resultado */
  columnMapping: ColumnMapping;
  /** Transformadores opcionales por clave de salida */
  fieldTransformers?: FieldTransformers;
  /** Fila donde están los headers (1-indexed). Por defecto: 2 */
  headerRow?: number;
  /** Primera fila de datos (1-indexed). Por defecto: 3 */
  dataStartRow?: number;
  /** Columna donde empiezan los headers/datos (1-indexed). Por defecto: 3 (columna C) */
  dataStartCol?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extrae el valor primitivo de una celda de ExcelJS */
function getCellValue(cell: ExcelJS.Cell): unknown {
  const val = cell.value;
  if (val === null || val === undefined) return undefined;

  // ExcelJS puede devolver objetos ricos (RichText, Hyperlink, Formula, etc.)
  if (typeof val === 'object') {
    // Fecha
    if (val instanceof Date) return val.toISOString().split('T')[0];
    // Texto enriquecido
    if ('richText' in val) {
      return (val as ExcelJS.CellRichTextValue).richText
        .map((rt) => rt.text)
        .join('');
    }
    // Fórmula
    if ('result' in val) return (val as ExcelJS.CellFormulaValue).result;
    // Hipervínculo
    if ('text' in val) return (val as ExcelJS.CellHyperlinkValue).text;
    return String(val);
  }

  return val;
}

// ─── Servicio principal ───────────────────────────────────────────────────────

/**
 * Parsea un archivo Excel (.xlsx) y devuelve las filas como objetos
 * según la configuración de columnas de la entidad.
 *
 * Recorre la hoja como una matriz: por cada fila de datos lee celda a celda
 * usando las posiciones de los headers mapeados.
 *
 * @param file   - Archivo .xlsx subido por el usuario
 * @param config - Configuración con el mapeo de columnas de la entidad
 * @returns Array de objetos donde cada clave es el atributo de la entidad
 */
export async function parseExcelFile(
  file: File,
  config: ExcelParseConfig,
): Promise<Record<string, unknown>[]> {
  const {
    columnMapping,
    fieldTransformers = {},
    headerRow = 2,
    dataStartRow = 3,
    dataStartCol = 3,
  } = config;

  const { default: ExcelLib } = await import('exceljs');
  const workbook = new ExcelLib.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('El archivo no contiene hojas de cálculo.');

  // 1. Leer los headers de la fila indicada (columna dataStartCol en adelante)
  const headerRowData = worksheet.getRow(headerRow);
  const headerMap: Map<number, string> = new Map(); // colNumber → key del objeto

  headerRowData.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    if (colNumber < dataStartCol) return;

    const headerName = String(cell.value ?? '').trim();
    const mappedKey = columnMapping[headerName];
    if (mappedKey) {
      headerMap.set(colNumber, mappedKey);
    }
  });

  if (headerMap.size === 0) {
    throw new Error(
      'No se encontraron columnas reconocidas en la plantilla. ' +
        'Verifique que los nombres de las columnas coincidan con la plantilla esperada.',
    );
  }

  // 2. Recorrer filas de datos como una matriz
  const rows: Record<string, unknown>[] = [];
  const totalRows = worksheet.rowCount;

  for (let rowIdx = dataStartRow; rowIdx <= totalRows; rowIdx++) {
    const row = worksheet.getRow(rowIdx);
    const obj: Record<string, unknown> = {};
    let hasData = false;

    for (const [colIdx, key] of headerMap) {
      const cell = row.getCell(colIdx);
      const rawValue = getCellValue(cell);

      // Verificar si hay dato antes de aplicar transformadores
      if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        hasData = true;
      }

      // Aplicar transformador si existe
      const value = fieldTransformers[key]
        ? fieldTransformers[key](rawValue)
        : rawValue;

      obj[key] = value;
    }

    // Parar al encontrar la primera fila completamente vacía
    if (!hasData) {
      break;
    }

    rows.push(obj);
  }

  return rows;
}

/**
 * Parsea un archivo CSV (.csv) y devuelve las filas como objetos
 * según la configuración de columnas de la entidad.
 *
 * Nota: Los CSV no mantienen la estructura visual de la plantilla Excel.
 * Se asume que la primera fila son headers y las siguientes son datos.
 *
 * @param file   - Archivo .csv subido por el usuario
 * @param config - Configuración con el mapeo de columnas de la entidad
 * @returns Array de objetos donde cada clave es el atributo de la entidad
 */
export async function parseCsvFile(
  file: File,
  config: ExcelParseConfig,
): Promise<Record<string, unknown>[]> {
  const { columnMapping, fieldTransformers = {} } = config;

  const text = await file.text();
  const lines = text.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('El archivo CSV no contiene datos suficientes.');
  }

  // Primera fila: headers
  const headers = lines[0].split(',').map((h) => h.trim());

  // Mapear posiciones de columna
  const headerMap: Map<number, string> = new Map();
  headers.forEach((header, idx) => {
    const mappedKey = columnMapping[header];
    if (mappedKey) {
      headerMap.set(idx, mappedKey);
    }
  });

  if (headerMap.size === 0) {
    throw new Error(
      'No se encontraron columnas reconocidas en el CSV. ' +
        'Verifique que los nombres de las columnas coincidan con la plantilla esperada.',
    );
  }

  // Recorrer filas de datos
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const obj: Record<string, unknown> = {};
    let hasData = false;

    for (const [colIdx, key] of headerMap) {
      const rawValue: unknown = values[colIdx] || undefined;

      // Verificar si hay dato antes de aplicar transformadores
      if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        hasData = true;
      }

      const value = fieldTransformers[key]
        ? fieldTransformers[key](rawValue)
        : rawValue;

      obj[key] = value;
    }

    if (hasData) {
      rows.push(obj);
    }
  }

  return rows;
}

// ─── Escritura en plantilla ───────────────────────────────────────────────────

/**
 * Configuración para rellenar una plantilla Excel existente con datos.
 */
export interface ExcelFillConfig {
  /** Mapeo: nombre de columna en plantilla → clave del objeto de datos */
  columnMapping: ColumnMapping;
  /** Fila donde están los headers (1-indexed). Por defecto: 2 */
  headerRow?: number;
  /** Primera fila de datos (1-indexed). Por defecto: 3 */
  dataStartRow?: number;
  /** Columna donde empiezan los headers/datos (1-indexed). Por defecto: 3 (columna C) */
  dataStartCol?: number;
  /** Columna para numeración de filas (1-indexed). 0 para omitir. Por defecto: 1 (columna A) */
  rowNumberCol?: number;
}

/**
 * Carga una plantilla Excel desde una URL, la rellena con los datos provistos
 * y devuelve el archivo resultante como Blob para descarga.
 *
 * @param templateUrl - URL de la plantilla (ej: "/excel_templates/clientes.xlsx")
 * @param config      - Configuración de columnas de la entidad
 * @param data        - Array de objetos con los datos a insertar
 * @returns Blob del archivo Excel generado
 */
export async function fillExcelTemplate(
  templateUrl: string,
  config: ExcelFillConfig,
  data: Record<string, unknown>[],
): Promise<Blob> {
  const {
    columnMapping,
    headerRow = 2,
    dataStartRow = 3,
    dataStartCol = 3,
    rowNumberCol = 1,
  } = config;

  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error('No se pudo cargar la plantilla de Excel.');
  }

  const buffer = await response.arrayBuffer();
  const { default: ExcelLib } = await import('exceljs');
  const workbook = new ExcelLib.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('La plantilla no contiene hojas de cálculo.');

  // Construir mapa inverso: data key → número de columna
  const headerRowData = worksheet.getRow(headerRow);
  const colMap = new Map<string, number>(); // dataKey → colNumber

  headerRowData.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    if (colNumber < dataStartCol) return;
    const headerName = String(cell.value ?? '').trim();
    const dataKey = columnMapping[headerName];
    if (dataKey) {
      colMap.set(dataKey, colNumber);
    }
  });

  // Escribir cada fila de datos
  for (let i = 0; i < data.length; i++) {
    const rowIdx = dataStartRow + i;
    const row = worksheet.getRow(rowIdx);
    const record = data[i];

    if (rowNumberCol > 0) {
      row.getCell(rowNumberCol).value = i + 1;
    }

    for (const [dataKey, colNumber] of colMap) {
      const value = record[dataKey];
      row.getCell(colNumber).value =
        value !== undefined && value !== null
          ? (value as ExcelJS.CellValue)
          : null;
    }

    row.commit();
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ─── Parseo de archivos ───────────────────────────────────────────────────────

/**
 * Detecta el tipo de archivo y parsea usando la función correspondiente.
 *
 * @param file   - Archivo .xlsx o .csv subido por el usuario
 * @param config - Configuración con el mapeo de columnas de la entidad
 * @returns Array de objetos con los datos del archivo
 * @throws Error si el formato no es soportado
 */
export async function parseSpreadsheetFile(
  file: File,
  config: ExcelParseConfig,
): Promise<Record<string, unknown>[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.xlsx')) {
    return parseExcelFile(file, config);
  }

  if (name.endsWith('.csv')) {
    return parseCsvFile(file, config);
  }

  throw new Error('Formato de archivo no soportado. Use archivos .xlsx o .csv');
}
