import pino from 'pino';

/**
 * Logger centralizado usando Pino
 * Configurado para desarrollo y producción
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
});

/**
 * Logger específico para acciones de autenticación
 */
export const authLogger = logger.child({ module: 'auth' });

/**
 * Logger específico para servicios del CMS
 */
export const cmsLogger = logger.child({ module: 'cms' });

/**
 * Logger específico para servicios de email
 */
export const emailLogger = logger.child({ module: 'email' });

export default logger;
