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
