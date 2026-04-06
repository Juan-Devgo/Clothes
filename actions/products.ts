"use server";

import { cmsApi } from "@/lib/paths";
import { cmsLogger } from "@/lib/logger";
import { Product, ProductCategory, ProductSubcategory } from "@/types";
import { getAuthToken } from "@/service/auth";
import {
  getContent,
  postContent,
  putContent,
  deleteContent,
  uploadMedia,
  postContentBulk,
  deleteContentBulk,
} from "@/service/cms";
import { PRODUCT_STATES } from "@/lib/enums";
import qs from "qs";
import { z } from "zod";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "@/types/product/schemas";
import {
  CreateProductFormState,
  UpdateProductFormState,
  DeleteProductFormState,
} from "@/types/product/forms";
import { BulkUploadFormState } from "@/types/shared/bulk";
import { ProductExcelRow } from "@/types/product/excel-schemas";

/**
 * Obtener la lista de productos
 */
export async function getProductsAction() {
  const query = qs.stringify(
    {
      populate: {
        category: {
          fields: ["name", "label"],
        },
        subcategory: {
          fields: ["name", "label"],
        },
        state: {
          fields: ["name", "label"],
        },
        promos: {
          fields: ["name", "description"],
        },
      },
    },
    { encodeValuesOnly: true },
  );

  const content = await getContent(`${cmsApi.PRODUCTS}?${query}`);
  return content?.data;
}

/**
 * Parámetros para obtener productos paginados
 */
export interface PaginatedProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  searchableFields?: string[];
}

export interface PaginatedProductsResult {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

async function fetchProductsFromCMS(
  token: string,
  queryString: string,
  page: number,
  pageSize: number,
): Promise<PaginatedProductsResult> {
  const response = await fetch(`${cmsApi.PRODUCTS}?${queryString}`, {
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
    data: (rawData?.data as Product[]) ?? [],
    total: rawData?.meta?.pagination?.total ?? 0,
    page: rawData?.meta?.pagination?.page ?? page,
    pageSize: rawData?.meta?.pagination?.pageSize ?? pageSize,
    pageCount: rawData?.meta?.pagination?.pageCount ?? 0,
  };
}

/**
 * Obtener productos con paginación, búsqueda y ordenamiento server-side
 */
export async function getProductsPaginatedAction(
  params: PaginatedProductsParams = {},
): Promise<PaginatedProductsResult> {
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
    searchableFields = ["name"],
  } = params;

  const queryObj: Record<string, unknown> = {
    fields: ["name", "price", "currency", "stock", "documentId"],
    populate: {
      category: { fields: ["name", "label"] },
      subcategory: { fields: ["name", "label"] },
      state: { fields: ["name", "label"] },
    },
    pagination: { page, pageSize },
  };

  if (sortField) {
    queryObj.sort = [`${sortField}:${sortDirection}`];
  }

  if (search.trim()) {
    queryObj.filters = {
      $or: searchableFields.map((field) => {
        const parts = field.split(".");
        if (parts.length === 2) {
          return { [parts[0]]: { [parts[1]]: { $containsi: search } } };
        }
        return { [field]: { $containsi: search } };
      }),
    };
  }

  const queryString = qs.stringify(queryObj, { encodeValuesOnly: true });
  return fetchProductsFromCMS(token, queryString, page, pageSize);
}

/**
 * Obtener productos por sus documentIds (para pinning tras edición masiva)
 */
export async function getProductsByIdsAction(
  documentIds: string[],
): Promise<Product[]> {
  if (documentIds.length === 0) return [];

  const query = qs.stringify(
    {
      fields: ["name", "price", "currency", "stock", "documentId"],
      populate: {
        category: { fields: ["name", "label"] },
        subcategory: { fields: ["name", "label"] },
        state: { fields: ["name", "label"] },
      },
      filters: {
        documentId: { $in: documentIds },
      },
      pagination: { pageSize: documentIds.length },
    },
    { encodeValuesOnly: true },
  );

  const content = await getContent<Product[]>(`${cmsApi.PRODUCTS}?${query}`);
  return (content?.data as Product[] | undefined) ?? [];
}

/**
 * Obtener un producto por su documentId
 */
export async function getProductByIdAction(
  documentId: string,
): Promise<Product | null> {
  try {
    const query = qs.stringify(
      {
        populate: {
          category: {
            fields: ["documentId", "name", "label"],
          },
          subcategory: {
            fields: ["documentId", "name", "label"],
          },
          state: {
            fields: ["documentId", "name", "label"],
          },
          photo: {
            fields: ["name", "alternativeText", "url", "formats"],
          },
          promos: {
            fields: ["documentId", "name", "description"],
          },
        },
      },
      { encodeValuesOnly: true },
    );

    const result = await getContent<Product>(
      `${cmsApi.PRODUCTS}/${documentId}?${query}`,
    );

    if (!result.success) return null;

    return result.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Obtener todas las categorías de los productos
 */
export async function getCategoriesAction(): Promise<ProductCategory[] | null> {
  try {
    const result = await getContent<ProductCategory[]>(
      cmsApi.PRODUCT_CATEGORIES,
    );

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        "Action: Error al obtener las categorías de productos",
      );
      return null;
    }

    return result.data ?? null;
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión obteniendo categorías",
    );
    return null;
  }
}

