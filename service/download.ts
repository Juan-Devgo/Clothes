export interface DownloadFileOptions {
  /** Ruta del archivo a descargar (URL relativa o absoluta) */
  fileUrl: string;
  /** Palabra opcional al inicio del nombre (ej: "plantilla") */
  prefix?: string;
  /** Texto opcional adicional para el nombre (ej: "clientes") */
  label?: string;
  /** Tipo/extensión de archivo (ej: "xlsx" o ".xlsx"). Si no se envía, se infiere de fileUrl */
  fileType?: string;
}

function getFileExtension(fileUrl: string, fileType?: string): string {
  if (fileType && fileType.trim().length > 0) {
    const normalized = fileType.trim().toLowerCase();
    return normalized.startsWith('.') ? normalized : `.${normalized}`;
  }

  const cleanUrl = fileUrl.split('?')[0].split('#')[0];
  const lastSegment = cleanUrl.split('/').pop() ?? '';
  const extMatch = lastSegment.match(/\.[a-z0-9]+$/i);

  return extMatch ? extMatch[0].toLowerCase() : '.xlsx';
}

function getReadableTimestamp() {
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

  return { date, time };
}

export async function downloadFileWithTimestamp({
  fileUrl,
  prefix,
  label,
  fileType,
}: DownloadFileOptions): Promise<string> {
  const ext = getFileExtension(fileUrl, fileType);
  const { date, time } = getReadableTimestamp();

  const leftPart = [prefix, label?.toLowerCase()]
    .filter(Boolean)
    .join('_')
    .trim();
  const fileName = `${leftPart ? `${leftPart} ` : ''}${date} ${time}${ext}`;

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error('No se pudo descargar el archivo solicitado.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  return fileName;
}
