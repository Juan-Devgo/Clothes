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

/**
 * Obtiene el usuario actual validando el token contra el CMS
 * Usar esta función en Server Components o Server Actions que necesiten datos del usuario
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

  const result = await getMeServiceCMS(token);

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

    if (
      !parsed ||
      parsed.type !== type ||
      !parsed.email ||
      !parsed.username ||
      !parsed.password
    ) {
      console.log('Error parsing user data from cookie: Missing fields');
      return null;
    }

    return parsed;
  } catch (error) {
    console.log('Error parsing user data from cookie:', error);
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