/**
 * Obtener todas las subcategorías de los productos
 */
export async function getSubcategoriesAction(): Promise<
  ProductSubcategory[] | null
> {
  try {
    const query = qs.stringify(
      {
        populate: {
          product_category: {
            fields: ["documentId", "name", "label"],
          },
        },
      },
      { encodeValuesOnly: true },
    );

    const result = await getContent<ProductSubcategory[]>(
      `${cmsApi.PRODUCT_SUBCATEGORIES}?${query}`,
    );

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        "Action: Error al obtener las subcategorías de productos",
      );
      return null;
    }

    return result.data ?? null;
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión obteniendo subcategorías",
    );
    return null;
  }
}

/**
 * Crear un nuevo producto
 */
export async function createProductAction(
  formData: FormData,
): Promise<CreateProductFormState> {
  cmsLogger.info(
    { name: formData.get("name") },
    "Action: Iniciando creación de producto",
  );

  const fields = {
    name: formData.get("name") as string,
    price: parseFloat(formData.get("price") as string) || 0,
    currency: (formData.get("currency") as string) || "COP",
    description: (formData.get("description") as string) || undefined,
    stock: parseInt(formData.get("stock") as string) || 0,
    category: (formData.get("category") as string) || undefined,
    subcategory: (formData.get("subcategory") as string) || undefined,
  };

  // Extraer el archivo de imagen (puede ser File o null)
  const photoFile = formData.get("photo") as File | null;

  // Validación de los datos
  const validatedFields = CreateProductSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    cmsLogger.warn(
      { errors: flattenedErrors.fieldErrors },
      "Action: Creación de producto fallida: error de validación",
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
    // Subir la imagen si existe
    let photoId: number | undefined;
    if (photoFile && photoFile.size > 0) {
      // Validar tipo de archivo
      if (!photoFile.type.startsWith("image/")) {
        return {
          success: false,
          message: "Error de validación.",
          data: fields,
          validationErrors: {
            photo: ["El archivo debe ser una imagen (jpg, png, webp, etc.)"],
          },
          cmsErrors: {},
        };
      }

      // Validar tamaño (máximo 5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (photoFile.size > MAX_SIZE) {
        return {
          success: false,
          message: "Error de validación.",
          data: fields,
          validationErrors: {
            photo: ["La imagen no debe superar los 5MB"],
          },
          cmsErrors: {},
        };
      }

      const uploadResult = await uploadMedia(photoFile, photoFile.name);
      if (!uploadResult.success || !uploadResult.data) {
        cmsLogger.error(
          { error: uploadResult.message },
          "Action: Error al subir la imagen del producto",
        );
        return {
          success: false,
          message: "Error al subir la imagen.",
          data: fields,
          validationErrors: {
            photo: ["No se pudo subir la imagen. Intente de nuevo."],
          },
          cmsErrors: {
            status: uploadResult.status,
            message: uploadResult.message,
          },
        };
      }

      photoId = Number(uploadResult.data.id);
      cmsLogger.info(
        { photoId },
        "Action: Imagen del producto subida exitosamente",
      );
    }

    // Preparar datos para el CMS
    const cmsData: Record<string, unknown> = {
      name: validatedFields.data.name,
      price: validatedFields.data.price,
      currency: validatedFields.data.currency,
      description: validatedFields.data.description,
      stock: validatedFields.data.stock,
    };

    // Conectar relaciones si existen
    if (validatedFields.data.category) {
      cmsData.category = { connect: [validatedFields.data.category] };
    }
    if (validatedFields.data.subcategory) {
      cmsData.subcategory = { connect: [validatedFields.data.subcategory] };
    }

    // Enlazar foto si se subió
    if (photoId) {
      cmsData.photo = photoId;
    }

    // Determinar el estado automáticamente según el stock
    const stateId =
      validatedFields.data.stock > 0
        ? await PRODUCT_STATES.STOCK()
        : await PRODUCT_STATES.NO_STOCK();

    if (stateId) {
      cmsData.state = { connect: [stateId] };
    } else {
      cmsLogger.warn(
        "Action: No se pudo determinar el estado del producto según el stock",
      );
    }

    const result = await postContent<Product>(cmsApi.PRODUCTS, {
      data: cmsData,
    });

    if (!result.success || !result.data) {
      cmsLogger.error(
        { error: result.message },
        "Action: Error al crear el producto en el CMS",
      );

      const isUniqueError = result.message?.toLowerCase().includes("unique");

      return {
        success: false,
        message: isUniqueError
          ? "Ya existe un producto con ese nombre. Por favor use uno diferente."
          : "Error al crear el producto.",
        data: fields,
        validationErrors: {},
        cmsErrors: { status: result.status, message: result.message },
      };
    }

    const newProduct = result.data;
    cmsLogger.info(
      { productId: newProduct.documentId },
      "Action: Producto creado exitosamente",
    );

    return {
      success: true,
      message: "Producto creado exitosamente.",
      data: fields,
      validationErrors: {},
      cmsErrors: {},
      productId: newProduct.documentId,
    };
  } catch (error) {
    cmsLogger.error({ error }, "Action: Error de conexión creando producto");
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
 * Actualizar un producto existente
 */
export async function updateProductAction(
  formData: FormData,
): Promise<UpdateProductFormState> {
  const documentId = formData.get("documentId") as string;

  cmsLogger.info({ documentId }, "Action: Iniciando actualización de producto");

  const fields = {
    documentId,
    name: (formData.get("name") as string) || undefined,
    price: formData.get("price")
      ? parseFloat(formData.get("price") as string)
      : undefined,
    currency: (formData.get("currency") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    stock: formData.get("stock")
      ? parseInt(formData.get("stock") as string)
      : undefined,
    category: (formData.get("category") as string) || undefined,
    subcategory: (formData.get("subcategory") as string) || undefined,
  };

  // Extraer el archivo de imagen (puede ser File o null)
  const photoFile = formData.get("photo") as File | null;

  // Validar documentId
  if (!documentId) {
    cmsLogger.warn("Action: Actualización fallida: documentId requerido");
    return {
      success: false,
      message: "Error de validación.",
      data: fields,
      validationErrors: { documentId: ["El ID del producto es requerido"] },
      cmsErrors: {},
    };
  }

  // Validación de los datos
  const validatedFields = UpdateProductSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    cmsLogger.warn(
      { errors: flattenedErrors.fieldErrors },
      "Action: Actualización de producto fallida: error de validación",
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
    // Subir la imagen si existe
    let photoId: number | undefined;
    if (photoFile && photoFile.size > 0) {
      // Validar tipo de archivo
      if (!photoFile.type.startsWith("image/")) {
        return {
          success: false,
          message: "Error de validación.",
          data: fields,
          validationErrors: {
            photo: ["El archivo debe ser una imagen (jpg, png, webp, etc.)"],
          },
          cmsErrors: {},
        };
      }

      // Validar tamaño (máximo 5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (photoFile.size > MAX_SIZE) {
        return {
          success: false,
          message: "Error de validación.",
          data: fields,
          validationErrors: {
            photo: ["La imagen no debe superar los 5MB"],
          },
          cmsErrors: {},
        };
      }

      const uploadResult = await uploadMedia(photoFile, photoFile.name);
      if (!uploadResult.success || !uploadResult.data) {
        cmsLogger.error(
          { error: uploadResult.message },
          "Action: Error al subir la imagen del producto",
        );
        return {
          success: false,
          message: "Error al subir la imagen.",
          data: fields,
          validationErrors: {
            photo: ["No se pudo subir la imagen. Intente de nuevo."],
          },
          cmsErrors: {
            status: uploadResult.status,
            message: uploadResult.message,
          },
        };
      }

      photoId = Number(uploadResult.data.id);
      cmsLogger.info(
        { photoId },
        "Action: Imagen del producto subida exitosamente",
      );
    }

    // Preparar datos para el CMS
    const cmsData: Record<string, unknown> = {};

    if (validatedFields.data.name !== undefined) {
      cmsData.name = validatedFields.data.name;
    }
    if (validatedFields.data.price !== undefined) {
      cmsData.price = validatedFields.data.price;
    }
    if (validatedFields.data.currency !== undefined) {
      cmsData.currency = validatedFields.data.currency;
    }
    if (validatedFields.data.description !== undefined) {
      cmsData.description = validatedFields.data.description;
    }
    if (validatedFields.data.stock !== undefined) {
      cmsData.stock = validatedFields.data.stock;
    }
    if (validatedFields.data.category) {
      cmsData.category = { connect: [validatedFields.data.category] };
    }
    if (validatedFields.data.subcategory) {
      cmsData.subcategory = { connect: [validatedFields.data.subcategory] };
    }

    // Enlazar foto si se subió una nueva
    if (photoId) {
      cmsData.photo = photoId;
    }

    // Si se actualiza el stock, determinar el estado automáticamente
    if (validatedFields.data.stock !== undefined) {
      const stateId =
        validatedFields.data.stock > 0
          ? await PRODUCT_STATES.STOCK()
          : await PRODUCT_STATES.NO_STOCK();

      if (stateId) {
        cmsData.state = { connect: [stateId] };
      } else {
        cmsLogger.warn(
          "Action: No se pudo determinar el estado del producto según el stock",
        );
      }
    }

    const result = await putContent<Product>(
      `${cmsApi.PRODUCTS}/${documentId}`,
      { data: cmsData },
    );

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        "Action: Error al actualizar el producto en el CMS",
      );

      const isUniqueError = result.message?.toLowerCase().includes("unique");

      return {
        success: false,
        message: isUniqueError
          ? "Ya existe un producto con ese nombre. Por favor use uno diferente."
          : "Error al actualizar el producto.",
        data: fields,
        validationErrors: {},
        cmsErrors: { status: result.status, message: result.message },
      };
    }

    cmsLogger.info({ documentId }, "Action: Producto actualizado exitosamente");


    return {
      success: true,
      message: "Producto actualizado exitosamente.",
      data: fields,
      validationErrors: {},
      cmsErrors: {},
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión actualizando producto",
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
 * Eliminar un producto
 */
export async function deleteProductAction(
  formData: FormData,
): Promise<DeleteProductFormState> {
  const documentId = formData.get("documentId") as string;

  cmsLogger.info({ documentId }, "Action: Iniciando eliminación de producto");

  const fields = { documentId };

  // Validar documentId
  if (!documentId) {
    cmsLogger.warn("Action: Eliminación fallida: documentId requerido");
    return {
      success: false,
      message: "Error de validación.",
      data: fields,
      validationErrors: { documentId: ["El ID del producto es requerido"] },
      cmsErrors: {},
    };
  }

  try {
    // Verificar que el producto existe
    const product = await getProductByIdAction(documentId);

    if (!product) {
      cmsLogger.warn({ documentId }, "Action: Producto no encontrado");
      return {
        success: false,
        message: "Producto no encontrado.",
        data: fields,
        validationErrors: {},
        cmsErrors: { status: 404 },
      };
    }

    // Eliminar el producto
    const result = await deleteContent(`${cmsApi.PRODUCTS}/${documentId}`);

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        "Action: Error al eliminar el producto en el CMS",
      );
      return {
        success: false,
        message: "Error al eliminar el producto.",
        data: fields,
        validationErrors: {},
        cmsErrors: { status: result.status, message: result.message },
      };
    }

    cmsLogger.info({ documentId }, "Action: Producto eliminado exitosamente");


    return {
      success: true,
      message: "Producto eliminado exitosamente.",
      data: fields,
      validationErrors: {},
      cmsErrors: {},
    };
  } catch (error) {
    cmsLogger.error({ error }, "Action: Error de conexión eliminando producto");
    return {
      success: false,
      message: "Error de conexión con el servidor.",
      data: fields,
      validationErrors: {},
      cmsErrors: { status: 500 },
    };
  }
}

