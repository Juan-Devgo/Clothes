import crypto from 'crypto';

/**
 * Utilidades de encriptación simétrica AES-256-CBC
 * Se usa para encriptar datos sensibles (como contraseñas) antes de guardarlos en cookies
 *
 * IMPORTANTE: La clave ENCRYPTION_KEY debe estar definida en .env y tener exactamente 32 caracteres
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV_LENGTH = 16; // Para AES, siempre 16 bytes

/**
 * Encripta un texto usando AES-256-CBC
 * @param text - Texto plano a encriptar
 * @returns Texto encriptado en formato "iv:encryptedData" (hex)
 */
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY debe estar definida y tener exactamente 32 caracteres'
    );
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Retorna IV + texto encriptado separados por ':'
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Desencripta un texto encriptado con la función encrypt()
 * @param encryptedText - Texto encriptado en formato "iv:encryptedData" (hex)
 * @returns Texto plano original
 */
export function decrypt(encryptedText: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY debe estar definida y tener exactamente 32 caracteres'
    );
  }

  const parts = encryptedText.split(':');

  if (parts.length !== 2) {
    throw new Error('Formato de texto encriptado inválido');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = parts[1];

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
