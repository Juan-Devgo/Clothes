'use server';

import { cookies } from 'next/headers';

import {
  loginService,
  registerService,
  deleteUserDataVerifyCodeCookie,
} from '@/service/auth';
import {
  LoginFormState,
  RegisterFormState,
  VerifyUserFormState,
} from '@/types/auth/forms';
import { LoginSchema, RegisterSchema } from '@/types/auth/schemas';
import z from 'zod';
import { cookiesConfig } from '@/lib/cookies-config';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/paths';
import { jwtName, userDataVerifyCodeName } from '@/lib/jwt';
import { checkUserExistsByEmail, sendAuthRegisterEmail, verifyCodeService } from '@/service/email';

/**
 * Cierra la sesión del usuario eliminando el token
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
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

  const response = await sendAuthRegisterEmail({
    email: validatedFields.data.email,
    username: validatedFields.data.username,
  });

  console.log('Response from sendAuthRegisterEmail:', response);

  if (!response || response.error) {
    return {
      success: false,
      message: 'Error enviando el correo de verificación.',
      data: fields,
      validationErrors: {},
      cmsErrors: response?.error ?? { status: 500 },
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
    type: formData.get('type') as 'reset-password' | 'auth-register',
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

/**
 * Server Action para eliminar la cookie de datos de verificación
 * Se usa cuando hay errores críticos y el usuario debe reiniciar el flujo
 */
export async function clearVerifyUserDataAction(): Promise<void> {
  await deleteUserDataVerifyCodeCookie();
}
