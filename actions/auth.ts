'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

import {
  loginService,
  registerService,
  deleteUserDataVerifyCodeCookie,
} from '@/service/auth';
import {
  LoginFormState,
  RegisterFormState,
  ResetPasswordFormState,
  VerifyUserFormState,
  ChangePasswordFormState,
  ChangePasswordAuthenticatedFormState,
} from '@/types/auth/forms';
import {
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  ChangePasswordAuthenticatedSchema,
} from '@/types/auth/schemas';
import z, { email } from 'zod';
import { cookiesConfig } from '@/lib/cookies-config';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/paths';
import { jwtName, userDataVerifyCodeName } from '@/lib/jwt';
import {
  checkUserExistsByEmail,
  sendAuthRegisterEmail,
  sendResetPasswordEmail,
  sendTestEmail,
  verifyCodeService,
} from '@/service/email';
import {
  changePasswordAuthenticatedServiceCMS,
  changePasswordServiceCMS,
} from '@/service/cms';

/**
 * Cierra la sesión del usuario eliminando el token
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(jwtName)?.value;

  if (!token) return;

  revalidateTag(`user-${token.substring(0, 16)}`, 'default');
  cookieStore.delete(jwtName);
  redirect(routes.HOME);
}

export async function registerAction(
  formData: FormData
): Promise<RegisterFormState> {
  const fields = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    passwordConfirm: formData.get('password-confirm') as string,
  };

  // Validación de los datos
  const validatedFields = RegisterSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: flattenedErrors.fieldErrors,
      cmsErrors: {},
    };
  }

  // Petición al CMS

  //Primero se verifica que no exista el usuario
  const userExistsResponse = await checkUserExistsByEmail(
    validatedFields.data.email
  );

  if (userExistsResponse.exists) {
    return {
      success: false,
      message: 'El correo electrónico ya está registrado.',
      data: fields,
      validationErrors: {},
      cmsErrors: { status: 409 },
    };
  }

  //Luego se envía el correo de verificación

  const sendVerifyEmailResponse = await sendTestEmail(
    validatedFields.data.email
  );

  console.log('Response from sendTestEmail:', sendVerifyEmailResponse);

  if (!sendVerifyEmailResponse || !sendVerifyEmailResponse.success) {
    return {
      success: false,
      message: 'Error enviando el correo de verificación.',
      data: fields,
      validationErrors: {},
      cmsErrors: sendVerifyEmailResponse?.error
        ? { status: 400, message: sendVerifyEmailResponse.error }
        : { status: 500 },
    };
  }

  const sendAuthRegisterEmailResponse = await sendAuthRegisterEmail({
    email: validatedFields.data.email,
    username: validatedFields.data.username,
  });

  console.log(
    'Response from sendAuthRegisterEmail:',
    sendAuthRegisterEmailResponse
  );

  if (!sendAuthRegisterEmailResponse || sendAuthRegisterEmailResponse.error) {
    return {
      success: false,
      message: 'Error enviando el correo de verificación.',
      data: fields,
      validationErrors: {},
      cmsErrors: sendAuthRegisterEmailResponse?.error ?? { status: 500 },
    };
  }

  // Guardar datos del usuario en cookies para la posterior verificación
  // si los datos fueron válidos y el correo se envió correctamente
  const cookieStore = await cookies();
  cookieStore.set(
    userDataVerifyCodeName,
    JSON.stringify({
      type: 'auth-register',
      email: fields.email,
      username: fields.username,
      password: fields.password,
    }),
    cookiesConfig
  );

  return {
    success: true,
    message: 'Datos válidos.',
    data: fields,
    validationErrors: {},
    cmsErrors: {},
  };
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ResetPasswordFormState> {
  const fields = {
    email: formData.get('email') as string,
  };

  // Validación de los datos
  const validatedFields = ResetPasswordSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: flattenedErrors.fieldErrors,
      cmsErrors: {},
    };
  }

  // Petición al CMS

  //Primero se verifica que exista el usuario

  const userExistsResponse = await checkUserExistsByEmail(
    validatedFields.data.email
  );

  if (!userExistsResponse.exists) {
    return {
      success: false,
      message: 'El correo electrónico no está registrado.',
      data: fields,
      validationErrors: {},
      cmsErrors: { status: 404 },
    };
  }

  //Luego se envía el correo de reseteo de contraseña

  const sendEmailResponse = await sendResetPasswordEmail({
    email: validatedFields.data.email,
    username: userExistsResponse.user?.username,
  });

  if (!sendEmailResponse || sendEmailResponse.error) {
    return {
      success: false,
      message: 'Error enviando el correo de reseteo de contraseña.',
      data: fields,
      validationErrors: {},
      cmsErrors: sendEmailResponse?.error ?? { status: 500 },
    };
  }

  // Guardar datos del usuario en cookies para la posterior verificación
  // si los datos fueron válidos y el correo se envió correctamente
  const cookieStore = await cookies();
  cookieStore.set(
    userDataVerifyCodeName,
    JSON.stringify({
      type: 'reset-password',
      email: validatedFields.data.email,
      username: userExistsResponse.user?.username,
    }),
    cookiesConfig
  );

  return {
    success: true,
    message: 'Correo de reseteo de contraseña enviado exitosamente.',
    data: fields,
    validationErrors: {},
    cmsErrors: {},
  };
}

export async function loginAction(formData: FormData): Promise<LoginFormState> {
  const fields = {
    identifier: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Validación de los datos
  const validatedFields = LoginSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: flattenedErrors.fieldErrors,
      cmsErrors: {},
    };
  }

  // Petición al CMS
  const response = await loginService(validatedFields.data);

  if (!response || response.error) {
    return {
      success: false,
      message: 'Error en el inicio de sesión.',
      data: fields,
      validationErrors: {},
      cmsErrors: response?.error ?? {},
    };
  }

  // Guardar el JWT en cookies si el login fue exitoso
  const cookieStore = await cookies();
  cookieStore.set(jwtName, response.jwt, cookiesConfig);

  return {
    success: true,
    message: 'Inicio de sesión exitoso.',
    data: fields,
    validationErrors: {},
    cmsErrors: {},
  };
}

export async function verifyUserAction(
  formData: FormData
): Promise<VerifyUserFormState> {
  const fields = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    type: formData.get('type') as 'auth-register',
    code: [
      formData.get('code-0') as string,
      formData.get('code-1') as string,
      formData.get('code-2') as string,
      formData.get('code-3') as string,
    ] as string[],
  };

  const fullCode = fields.code.join('');

  // Peticiones al CMS
  const verifyCodeResponse = await verifyCodeService({
    email: fields.email,
    type: fields.type,
    code: fullCode,
    markAsUsed: true,
  });

  if (!verifyCodeResponse || !verifyCodeResponse.result?.valid) {
    return {
      success: false,
      message: 'Código inválido o expirado.',
      data: fields,
      validationErrors: {},
      cmsErrors: verifyCodeResponse.status
        ? { status: verifyCodeResponse.status }
        : { status: 500 },
    };
  }

  const registerResponse = await registerService({
    username: fields.username,
    email: fields.email,
    password: fields.password,
  });

  if (!registerResponse || registerResponse.error) {
    return {
      success: false,
      message: 'Error en el registro.',
      data: fields,
      validationErrors: {},
      cmsErrors: registerResponse?.error ? { status: 409 } : { status: 500 },
    };
  }

  // Eliminar la cookie de datos temporales después del registro exitoso
  await deleteUserDataVerifyCodeCookie();

  return {
    success: true,
    message: 'Código verificado exitosamente.',
    data: fields,
    validationErrors: {},
    cmsErrors: {},
  };
}

export async function verifyResetPasswordCodeAction(
  formData: FormData
): Promise<ResetPasswordFormState> {
  const fields = {
    email: formData.get('email') as string,
    type: formData.get('type') as 'reset-password',
    code: [
      formData.get('code-0') as string,
      formData.get('code-1') as string,
      formData.get('code-2') as string,
      formData.get('code-3') as string,
    ] as string[],
  };

  console.log('Verifying reset password code with fields:', fields);

  const fullCode = fields.code.join('');

  // Petición al CMS

  const verifyCodeResponse = await verifyCodeService({
    email: fields.email,
    type: fields.type,
    code: fullCode,
    markAsUsed: false,
  });

  if (!verifyCodeResponse || !verifyCodeResponse.result?.valid) {
    return {
      success: false,
      message: 'Código inválido o expirado.',
      data: fields,
      validationErrors: {},
      cmsErrors: verifyCodeResponse.status
        ? { status: verifyCodeResponse.status }
        : { status: 500 },
    };
  }

  // Actualizar cookie de datos temporales con el código completo
  const cookieStore = await cookies();
  cookieStore.set(
    userDataVerifyCodeName,
    JSON.stringify({
      type: fields.type,
      email: fields.email,
      code: fields.code.join(''),
    }),
    cookiesConfig
  );

  return {
    success: true,
    message: 'Código verificado exitosamente.',
    data: fields,
    validationErrors: {},
    cmsErrors: {},
  };
}

/**
 * Server Action para eliminar la cookie de datos de verificación
 * Se usa cuando hay errores críticos y el usuario debe reiniciar el flujo
 */