export async function toggleRetireProductAction(
  documentId: string,
  currentStateName: string | undefined,
  stock: number,
): Promise<{ success: boolean; message: string }> {
  try {
    let newStateId: string | null;
    let actionLabel: string;

    if (currentStateName === "RETIRED") {
      // Reactivar: STOCK si tiene stock, NO_STOCK si no
      if (stock > 0) {
        newStateId = await PRODUCT_STATES.STOCK();
        actionLabel = "reactivado (En stock)";
      } else {
        newStateId = await PRODUCT_STATES.NO_STOCK();
        actionLabel = "reactivado (Sin stock)";
      }
    } else {
      // Retirar
      newStateId = await PRODUCT_STATES.RETIRED();
      actionLabel = "retirado";
    }

    if (!newStateId) {
      cmsLogger.error("Action: No se pudo obtener el documentId del estado");
      return {
        success: false,
        message: "No se pudo determinar el nuevo estado.",
      };
    }

    const result = await putContent(`${cmsApi.PRODUCTS}/${documentId}`, {
      data: {
        state: {
          connect: [newStateId],
        },
      },
    });

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        "Action: Error al cambiar el estado del producto",
      );
      return {
        success: false,
        message: "Error al cambiar el estado del producto.",
      };
    }

    cmsLogger.info(
      { documentId, actionLabel },
      "Action: Estado del producto actualizado",
    );
    return { success: true, message: `Producto ${actionLabel} exitosamente.` };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión cambiando estado del producto",
    );
    return { success: false, message: "Error de conexión con el servidor." };
  }
}

