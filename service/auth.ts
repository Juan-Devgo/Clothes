'use server';

import {
  CurrentUser,
  LoginData,
  RegisterData,
  UserDataVerifyCode,
} from '@/types/auth/types';
import { cookies } from 'next/headers';
import { getMeServiceCMS, loginServiceCMS, registerServiceCMS } from './cms';
import { jwtName, userDataVerifyCodeName } from '@/lib/jwt';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Función cacheada que obtiene el usuario desde el CMS.
 * Se cachea por token para evitar llamadas repetidas al CMS.
 * Usa el perfil 'hours' (revalidate cada hora, stale por 5 minutos).
 */
async function getCachedUser(token: string): Promise<CurrentUser> {
  'use cache';
  cacheLife('hours');
  cacheTag(`user-${token.substring(0, 16)}`); // Tag basado en parte del token para invalidación

  const result = await getMeServiceCMS(token);
  return result;
}

/**
 * Obtiene el usuario actual validando el token contra el CMS
 * Usar esta función en Server Components o Server Actions que necesiten datos del usuario
 *
 * La función lee las cookies (runtime) fuera del scope cacheado y pasa el token
 * como argumento a la función cacheada.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(jwtName)?.value;

  if (!token) {
    return {
      user: null,
      error: { status: 401, message: 'No hay sesión activa' },
    };
  }

  const result = await getCachedUser(token);

  // Si el token es inválido, eliminar la cookie
  if (!result.user && result.error) {
    cookieStore.delete(jwtName);
  }

  return result;
}

/**
 * Función para obtener la información del usuario almacenada en la cookie temporal
 * para verificar el código de verificación (registro o reseteo de contraseña)
 *
 * NOTA: No elimina la cookie aquí porque cookies().delete() solo funciona en Server Actions.
 * La cookie debe eliminarse en el Server Action de verificación.
 */
export async function getUserDataVerifyCode(
  type: 'auth-register' | 'reset-password'
): Promise<UserDataVerifyCode | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(userDataVerifyCodeName)?.value;

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as UserDataVerifyCode;

    /**
     * Si el tipo es 'auth-register' y no hay contraseña, o si el tipo es 'reset-password' y hay contraseña,
     * entonces hay un error.
     * auth-register requiere la contraseña para registrar al usuario.
     * reset-password no requiere la contraseña para verificar el código.
     */

    if (
      !parsed ||
      parsed.type !== type ||
      !parsed.email ||
      (!parsed.password && type === 'auth-register') ||
      (parsed.password && type === 'reset-password')
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Elimina la cookie de datos de verificación.
 * Debe llamarse desde un Server Action después de verificar el código.
 */
export async function deleteUserDataVerifyCodeCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(userDataVerifyCodeName);
}

/**
 * Usan la implementación del CMS.
 * Se puede agregar otra implementación si se usa otro sistema de autenticación y cambiarse aquí.
 */
export async function loginService(userData: LoginData | undefined) {
  return loginServiceCMS(userData);
}

export async function registerService(userData: RegisterData | undefined) {
  return registerServiceCMS(userData);
}
