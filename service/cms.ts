import { env as cmsEnv } from '@/lib/cms';
import { cmsApi } from '@/lib/paths';
import { LoginData, RegisterData, User } from '@/types/auth/types';
import { cmsLogger } from '@/lib/logger';
import { jwtName } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { getAuthToken } from './auth';
import { ContentResponse } from '@/types';

export async function registerServiceCMS(userData: RegisterData | undefined) {
  if (!userData) throw new Error('No user data provided.');

  const url = cmsApi.AUTH_LOCAL_REGISTER;
  cmsLogger.info(
    { email: userData.email },
    'CMS: Iniciando registro de usuario',
  );

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    cmsLogger.info(
      { email: userData.email, success: !data.error },
      'CMS: Registro completado',
    );
    return data;
  } catch (error) {
    cmsLogger.error({ email: userData.email, error }, 'CMS: Error en registro');
    throw error;
  }
}

export async function loginServiceCMS(userData: LoginData | undefined) {
  if (!userData) throw new Error('No user data provided.');

  const url = cmsApi.AUTH_LOCAL;
  cmsLogger.info({ email: userData.identifier }, 'CMS: Iniciando login');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    cmsLogger.info(
      { email: userData.identifier, success: !data.error },
      'CMS: Login completado',
    );
    return data;
  } catch (error) {
    cmsLogger.error(
      { email: userData.identifier, error },
      'CMS: Error en login',
    );
    throw error;
  }
}

/**
 * Obtiene el usuario actual validando el token contra el CMS
 * @param token - JWT token
 * @returns Usuario si el token es válido, null si no lo es
 */
export async function getMeServiceCMS(
  token: string,
): Promise<{ user: User | null; error?: { status: number; message: string } }> {
  cmsLogger.info('CMS: Obteniendo usuario actual');
  try {
    const response = await fetch(cmsApi.USERS_ME, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // No cachear la respuesta para siempre tener datos frescos
      cache: 'no-store',
    });

    if (!response.ok) {
      cmsLogger.warn(
        { status: response.status },
        'CMS: Token inválido o expirado',
      );
      return {
        user: null,
        error: {
          status: response.status,
          message: response.statusText,
        },
      };
    }

    const user: User = await response.json();

    // Si hay error en la respuesta del CMS
    if ('error' in user) {
      cmsLogger.warn('CMS: Token inválido en respuesta');
      return {
        user: null,
        error: {
          status: 401,
          message: 'Token inválido',
        },
      };
    }

    cmsLogger.info({ userId: user.id }, 'CMS: Usuario obtenido exitosamente');
    return { user };
  } catch (error) {
    cmsLogger.error({ error }, 'CMS: Error obteniendo usuario');
    return {
      user: null,
      error: {
        status: 500,
        message: 'Error de conexión con el servidor',
      },
    };
  }
}

/**
 * Cambia la contraseña de un usuario autenticado
 * Requiere el token JWT y la contraseña actual para verificación
 * @param token - JWT token del usuario
 * @param data - Datos con contraseña actual y nueva
 * @returns Respuesta de Strapi con JWT y usuario actualizados
 */
export async function changePasswordAuthenticatedServiceCMS(
  token: string,
  data: {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
  },
): Promise<{
  success: boolean;
  jwt?: string;
  user?: User;
  error?: { status: number; message: string };
}> {
  cmsLogger.info('CMS: Iniciando cambio de contraseña autenticado');
  try {
    const response = await fetch(cmsApi.AUTH_CHANGE_PASSWORD, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      cmsLogger.warn(
        { status: response.status },
        'CMS: Cambio contraseña fallido',
      );
      return {
        success: false,
        error: {
          status: response.status,
          message:
            responseData?.error?.message || 'Error al cambiar la contraseña',
        },
      };
    }

    cmsLogger.info('CMS: Cambio contraseña exitoso');
    return {
      success: true,
      jwt: responseData.jwt,
      user: responseData.user,
    };
  } catch (error) {
    cmsLogger.error({ error }, 'CMS: Error en cambio de contraseña');
    return {
      success: false,
      error: {
        status: 500,
        message: 'Error de conexión con el servidor',
      },
    };
  }
}

/**
 * Restablece la contraseña de un usuario usando el código de verificación
 * NO requiere autenticación ni contraseña actual (flujo forgot-password)
 * @param data - Código de verificación y nueva contraseña
 * @returns Respuesta de Strapi con JWT y usuario
 */