export async function clearVerifyUserDataAction(): Promise<void> {
  await deleteUserDataVerifyCodeCookie();
}

export async function clearResetPasswordDataAction(): Promise<void> {
  await deleteUserDataVerifyCodeCookie();
}

/**
 * Server Action para cambiar la contraseña de un usuario autenticado
 * Requiere que el usuario esté logueado (token JWT en cookies)
 */
export async function changePasswordAuthenticatedAction(
  formData: FormData
): Promise<ChangePasswordAuthenticatedFormState> {
  const fields = {
    currentPassword: formData.get('current-password') as string,
    newPassword: formData.get('password') as string,
    newPasswordConfirm: formData.get('password-confirm') as string,
  };

  // Validación de los datos
  const validatedFields = ChangePasswordAuthenticatedSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: flattenedErrors.fieldErrors,
      cmsErrors: {},
    };
  }

  // Obtener token del usuario
  const cookieStore = await cookies();
  const token = cookieStore.get(jwtName)?.value;

  if (!token) {
    return {
      success: false,
      message: 'No estás autenticado.',
      data: fields,
      validationErrors: {},
      cmsErrors: { status: 401 },
    };
  }

  // Petición al CMS para cambiar contraseña
  const response = await changePasswordAuthenticatedServiceCMS(token, {
    currentPassword: validatedFields.data.currentPassword,
    password: validatedFields.data.password,
    passwordConfirmation: validatedFields.data.passwordConfirm,
  });

  if (!response.success) {
    return {
      success: false,
      message: response.error?.message || 'Error al cambiar la contraseña.',
      data: fields,
      validationErrors: {},
      cmsErrors: { status: response.error?.status || 500 },
    };
  }

  // Actualizar el token si Strapi devuelve uno nuevo
  if (response.jwt) {
    const { cookiesConfig } = await import('@/lib/cookies-config');
    cookieStore.set(jwtName, response.jwt, cookiesConfig);
  }

  return {
    success: true,
    message: 'Contraseña cambiada exitosamente.',
    data: fields,
    validationErrors: {},
    cmsErrors: {},
  };
}

