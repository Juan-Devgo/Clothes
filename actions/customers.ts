'use server';

import { revalidatePath } from 'next/cache';
import { cmsApi } from '@/lib/paths';
import { cmsLogger } from '@/lib/logger';
import { Customer } from '@/types/domain/types';
import {
  getContent,
  postContent,
  putContent,
  deleteContent,
} from '@/service/cms';
import qs from 'qs';
import {
  createAccountForCustomerAction,
  deleteAccountAction,
} from './accounts';
import { z } from 'zod';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
} from '@/types/customer-view/schemas';
import {
  CreateCustomerFormState,
  UpdateCustomerFormState,
  DeleteCustomerFormState,
} from '@/types/customer-view/forms';

/**
 * Obtener la lista de clientes
 */
export async function getCustomersAction() {
  const query = qs.stringify(
    {
      populate: {
        account: {
          fields: ['documentId'],
        },
        sales: {
          fields: ['documentId'],
        },
        events: {
          fields: ['documentId'],
        },
      },
    },
    { encodeValuesOnly: true },
  );

  const content = await getContent(`${cmsApi.CUSTOMERS}?${query}`);
  return content?.data;
}

/**
 * Crear un nuevo cliente con su cuenta asociada
 */
export async function createCustomerAction(
  formData: FormData,
): Promise<CreateCustomerFormState> {
  cmsLogger.info(
    { email: formData.get('email') },
    'Action: Iniciando creación de cliente',
  );

  const fields = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: (formData.get('email') as string) || undefined,
    phone: formData.get('phone') as string,
    birthdate: (formData.get('birthdate') as string) || undefined,
    tastes: (formData.get('tastes') as string) || undefined,
  };

  // Validación de los datos
  const validatedFields = CreateCustomerSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    cmsLogger.warn(
      { errors: flattenedErrors.fieldErrors },
      'Action: Creación de cliente fallida: error de validación',
    );
    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: flattenedErrors.fieldErrors,
      cmsErrors: {},
    };
  }

  try {
    // 1. Crear el cliente
    const result = await postContent<Customer>(cmsApi.CUSTOMERS, {
      data: validatedFields.data,
    });

    if (!result.success || !result.data) {
      cmsLogger.error(
        { error: result.message },
        'Action: Error al crear el cliente en el CMS',
      );
      return {
        success: false,
        message: 'Error al crear el cliente.',
        data: fields,
        validationErrors: {},
        cmsErrors: { status: 500, message: result.message },
      };
    }

    const newCustomer = result.data;
    cmsLogger.info(
      { customerId: newCustomer.documentId },
      'Action: Cliente creado exitosamente',
    );

    let accountId: string | undefined;

    // 2. Crear la cuenta asociada al cliente
    if (newCustomer.documentId) {
      const accountResult = await createAccountForCustomerAction(
        newCustomer.documentId,
      );

      if (accountResult.success) {
        accountId = accountResult.accountId;
        cmsLogger.info(
          { accountId: accountResult.accountId },
          'Action: Cuenta creada para el cliente',
        );
      } else {
        cmsLogger.warn(
          { error: accountResult.error },
          'Action: Error creando cuenta para el cliente',
        );
      }
    }

    revalidatePath('/control-panel/customers');

    cmsLogger.info(
      { customerId: newCustomer.documentId },
      'Action: Creación de cliente completada exitosamente',
    );
    return {
      success: true,
      message: 'Cliente creado exitosamente.',
      data: fields,
      validationErrors: {},
      cmsErrors: {},
      customerId: newCustomer.documentId,
      accountId,
    };
  } catch (error) {
    cmsLogger.error({ error }, 'Action: Error de conexión creando cliente');
    return {
      success: false,
      message: 'Error de conexión con el servidor.',
      data: fields,
      validationErrors: {},
      cmsErrors: { status: 500 },
    };
  }
}

/**
 * Actualizar un cliente existente
 */
