/**
 * Configuración centralizada de variables de entorno y rutas
 *
 * Este archivo sirve como punto único de acceso para:
 * - Variables de entorno
 * - Rutas de API
 * - Configuraciones globales
 *
 * Ventajas:
 * - Las variables se cargan UNA SOLA VEZ al iniciar la aplicación
 * - No se gasta recursos leyendo process.env múltiples veces
 * - Fácil de mantener y actualizar configuraciones
 * - Type-safe con TypeScript
 */

// Variables de entorno
export const env = {
  CMS_URL: process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Rutas de la aplicación
export const routes = {
  HOME: '/',
  CONTROL_PANEL: '/control-panel',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_VERIFY_USER: '/register/verify-user',
  RESET_PASSWORD: '/reset-password',
  RESET_PASSWORD_CODE: '/reset-password/enter-code',
  CHANGE_PASSWORD: '/reset-password/change-password',
} as const;

// Rutas de API del CMS
export const cmsApi = {
  BASE_URL: env.CMS_URL,
  AUTH_LOCAL: `${env.CMS_URL}/api/auth/local`,
  AUTH_LOCAL_REGISTER: `${env.CMS_URL}/api/auth/local/register`,
  AUTH_CHANGE_PASSWORD: `${env.CMS_URL}/api/auth/change-password`,
  RESET_PASSWORD: `${env.CMS_URL}/api/password-reset`,
  USERS: `${env.CMS_URL}/api/users`,
  USERS_ME: `${env.CMS_URL}/api/users/me`,
  VERIFY_CODE: `${env.CMS_URL}/api/mailer/verify-code`,
  SEND_EMAIL_AUTH_REGISTER: `${env.CMS_URL}/api/mailer/auth-register`,
  SEND_EMAIL_RESET_PASSWORD: `${env.CMS_URL}/api/mailer/reset-password`,
  SEND_EMAIL_TEST: `${env.CMS_URL}/api/mailer/test`,
} as const;

// Type-safe config object
export type Config = typeof env;
export type Routes = typeof routes;
export type CmsApi = typeof cmsApi;
