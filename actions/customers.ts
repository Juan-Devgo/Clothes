"use server";

import { cmsApi } from "@/lib/paths";
import { cmsLogger } from "@/lib/logger";
import { Customer } from "@/types";
import { getAuthToken } from "@/service/auth";
import {
  getContent,
  postContent,
  putContent,
  deleteContent,
  deleteContentBulk,
} from "@/service/cms";
import qs from "qs";
import {
  createAccountForCustomerAction,
  deleteAccountAction,
} from "./accounts";
import { z } from "zod";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
} from "@/types/customer/schemas";
import {
  CreateCustomerFormState,
  UpdateCustomerFormState,
  DeleteCustomerFormState,
} from "@/types/customer/forms";
import { BulkUploadFormState } from "@/types/shared/bulk";
import { CustomerExcelRow } from "@/types/customer/excel-schemas";

/**
 * Obtener la lista de clientes
 */
export async function getCustomersAction() {
  const query = qs.stringify(
    {
      populate: {
        account: {
          fields: ["documentId"],
        },
        sales: {
          fields: ["documentId"],
        },
        events: {
          fields: ["documentId"],
        },
      },
    },
    { encodeValuesOnly: true },
  );

  const content = await getContent(`${cmsApi.CUSTOMERS}?${query}`);
  return content?.data;
}

/**
 * Parámetros para obtener clientes paginados
 */
export interface PaginatedCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  searchableFields?: string[];
}

