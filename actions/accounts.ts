'use server';

import { ACCOUNT_STATES } from '@/lib/enums';
import { cmsLogger } from '@/lib/logger';
import { cmsApi } from '@/lib/paths';
import {
  getContent,
  postContent,
  putContent,
  deleteContent,
} from '@/service/cms';
import { Account } from '@/types';
import qs from 'qs';

type AccountActionResult = {
  success: boolean;
  data?: Account;
  error?: string;
};

/**
 * Obtener una cuenta por su ID de documento
 */
export async function getAccountById(
  documentId: string,
): Promise<AccountActionResult> {
  const query = qs.stringify(
    {
      populate: {
        customer: {
          fields: ['first_name', 'last_name'],
        },
        payments: {
          fields: ['amount', 'currency', 'createdAt'],
          populate: {
            method: {
              fields: ['type'],
            },
          },
        },
        state: {
          fields: ['name', 'label', 'description'],
        },
        products: {
          fields: ['quantity'],
          populate: {
            product: {
              fields: ['name', 'description', 'price', 'currency', 'stock'],
              populate: {
                category: {
                  fields: ['name', 'label'],
                },
                subcategory: {
                  fields: ['name', 'label'],
                },
                photo: {
                  fields: ['name', 'alternativeText', 'url', 'formats'],
                },
              },
            },
            state: {
              fields: ['name', 'label'],
            },
          },
        },
      },
    },
    { encodeValuesOnly: true },
  );

  try {
    const result = await getContent<Account>(
      `${cmsApi.ACCOUNTS}/${documentId}?${query}`,
    );

    if (!result.success) {
      return { success: false, error: 'Cuenta no encontrada' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    cmsLogger.error(
      { error },
      'Action: Error de conexión al obtener la cuenta',
    );
    return { success: false, error: 'Error de conexión al obtener la cuenta' };
  }
}

/**
 * Crear una cuenta para un cliente
 */
export async function createAccountForCustomerAction(
  customerDocumentId: string,
): Promise<{ success: boolean; accountId?: string; error?: string }> {
  try {
    // 1. Obtener el estado FREE para la cuenta
    const freeStateId = await ACCOUNT_STATES.FREE();
    if (!freeStateId) {
      cmsLogger.warn('Action: No se encontró el estado FREE para cuentas');
    }

    // 2. Crear la cuenta
    const result = await postContent<Account>(cmsApi.ACCOUNTS, {
      data: {
        amount: 0,
        currency: 'COP',
        customer: { connect: [customerDocumentId] },
        state: { connect: [freeStateId] },
      },
    });

    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Error al crear la cuenta',
      };
    }

    return { success: true, accountId: result.data?.documentId };
  } catch (error) {
    cmsLogger.error({ error }, 'Action: Error de conexión al crear la cuenta');
    return { success: false, error: 'Error de conexión al crear la cuenta' };
  }
}

/**
 * Actualizar una cuenta existente
 */
export async function updateAccountAction(
  documentId: string,
  accountData: Partial<Account>,
): Promise<AccountActionResult> {
  cmsLogger.info({ documentId, accountData }, 'Action: Actualizando cuenta');

  try {
    const result = await putContent<Account>(
      `${cmsApi.ACCOUNTS}/${documentId}`,
      { data: accountData },
    );

    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Error al actualizar la cuenta',
      };
    }

    cmsLogger.info({ documentId }, 'Action: Cuenta actualizada exitosamente');

    return { success: true, data: result.data };
  } catch (error) {
    cmsLogger.error({ error }, 'Action: Error de conexión actualizando cuenta');
    return { success: false, error: 'Error de conexión con el servidor' };
  }
}

/**
 * Eliminar una cuenta de un cliente
 */
export async function deleteAccountAction(
  documentId: string,
): Promise<{ success: boolean; error?: string }> {
  cmsLogger.info({ documentId }, 'Action: Eliminando cuenta');

  try {
    const result = await deleteContent(`${cmsApi.ACCOUNTS}/${documentId}`);

    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Error al eliminar la cuenta',
      };
    }

    cmsLogger.info({ documentId }, 'Action: Cuenta eliminada exitosamente');

    return { success: true };
  } catch (error) {
    cmsLogger.error({ error }, 'Action: Error de conexión eliminando cuenta');
    return { success: false, error: 'Error de conexión con el servidor' };
  }
}
