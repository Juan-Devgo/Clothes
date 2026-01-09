import { env as cmsEnv } from '@/lib/cms';
import { cmsApi } from '@/lib/paths';
import { EmailUser, VerifyCodeParams } from '@/types/auth/types';

export async function checkUserExistsByEmail(email: string | undefined) {
  if (!email) throw new Error('No email provided.');

  const url = `${cmsApi.USERS}?filters[email][$eq]=${encodeURIComponent(
    email
  )}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cmsEnv.CMS_API_KEY}`,
      },
    });

    const data = await response.json();

    // Si hay al menos un usuario en la respuesta, el usuario existe
    return {
      exists: Array.isArray(data) && data.length > 0,
      user: data[0] || null,
    };
  } catch (error) {
    console.log('Error checking if user exists by email:', error);
    throw error;
  }
}

export async function verifyCodeService(
  codeData: VerifyCodeParams | undefined
) {
  if (!codeData) throw new Error('No data provided.');

  const url = `${cmsApi.VERIFY_CODE}/${codeData.type}`;

  console.log('Verifying code with data:', codeData);

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

    console.log('Verify code response:', data);

    return data;
  } catch (error) {
    console.log('Error verifying code:', error);
    throw error;
  }
}

export async function sendAuthRegisterEmail(userData: EmailUser | undefined) {
  if (!userData) throw new Error('No user data provided.');

  const url = cmsApi.SEND_EMAIL_AUTH_REGISTER;

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

    return data;
  } catch (error) {
    console.log('Error sending authorization email for register:', error);
    throw error;
  }
}

export async function sendResetPasswordEmail(userData: EmailUser | undefined) {
  if (!userData) throw new Error('No user data provided.');

  const url = cmsApi.SEND_EMAIL_RESET_PASSWORD;

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

    return data;
  } catch (error) {
    console.log('Error sending reset password email:', error);
    throw error;
  }
}

/**
 * Envía un correo de prueba para verificar la configuración del servicio de email.
 * Útil para probar que el proveedor de email (SendGrid, Nodemailer, etc.) está correctamente configurado.
 *
 * @param to - Dirección de correo electrónico del destinatario
 * @param subject - Asunto del correo (opcional, por defecto: "Correo de prueba - Clothes Saldos Americanos")
 * @param message - Mensaje del correo (opcional, por defecto: mensaje de prueba genérico)
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

    if (!response.ok || data.error || !data.success) {
      console.log('Error response from email test:', data);
      return {
        success: false,
        error: data.error || 'Error al enviar correo de prueba',
        status: response.status,
      };
    }

    return {
      success: true,
      message: 'Correo de prueba enviado exitosamente',
      data,
    };
  } catch (error) {
    console.log('Error sending test email:', error);
    throw error;
  }
}