export async function changePasswordServiceCMS(data: {
  email: string;
  newPassword: string;
  code: string;
}): Promise<{
  status: number;
  message: string;
}> {
  cmsLogger.info(
    { email: data.email },
    'CMS: Iniciando restablecimiento de contraseña',
  );
  try {
    const response = await fetch(cmsApi.RESET_PASSWORD, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cmsEnv.CMS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    cmsLogger.info(
      { email: data.email, status: responseData.status },
      'CMS: Restablecimiento completado',
    );
    return responseData;
  } catch (error) {
    cmsLogger.error(
      { email: data.email, error },
      'CMS: Error en restablecimiento',
    );
    throw error;
  }
}

export async function getContent<T = unknown>(
  url: string,
): Promise<ContentResponse<T>> {
  const authToken = await getAuthToken();

  if (!authToken) {
    cmsLogger.warn({ url }, 'CMS: Token no encontrado - No autorizado');
    return {
      success: false,
      status: 401,
      message: 'No autorizado - Token no encontrado',
    };
  }

  cmsLogger.info({ url }, 'CMS: Obteniendo contenido');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      cmsLogger.warn(
        { url, status: response.status },
        'CMS: Error obteniendo contenido',
      );
      return {
        success: false,
        status: response.status,
        message: response.statusText,
      };
    }

    const data = await response.json();

    cmsLogger.info({ url }, 'CMS: Contenido obtenido exitosamente');
    return { success: true, data: data?.data ?? data };
  } catch (error) {
    cmsLogger.error({ url, error }, 'CMS: Error obteniendo contenido');
    throw error;
  }
}

export async function postContent<T = unknown>(
  url: string,
  body: unknown,
): Promise<ContentResponse<T>> {
  const authToken = await getAuthToken();

  if (!authToken) {
    cmsLogger.warn({ url }, 'CMS: Token no encontrado - No autorizado');
    return {
      success: false,
      status: 401,
      message: 'No autorizado - Token no encontrado',
    };
  }

  cmsLogger.info({ url }, 'CMS: Creando contenido');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      cmsLogger.warn(
        { url, status: response.status },
        'CMS: Error creando contenido',
      );
      return {
        success: false,
        status: response.status,
        message: responseData?.error?.message || response.statusText,
      };
    }

    cmsLogger.info({ url }, 'CMS: Contenido creado exitosamente');
    return { success: true, data: responseData.data };
  } catch (error) {
    cmsLogger.error({ url, error }, 'CMS: Error creando contenido');
    throw error;
  }
}

export async function putContent<T = unknown>(
  url: string,
  body: unknown,
): Promise<ContentResponse<T>> {
  const authToken = await getAuthToken();

  if (!authToken) {
    cmsLogger.warn({ url }, 'CMS: Token no encontrado - No autorizado');
    return {
      success: false,
      status: 401,
      message: 'No autorizado - Token no encontrado',
    };
  }

  cmsLogger.info({ url }, 'CMS: Actualizando contenido');

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      cmsLogger.warn(
        { url, status: response.status },
        'CMS: Error actualizando contenido',
      );
      return {
        success: false,
        status: response.status,
        message: responseData?.error?.message || response.statusText,
      };
    }

    cmsLogger.info({ url }, 'CMS: Contenido actualizado exitosamente');
    return { success: true, data: responseData.data };
  } catch (error) {
    cmsLogger.error({ url, error }, 'CMS: Error actualizando contenido');
    throw error;
  }
}

export async function deleteContent(
  url: string,
): Promise<{ success: boolean; status?: number; message?: string }> {
  const authToken = await getAuthToken();

  if (!authToken) {
    cmsLogger.warn({ url }, 'CMS: Token no encontrado - No autorizado');
    return {
      success: false,
      status: 401,
      message: 'No autorizado - Token no encontrado',
    };
  }

  cmsLogger.info({ url }, 'CMS: Eliminando contenido');

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const responseData = await response.json();
      cmsLogger.warn(
        { url, status: response.status },
        'CMS: Error eliminando contenido',
      );
      return {
        success: false,
        status: response.status,
        message: responseData?.error?.message || response.statusText,
      };
    }

    cmsLogger.info({ url }, 'CMS: Contenido eliminado exitosamente');
    return { success: true };
  } catch (error) {
    cmsLogger.error({ url, error }, 'CMS: Error eliminando contenido');
    throw error;
  }
}