/**
 * Server Action para restablecer la contraseña usando código de verificación
 * NO requiere autenticación ni contraseña actual (flujo forgot-password)
 * El código se obtiene de la cookie guardada durante la verificación
 */
export async function changePasswordAction(
  formData: FormData
): Promise<ChangePasswordFormState> {
  const fields = {
    email: formData.get('email') as string,
    newPassword: formData.get('new-password') as string,
    newPasswordConfirm: formData.get('new-password-confirm') as string,
    code: formData.get('code') as string,
  };

  // Validación de los datos
  const validatedFields = ChangePasswordSchema.safeParse({
    newPassword: fields.newPassword,
    newPasswordConfirm: fields.newPasswordConfirm,
  });

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: flattenedErrors.fieldErrors,
      cmsErrors: {},
    };
  }

  // Petición al CMS para restablecer contraseña
  const response = await changePasswordServiceCMS({
    email: fields.email,
    newPassword: validatedFields.data.newPassword,
    code: fields.code,
  });

  if (response.status === 400) {
    return {
      success: false,
      message: response.message || 'Error al restablecer la contraseña.',
      data: fields,
      validationErrors: {},
      cmsErrors: { status: response.status || 500 },
    };
  }

  // Limpiar la cookie de datos de verificación
  await deleteUserDataVerifyCodeCookie();

  return {
    success: true,
    message: 'Contraseña restablecida exitosamente.',
    data: fields,
    validationErrors: {},
    cmsErrors: {},
  };
}
