import { cmsApi } from '@/lib/paths';
import { LoginData, RegisterData, User } from '@/types/auth/types';

export async function registerServiceCMS(userData: RegisterData | undefined) {
  if (!userData) throw new Error('No user data provided.');

  const url = cmsApi.AUTH_LOCAL_REGISTER;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.log('Error registering user:', error);
    throw error;
  }
}

export async function loginServiceCMS(userData: LoginData | undefined) {
  if (!userData) throw new Error('No user data provided.');

  const url = cmsApi.AUTH_LOCAL;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.log('Error loging user:', error);
    throw error;
  }
}

/**
 * Obtiene el usuario actual validando el token contra el CMS
 * @param token - JWT token
 * @returns Usuario si el token es válido, null si no lo es
 */
export async function getMeServiceCMS(
  token: string
): Promise<{ user: User | null; error?: { status: number; message: string } }> {
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
      return {
        user: null,
        error: {
          status: 401,
          message: 'Token inválido',
        },
      };
    }

    return { user };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return {
      user: null,
      error: {
        status: 500,
        message: 'Error de conexión con el servidor',
      },
    };
  }
}