/**
 * Crear múltiples productos a la vez (carga masiva)
 */
export async function createProductsBulkAction(
  records: ProductExcelRow[],
): Promise<BulkUploadFormState> {
  cmsLogger.info(
    { count: records.length },
    "Action: Iniciando creación masiva de productos",
  );

  if (!records.length) {
    return {
      success: false,
      message: "No hay registros para crear.",
      created: 0,
      failed: 0,
    };
  }

  try {
    // Obtener el estado "STOCK" para asignar a nuevos productos con stock > 0
    const stockStateId = await PRODUCT_STATES.STOCK();
    const noStockStateId = await PRODUCT_STATES.NO_STOCK();

    const items = records.map((record) => {
      const stateId = record.stock > 0 ? stockStateId : noStockStateId;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: Record<string, any> = {
        name: record.name,
        price: record.price,
        currency: record.currency,
        description: record.description,
        stock: record.stock,
      };

      if (stateId) {
        data.state = { connect: [stateId] };
      }

      if (record.category) {
        data.category = { connect: [record.category] };
      }

      if (record.subcategory) {
        data.subcategory = { connect: [record.subcategory] };
      }

      return { data };
    });

    const result = await postContentBulk(cmsApi.PRODUCTS, items);


    const allSucceeded = result.failedCount === 0;

    cmsLogger.info(
      { created: result.successCount, failed: result.failedCount },
      "Action: Creación masiva de productos completada",
    );

    return {
      success: allSucceeded,
      message: allSucceeded
        ? `${result.successCount} productos creados exitosamente.`
        : `${result.successCount} creados, ${result.failedCount} fallidos.`,
      created: result.successCount,
      failed: result.failedCount,
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión en creación masiva de productos",
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
 * Eliminar todos los productos (para reemplazo masivo)
 */
export async function deleteAllProductsAction(): Promise<BulkUploadFormState> {
  cmsLogger.info("Action: Iniciando eliminación de todos los productos");

  try {
    const content = await getContent<Product[]>(cmsApi.PRODUCTS);

    if (!content.success || !content.data) {
      return {
        success: false,
        message: "Error al obtener los productos existentes.",
        deleted: 0,
        cmsErrors: { status: content.status },
      };
    }

    const documentIds = content.data
      .map((p) => p.documentId)
      .filter((id): id is string => !!id);

    if (documentIds.length === 0) {
      return {
        success: true,
        message: "No hay productos para eliminar.",
        deleted: 0,
      };
    }

    const result = await deleteContentBulk(cmsApi.PRODUCTS, documentIds);


    cmsLogger.info(
      { deleted: result.successCount, failed: result.failedCount },
      "Action: Eliminación masiva de productos completada",
    );

    return {
      success: result.failedCount === 0,
      message:
        result.failedCount === 0
          ? `${result.successCount} productos eliminados.`
          : `${result.successCount} eliminados, ${result.failedCount} fallidos.`,
      deleted: result.successCount,
      failed: result.failedCount,
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error de conexión eliminando todos los productos",
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
 * Eliminar una selección de productos por sus documentIds
 * Reutiliza deleteContentBulk del servicio CMS
 */
export async function deleteProductsBulkAction(
  documentIds: string[],
): Promise<BulkUploadFormState> {
  cmsLogger.info(
    { count: documentIds.length },
    "Action: Iniciando eliminación masiva de productos seleccionados",
  );

  if (!documentIds.length) {
    return {
      success: false,
      message: "No hay registros seleccionados.",
      deleted: 0,
    };
  }

  try {
    const result = await deleteContentBulk(cmsApi.PRODUCTS, documentIds);


    cmsLogger.info(
      { deleted: result.successCount, failed: result.failedCount },
      "Action: Eliminación masiva de productos seleccionados completada",
    );

    return {
      success: result.failedCount === 0,
      message:
        result.failedCount === 0
          ? `${result.successCount} productos eliminados.`
          : `${result.successCount} eliminados, ${result.failedCount} fallidos.`,
      deleted: result.successCount,
      failed: result.failedCount,
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error en eliminación masiva de productos seleccionados",
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
 * Actualizar campos comunes en una selección de productos.
 * Aplica los mismos cambios a todos los documentIds provistos.
 * Si se actualiza el stock, el estado (STOCK / NO_STOCK) se recalcula automáticamente.
 */
export async function updateProductsBulkAction(
  documentIds: string[],
  data: Partial<{
    price: number;
    currency: string;
    description: string;
    stock: number;
    category: string;
    subcategory: string;
  }>,
): Promise<BulkUploadFormState> {
  cmsLogger.info(
    { count: documentIds.length, fields: Object.keys(data) },
    "Action: Iniciando actualización masiva de productos",
  );

  if (!documentIds.length) {
    return {
      success: false,
      message: "No hay registros seleccionados.",
      created: 0,
    };
  }

  // Construir el objeto CMS con el formato correcto para relaciones
  const cmsData: Record<string, unknown> = {};

  if (data.price !== undefined) cmsData.price = data.price;
  if (data.currency !== undefined) cmsData.currency = data.currency;
  if (data.description !== undefined) cmsData.description = data.description;
  if (data.stock !== undefined) cmsData.stock = data.stock;
  if (data.category) cmsData.category = { connect: [data.category] };
  if (data.subcategory) cmsData.subcategory = { connect: [data.subcategory] };

  // Recalcular estado si se actualiza el stock
  if (data.stock !== undefined) {
    const stateId =
      data.stock > 0
        ? await PRODUCT_STATES.STOCK()
        : await PRODUCT_STATES.NO_STOCK();
    if (stateId) {
      cmsData.state = { connect: [stateId] };
    }
  }

  let successCount = 0;
  let failedCount = 0;

  try {
    for (const documentId of documentIds) {
      const result = await putContent<Product>(
        `${cmsApi.PRODUCTS}/${documentId}`,
        { data: cmsData },
      );

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        cmsLogger.warn(
          { documentId, error: result.message },
          "Action: Error al actualizar producto en actualización masiva",
        );
      }
    }


    cmsLogger.info(
      { updated: successCount, failed: failedCount },
      "Action: Actualización masiva de productos completada",
    );

    return {
      success: failedCount === 0,
      message:
        failedCount === 0
          ? `${successCount} productos actualizados.`
          : `${successCount} actualizados, ${failedCount} fallidos.`,
      created: successCount,
      failed: failedCount,
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      "Action: Error en actualización masiva de productos",
    );
    return {
      success: false,
      message: "Error de conexión con el servidor.",
      created: 0,
      cmsErrors: { status: 500 },
    };
  }
}
