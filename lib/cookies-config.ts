import { env } from './paths';

// Extraer solo el hostname del APP_URL (sin protocolo ni puerto)
const getDomain = () => {
  try {
    const url = new URL(env.APP_URL);
    // En localhost, no especificar domain para evitar problemas
    return url.hostname === 'localhost' ? undefined : url.hostname;
  } catch {
    return undefined;
  }
};

export const cookiesConfig = {
  maxAge: 60 * 60 * 14, // 14 horas
  path: '/',
  domain: getDomain(),
  secure: env.APP_URL.startsWith('https://'),
  httpOnly: true,
};