export async function updateCustomerAction(
  formData: FormData,
): Promise<UpdateCustomerFormState> {
  const documentId = formData.get('documentId') as string;

  cmsLogger.info({ documentId }, 'Action: Iniciando actualización de cliente');

  const fields = {
    documentId,
    first_name: (formData.get('first_name') as string) || undefined,
    last_name: (formData.get('last_name') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    birthdate: (formData.get('birthdate') as string) || undefined,
    tastes: (formData.get('tastes') as string) || undefined,
  };

  // Validar documentId
  if (!documentId) {
    cmsLogger.warn('Action: Actualización fallida: documentId requerido');
    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: { documentId: ['El ID del cliente es requerido'] },
      cmsErrors: {},
    };
  }

  // Validación de los datos
  const validatedFields = UpdateCustomerSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    cmsLogger.warn(
      { errors: flattenedErrors.fieldErrors },
      'Action: Actualización de cliente fallida: error de validación',
    );
    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: flattenedErrors.fieldErrors,
      cmsErrors: {},
    };
  }

  try {
    const result = await putContent<Customer>(
      `${cmsApi.CUSTOMERS}/${documentId}`,
      { data: validatedFields.data },
    );

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        'Action: Error al actualizar el cliente en el CMS',
      );
      return {
        success: false,
        message: 'Error al actualizar el cliente.',
        data: fields,
        validationErrors: {},
        cmsErrors: { status: 500, message: result.message },
      };
    }

    cmsLogger.info({ documentId }, 'Action: Cliente actualizado exitosamente');

    revalidatePath('/control-panel/customers');

    return {
      success: true,
      message: 'Cliente actualizado exitosamente.',
      data: fields,
      validationErrors: {},
      cmsErrors: {},
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      'Action: Error de conexión actualizando cliente',
    );
    return {
      success: false,
      message: 'Error de conexión con el servidor.',
      data: fields,
      validationErrors: {},
      cmsErrors: { status: 500 },
    };
  }
}

/**
 * Obtener un cliente por su documentId
 */
async function getCustomerById(documentId: string): Promise<Customer | null> {
  try {
    const query = qs.stringify(
      {
        populate: {
          account: {
            fields: ['documentId'],
          },
        },
      },
      { encodeValuesOnly: true },
    );

    const result = await getContent<Customer>(
      `${cmsApi.CUSTOMERS}/${documentId}?${query}`,
    );

    if (!result.success) return null;

    return result.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Eliminar un cliente
 */
export async function deleteCustomerAction(
  formData: FormData,
): Promise<DeleteCustomerFormState> {
  const documentId = formData.get('documentId') as string;

  cmsLogger.info({ documentId }, 'Action: Iniciando eliminación de cliente');

  const fields = { documentId };

  // Validar documentId
  if (!documentId) {
    cmsLogger.warn('Action: Eliminación fallida: documentId requerido');
    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: { documentId: ['El ID del cliente es requerido'] },
      cmsErrors: {},
    };
  }

  try {
    // 1. Buscar el cliente para obtener el documentId de su cuenta
    const customer = await getCustomerById(documentId);

    if (!customer) {
      cmsLogger.warn({ documentId }, 'Action: Cliente no encontrado');
      return {
        success: false,
        message: 'Cliente no encontrado.',
        data: fields,
        validationErrors: {},
        cmsErrors: { status: 404 },
      };
    }

    // 2. Eliminar la cuenta asociada al cliente (si existe)
    const accountDocumentId = (
      customer as Customer & { account?: { documentId: string } }
    ).account?.documentId;

    if (accountDocumentId) {
      const accountResult = await deleteAccountAction(accountDocumentId);

      if (!accountResult.success) {
        cmsLogger.warn(
          { error: accountResult.error },
          'Action: Error eliminando cuenta asociada al cliente',
        );
        // Continuamos con la eliminación del cliente aunque falle la cuenta
      } else {
        cmsLogger.info(
          { accountId: accountDocumentId },
          'Action: Cuenta asociada eliminada',
        );
      }
    }

    // 3. Eliminar el cliente
    const result = await deleteContent(`${cmsApi.CUSTOMERS}/${documentId}`);

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        'Action: Error al eliminar el cliente en el CMS',
      );
      return {
        success: false,
        message: 'Error al eliminar el cliente.',
        data: fields,
        validationErrors: {},
        cmsErrors: { status: 500, message: result.message },
      };
    }

    cmsLogger.info({ documentId }, 'Action: Cliente eliminado exitosamente');

    revalidatePath('/control-panel/customers');

    return {
      success: true,
      message: 'Cliente eliminado exitosamente.',
      data: fields,
      validationErrors: {},
      cmsErrors: {},
    };
  } catch (error) {
    cmsLogger.error({ error }, 'Action: Error de conexión eliminando cliente');
    return {
      success: false,
      message: 'Error de conexión con el servidor.',
      data: fields,
      validationErrors: {},
      cmsErrors: { status: 500 },
    };
  }
}