export interface PaginatedCustomersResult {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

async function fetchCustomersFromCMS(
  token: string,
  queryString: string,
  page: number,
  pageSize: number,
): Promise<PaginatedCustomersResult> {
  const response = await fetch(`${cmsApi.CUSTOMERS}?${queryString}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { data: [], total: 0, page, pageSize, pageCount: 0 };
  }

  const rawData = await response.json();
  return {
    data: (rawData?.data as Customer[]) ?? [],
    total: rawData?.meta?.pagination?.total ?? 0,
    page: rawData?.meta?.pagination?.page ?? page,
    pageSize: rawData?.meta?.pagination?.pageSize ?? pageSize,
    pageCount: rawData?.meta?.pagination?.pageCount ?? 0,
  };
}

/**
 * Calcula los días que faltan desde hoy hasta el cumpleaños (ignorando el año).
 * Hoy = 0, mañana = 1, ..., ayer = 364.
 * Clientes sin birthdate reciben Infinity para quedar al final.
 */
function birthdayDistanceFromToday(birthdate: string | null | undefined): number {
  if (!birthdate) return Infinity;
  const today = new Date();
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dayOfYear = (month: number, day: number) => {
    let d = 0;
    for (let m = 0; m < month; m++) d += daysInMonth[m];
    return d + day;
  };
  const todayDoy = dayOfYear(today.getMonth(), today.getDate());
  const bd = new Date(birthdate + "T00:00:00");
  const bdDoy = dayOfYear(bd.getMonth(), bd.getDate());
  let diff = bdDoy - todayDoy;
  if (diff < 0) diff += 365;
  return diff;
}

/**
 * Obtener clientes con paginación, búsqueda y ordenamiento server-side
 */
export async function getCustomersPaginatedAction(
  params: PaginatedCustomersParams = {},
): Promise<PaginatedCustomersResult> {
  const token = await getAuthToken();
  if (!token) {
    return { data: [], total: 0, page: 1, pageSize: 10, pageCount: 0 };
  }

  const {
    page = 1,
    pageSize = 10,
    search = "",
    sortField,
    sortDirection = "asc",
    searchableFields = ["first_name", "last_name"],
  } = params;

  const baseFields = {
    fields: ["first_name", "last_name", "phone", "email", "birthdate", "documentId"],
    populate: {
      account: { fields: ["documentId"] },
    },
  } as const;

  const filters = search.trim()
    ? {
        $or: searchableFields.map((field) => {
          const parts = field.split(".");
          if (parts.length === 2) {
            return { [parts[0]]: { [parts[1]]: { $containsi: search } } };
          }
          return { [field]: { $containsi: search } };
        }),
      }
    : undefined;

  // El orden por cumpleaños (mes-día más cercano a hoy) no es soportable por el CMS,
  // por lo que se resuelve trayendo todos los registros y ordenando manualmente.
  if (sortField === "birthdate") {
    const allQueryObj: Record<string, unknown> = {
      ...baseFields,
      pagination: { page: 1, pageSize: 9999 },
    };
    if (filters) allQueryObj.filters = filters;

    const allQueryString = qs.stringify(allQueryObj, { encodeValuesOnly: true });
    const allResult = await fetchCustomersFromCMS(token, allQueryString, 1, 9999);

    const sorted = [...allResult.data].sort((a, b) => {
      const diff =
        birthdayDistanceFromToday(a.birthdate) -
        birthdayDistanceFromToday(b.birthdate);
      return sortDirection === "asc" ? diff : -diff;
    });

    const start = (page - 1) * pageSize;
    return {
      data: sorted.slice(start, start + pageSize),
      total: sorted.length,
      page,
      pageSize,
      pageCount: Math.ceil(sorted.length / pageSize),
    };
  }

  const queryObj: Record<string, unknown> = {
    ...baseFields,
    pagination: { page, pageSize },
  };

  if (sortField) {
    queryObj.sort = [`${sortField}:${sortDirection}`];
  }

  if (filters) {
    queryObj.filters = filters;
  }

  const queryString = qs.stringify(queryObj, { encodeValuesOnly: true });
  return fetchCustomersFromCMS(token, queryString, page, pageSize);
}

/**
 * Obtener clientes por sus documentIds (para pinning tras edición masiva)
 */
export async function getCustomersByIdsAction(
  documentIds: string[],
): Promise<Customer[]> {
  if (documentIds.length === 0) return [];

  const query = qs.stringify(
    {
      fields: ["first_name", "last_name", "phone", "email", "birthdate", "documentId"],
      populate: {
        account: { fields: ["documentId"] },
      },
      filters: {
        documentId: { $in: documentIds },
      },
      pagination: { pageSize: documentIds.length },
    },
    { encodeValuesOnly: true },
  );

  const content = await getContent<Customer[]>(`${cmsApi.CUSTOMERS}?${query}`);
  return (content?.data as Customer[] | undefined) ?? [];
}

/**
 * Crear un nuevo cliente con su cuenta asociada
 */
export async function createCustomerAction(
  formData: FormData,
): Promise<CreateCustomerFormState> {
  cmsLogger.info(
    { email: formData.get("email") },
    "Action: Iniciando creación de cliente",
  );

  const fields = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: (formData.get("email") as string) || undefined,
    phone: formData.get("phone") as string,
    birthdate: (formData.get("birthdate") as string) || undefined,
    tastes: (formData.get("tastes") as string) || undefined,
  };

  // Validación de los datos
  const validatedFields = CreateCustomerSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    cmsLogger.warn(
      { errors: flattenedErrors.fieldErrors },
      "Action: Creación de cliente fallida: error de validación",
    );
    return {
      success: false,
      message: "Error de validación.",
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
        "Action: Error al crear el cliente en el CMS",
      );

      const isUniqueError = result.message?.toLowerCase().includes("unique");

      return {
        success: false,
        message: isUniqueError
          ? "Ya existe un cliente con ese correo electrónico o teléfono. Verifique los datos."
          : "Error al crear el cliente.",
        data: fields,
        validationErrors: {},
        cmsErrors: { status: result.status, message: result.message },
      };
    }

    const newCustomer = result.data;
    cmsLogger.info(
      { customerId: newCustomer.documentId },
      "Action: Cliente creado exitosamente",
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
          "Action: Cuenta creada para el cliente",
        );
      } else {
        cmsLogger.warn(
          { error: accountResult.error },
          "Action: Error creando cuenta para el cliente",
        );
      }
    }



    cmsLogger.info(
      { customerId: newCustomer.documentId },
      "Action: Creación de cliente completada exitosamente",
    );
    return {
      success: true,
      message: "Cliente creado exitosamente.",
      data: fields,
      validationErrors: {},
      cmsErrors: {},
      customerId: newCustomer.documentId,
      accountId,
    };
  } catch (error) {
    cmsLogger.error({ error }, "Action: Error de conexión creando cliente");
    return {
      success: false,
      message: "Error de conexión con el servidor.",
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
  const documentId = formData.get("documentId") as string;

  cmsLogger.info({ documentId }, "Action: Iniciando actualización de cliente");

  const fields = {
    documentId,
    first_name: (formData.get("first_name") as string) || undefined,
    last_name: (formData.get("last_name") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    birthdate: (formData.get("birthdate") as string) || undefined,
    tastes: (formData.get("tastes") as string) || undefined,
  };

  // Validar documentId
  if (!documentId) {
    cmsLogger.warn("Action: Actualización fallida: documentId requerido");
    return {
      success: false,
      message: "Error de validación.",
      data: fields,
      validationErrors: { documentId: ["El ID del cliente es requerido"] },
      cmsErrors: {},
    };
  }

  // Validación de los datos
  const validatedFields = UpdateCustomerSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    cmsLogger.warn(
      { errors: flattenedErrors.fieldErrors },
      "Action: Actualización de cliente fallida: error de validación",
    );
    return {
      success: false,
      message: "Error de validación.",
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
        "Action: Error al actualizar el cliente en el CMS",
      );

      const isUniqueError = result.message?.toLowerCase().includes("unique");

      return {
        success: false,
        message: isUniqueError
          ? "Ya existe un cliente con ese correo electrónico o teléfono. Verifique los datos."
          : "Error al actualizar el cliente.",
        data: fields,
        validationErrors: {},
        cmsErrors: { status: result.status, message: result.message },
      };
    }

    cmsLogger.info({ documentId }, "Action: Cliente actualizado exitosamente");



    return {
      success: true,
      message: "Cliente actualizado exitosamente.",
      data: fields,
      validationErrors: {},
      cmsErrors: {},
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión actualizando cliente",
    );
    return {
      success: false,
      message: "Error de conexión con el servidor.",
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
            fields: ["documentId"],
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
  const documentId = formData.get("documentId") as string;

  cmsLogger.info({ documentId }, "Action: Iniciando eliminación de cliente");

  const fields = { documentId };

  // Validar documentId
  if (!documentId) {
    cmsLogger.warn("Action: Eliminación fallida: documentId requerido");
    return {
      success: false,
      message: "Error de validación.",
      data: fields,
      validationErrors: { documentId: ["El ID del cliente es requerido"] },
      cmsErrors: {},
    };
  }

  try {
    // 1. Buscar el cliente para obtener el documentId de su cuenta
    const customer = await getCustomerById(documentId);

    if (!customer) {
      cmsLogger.warn({ documentId }, "Action: Cliente no encontrado");
      return {
        success: false,
        message: "Cliente no encontrado.",
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
          "Action: Error eliminando cuenta asociada al cliente",
        );
        // Continuamos con la eliminación del cliente aunque falle la cuenta
      } else {
        cmsLogger.info(
          { accountId: accountDocumentId },
          "Action: Cuenta asociada eliminada",
        );
      }
    }

    // 3. Eliminar el cliente
    const result = await deleteContent(`${cmsApi.CUSTOMERS}/${documentId}`);

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        "Action: Error al eliminar el cliente en el CMS",
      );
      return {
        success: false,
        message: "Error al eliminar el cliente.",
        data: fields,
        validationErrors: {},
        cmsErrors: { status: result.status, message: result.message },
      };
    }

    cmsLogger.info({ documentId }, "Action: Cliente eliminado exitosamente");



    return {
      success: true,
      message: "Cliente eliminado exitosamente.",
      data: fields,
      validationErrors: {},
      cmsErrors: {},
    };
  } catch (error) {
    cmsLogger.error({ error }, "Action: Error de conexión eliminando cliente");
    return {
      success: false,
      message: "Error de conexión con el servidor.",
      data: fields,
      validationErrors: {},
      cmsErrors: { status: 500 },
    };
  }
}

/**
 * Crear múltiples clientes a la vez (carga masiva)
 * Crea cada cliente junto con su cuenta asociada, igual que createCustomerAction.
 */
export async function createCustomersBulkAction(
  records: CustomerExcelRow[],
): Promise<BulkUploadFormState> {
  cmsLogger.info(
    { count: records.length },
    "Action: Iniciando creación masiva de clientes",
  );

  if (!records.length) {
    return {
      success: false,
      message: "No hay registros para crear.",
      created: 0,
      failed: 0,
    };
  }

  let successCount = 0;
  let failedCount = 0;

  try {
    for (const record of records) {
      try {
        // 1. Crear el cliente
        const result = await postContent<Customer>(cmsApi.CUSTOMERS, {
          data: record,
        });

        if (!result.success || !result.data) {
          cmsLogger.warn(
            { error: result.message },
            "Action: Error al crear cliente en creación masiva",
          );
          failedCount++;
          continue;
        }

        const newCustomer = result.data;
        successCount++;

        // 2. Crear la cuenta asociada al cliente
        if (newCustomer.documentId) {
          const accountResult = await createAccountForCustomerAction(
            newCustomer.documentId,
          );

          if (accountResult.success) {
            cmsLogger.info(
              {
                customerId: newCustomer.documentId,
                accountId: accountResult.accountId,
              },
              "Action: Cuenta creada para cliente en creación masiva",
            );
          } else {
            cmsLogger.warn(
              {
                customerId: newCustomer.documentId,
                error: accountResult.error,
              },
              "Action: Error creando cuenta para cliente en creación masiva",
            );
          }
        }
      } catch (error) {
        cmsLogger.warn(
          { error },
          "Action: Error procesando registro en creación masiva",
        );
        failedCount++;
      }
    }



    const allSucceeded = failedCount === 0;

    cmsLogger.info(
      { created: successCount, failed: failedCount },
      "Action: Creación masiva de clientes completada",
    );

    return {
      success: allSucceeded,
      message: allSucceeded
        ? `${successCount} clientes creados exitosamente.`
        : `${successCount} creados, ${failedCount} fallidos.`,
      created: successCount,
      failed: failedCount,
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión en creación masiva de clientes",
    );
    return {
      success: false,
      message: "Error de conexión con el servidor.",
      created: 0,
      failed: records.length,
      cmsErrors: { status: 500 },
    };
  }
}

/**
 * Eliminar todos los clientes (para reemplazo masivo)
 */
export async function deleteAllCustomersAction(): Promise<BulkUploadFormState> {
  cmsLogger.info("Action: Iniciando eliminación de todos los clientes");

  try {
    const content = await getContent<Customer[]>(cmsApi.CUSTOMERS);

    if (!content.success || !content.data) {
      return {
        success: false,
        message: "Error al obtener los clientes existentes.",
        deleted: 0,
        cmsErrors: { status: content.status },
      };
    }

    const documentIds = content.data
      .map((c) => c.documentId)
      .filter((id): id is string => !!id);

    if (documentIds.length === 0) {
      return {
        success: true,
        message: "No hay clientes para eliminar.",
        deleted: 0,
      };
    }

    const result = await deleteContentBulk(cmsApi.CUSTOMERS, documentIds);



    cmsLogger.info(
      { deleted: result.successCount, failed: result.failedCount },
      "Action: Eliminación masiva de clientes completada",
    );

    return {
      success: result.failedCount === 0,
      message:
        result.failedCount === 0
          ? `${result.successCount} clientes eliminados.`
          : `${result.successCount} eliminados, ${result.failedCount} fallidos.`,
      deleted: result.successCount,
      failed: result.failedCount,
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión eliminando todos los clientes",
    );
    return {
      success: false,
      message: "Error de conexión con el servidor.",
      deleted: 0,
      cmsErrors: { status: 500 },
    };
  }
}

/**
 * Eliminar una selección de clientes por sus documentIds
 * Reutiliza deleteContentBulk del servicio CMS
 */
export async function deleteCustomersBulkAction(
  documentIds: string[],
): Promise<BulkUploadFormState> {
  cmsLogger.info(
    { count: documentIds.length },
    "Action: Iniciando eliminación masiva de clientes seleccionados",
  );

  if (!documentIds.length) {
    return {
      success: false,
      message: "No hay registros seleccionados.",
      deleted: 0,
    };
  }

  try {
    const result = await deleteContentBulk(cmsApi.CUSTOMERS, documentIds);



    cmsLogger.info(
      { deleted: result.successCount, failed: result.failedCount },
      "Action: Eliminación masiva de clientes seleccionados completada",
    );

    return {
      success: result.failedCount === 0,
      message:
        result.failedCount === 0
          ? `${result.successCount} clientes eliminados.`
          : `${result.successCount} eliminados, ${result.failedCount} fallidos.`,
      deleted: result.successCount,
      failed: result.failedCount,
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error en eliminación masiva de clientes seleccionados",
    );
    return {
      success: false,
      message: "Error de conexión con el servidor.",
      deleted: 0,
      cmsErrors: { status: 500 },
    };
  }
}

/**
 * Actualizar un campo común en una selección de clientes
 * Aplica los mismos cambios a todos los documentIds provistos
 */
export async function updateCustomersBulkAction(
  documentIds: string[],
  data: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birthdate: string;
    tastes: string;
  }>,
): Promise<BulkUploadFormState> {
  cmsLogger.info(
    { count: documentIds.length, fields: Object.keys(data) },
    "Action: Iniciando actualización masiva de clientes",
  );

  if (!documentIds.length) {
    return {
      success: false,
      message: "No hay registros seleccionados.",
      created: 0,
    };
  }

  let successCount = 0;
  let failedCount = 0;

  try {
    for (const documentId of documentIds) {
      const result = await putContent<Customer>(
        `${cmsApi.CUSTOMERS}/${documentId}`,
        { data },
      );

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        cmsLogger.warn(
          { documentId, error: result.message },
          "Action: Error al actualizar cliente en actualización masiva",
        );
      }
    }



    cmsLogger.info(
      { updated: successCount, failed: failedCount },
      "Action: Actualización masiva de clientes completada",
    );

    return {
      success: failedCount === 0,
      message:
        failedCount === 0
          ? `${successCount} clientes actualizados.`
          : `${successCount} actualizados, ${failedCount} fallidos.`,
      created: successCount,
      failed: failedCount,
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error en actualización masiva de clientes",
    );
    return {
      success: false,
      message: "Error de conexión con el servidor.",
      created: 0,
      cmsErrors: { status: 500 },
    };
  }
}
