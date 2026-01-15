import { env as cmsEnv } from '@/lib/cms';
import { cmsApi } from '@/lib/paths';
import { EmailUser, VerifyCodeParams } from '@/types/auth/types';
import { emailLogger } from '@/lib/logger';

export async function checkUserExistsByEmail(email: string | undefined) {
  if (!email) throw new Error('No email provided.');

  const url = `${cmsApi.USERS}?filters[email][$eq]=${encodeURIComponent(
    email
  )}`;

  emailLogger.info({ email }, 'Email: Verificando si usuario existe');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cmsEnv.CMS_API_KEY}`,
      },
    });

    const data = await response.json();
    const exists = Array.isArray(data) && data.length > 0;

    emailLogger.info(
      { email, exists },
      'Email: Verificación de usuario completada'
    );
    return {
      exists,
      user: data[0] || null,
    };
  } catch (error) {
    emailLogger.error({ email, error }, 'Email: Error verificando usuario');
    throw error;
  }
}

export async function verifyCodeService(
  codeData: VerifyCodeParams | undefined
) {
  if (!codeData) throw new Error('No data provided.');

  const url = `${cmsApi.VERIFY_CODE}/${codeData.type}`;

  emailLogger.info(
    { email: codeData.email, type: codeData.type },
    'Email: Verificando código'
  );
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cmsEnv.CMS_API_KEY}`,
      },
      body: JSON.stringify(codeData),
    });

    const data = await response.json();

    emailLogger.info(
      { email: codeData.email, valid: data?.result?.valid },
      'Email: Verificación de código completada'
    );
    return data;
  } catch (error) {
    emailLogger.error(
      { email: codeData.email, error },
      'Email: Error verificando código'
    );
    throw error;
  }
}

export async function sendAuthRegisterEmail(userData: EmailUser | undefined) {
  if (!userData) throw new Error('No user data provided.');

  const url = cmsApi.SEND_EMAIL_AUTH_REGISTER;

  emailLogger.info(
    { email: userData.email },
    'Email: Enviando email de autorización de registro'
  );
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cmsEnv.CMS_API_KEY}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    emailLogger.info(
      { email: userData.email, success: !data.error },
      'Email: Envío de email de autorización completado'
    );
    return data;
  } catch (error) {
    emailLogger.error(
      { email: userData.email, error },
      'Email: Error enviando email de autorización'
    );
    throw error;
  }
}

export async function sendResetPasswordEmail(userData: EmailUser | undefined) {
  if (!userData) throw new Error('No user data provided.');

  const url = cmsApi.SEND_EMAIL_RESET_PASSWORD;

  emailLogger.info(
    { email: userData.email },
    'Email: Enviando email de reset password'
  );
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cmsEnv.CMS_API_KEY}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    emailLogger.info(
      { email: userData.email, success: !data.error },
      'Email: Envío de email de reset password completado'
    );
    return data;
  } catch (error) {
    emailLogger.error(
      { email: userData.email, error },
      'Email: Error enviando email de reset password'
    );
    throw error;
  }
}

/**
 * Envía un correo de prueba para verificar la configuración del servicio de email.
 * Útil para probar que el proveedor de email (SendGrid, Nodemailer, etc.) está correctamente configurado.
 *
 * @param to - Dirección de correo electrónico del destinatario
 * @returns Respuesta del CMS con el resultado del envío
 *
 * @example
 * // Uso básico
 * const result = await sendTestEmail('test@example.com');
 *
 * // Uso con opciones personalizadas
 * const result = await sendTestEmail('test@example.com', 'Mi asunto', 'Mi mensaje');
 */
export async function sendTestEmail(to: string) {
  if (!to) throw new Error('No email address provided.');

  const url = cmsApi.SEND_EMAIL_TEST;

  const emailData = { to };

  emailLogger.info({ to }, 'Email: Enviando email de prueba');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cmsEnv.CMS_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();

    if (!response.ok || data?.result?.error || !data?.result?.success) {
      emailLogger.warn(
        { to, status: response.status },
        'Email: Fallo en envío de email de prueba'
      );
      return {
        success: false,
        error: data.error || 'Error al enviar correo de prueba',
        status: response.status,
      };
    }

    emailLogger.info({ to }, 'Email: Email de prueba enviado exitosamente');
    return {
      success: true,
      message: 'Correo de prueba enviado exitosamente',
      data,
    };
  } catch (error) {
    emailLogger.error({ to, error }, 'Email: Error enviando email de prueba');
    throw error;
  }
}
