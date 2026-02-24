'use server';

import { revalidatePath } from 'next/cache';
import { cmsApi } from '@/lib/paths';
import { cmsLogger } from '@/lib/logger';
import {
  Product,
  ProductCategory,
  ProductSubcategory,
} from '@/types/domain/types';
import {
  getContent,
  postContent,
  putContent,
  deleteContent,
  uploadMedia,
} from '@/service/cms';
import { PRODUCT_STATES } from '@/lib/enums';
import qs from 'qs';
import { z } from 'zod';
import {
  CreateProductSchema,
  UpdateProductSchema,
} from '@/types/product-view/schemas';
import {
  CreateProductFormState,
  UpdateProductFormState,
  DeleteProductFormState,
} from '@/types/product-view/forms';

/**
 * Obtener la lista de productos
 */
export async function getProductsAction() {
  const query = qs.stringify(
    {
      populate: {
        category: {
          fields: ['name', 'label'],
        },
        subcategory: {
          fields: ['name', 'label'],
        },
        state: {
          fields: ['name', 'label'],
        },
        photo: {
          fields: ['name', 'alternativeText', 'url', 'formats'],
        },
        promos: {
          fields: ['name', 'description'],
        },
      },
    },
    { encodeValuesOnly: true },
  );

  const content = await getContent(`${cmsApi.PRODUCTS}?${query}`);
  return content?.data;
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
            fields: ['documentId', 'name', 'label'],
          },
          subcategory: {
            fields: ['documentId', 'name', 'label'],
          },
          state: {
            fields: ['documentId', 'name', 'label'],
          },
          photo: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
          promos: {
            fields: ['documentId', 'name', 'description'],
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
        'Action: Error al obtener las categorías de productos',
      );
      return null;
    }

    return result.data ?? null;
  } catch (error) {
    cmsLogger.error(
      { error },
      'Action: Error de conexión obteniendo categorías',
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
    const result = await getContent<ProductSubcategory[]>(
      cmsApi.PRODUCT_SUBCATEGORIES,
    );

    if (!result.success) {
      cmsLogger.error(
        { error: result.message },
        'Action: Error al obtener las subcategorías de productos',
      );
      return null;
    }

    return result.data ?? null;
  } catch (error) {
    cmsLogger.error(
      { error },
      'Action: Error de conexión obteniendo subcategorías',
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
    { name: formData.get('name') },
    'Action: Iniciando creación de producto',
  );

  const fields = {
    name: formData.get('name') as string,
    price: parseFloat(formData.get('price') as string) || 0,
    currency: (formData.get('currency') as string) || 'COP',
    description: (formData.get('description') as string) || undefined,
    stock: parseInt(formData.get('stock') as string) || 0,
    category: (formData.get('category') as string) || undefined,
    subcategory: (formData.get('subcategory') as string) || undefined,
  };

  // Extraer el archivo de imagen (puede ser File o null)
  const photoFile = formData.get('photo') as File | null;

  // Validación de los datos
  const validatedFields = CreateProductSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    cmsLogger.warn(
      { errors: flattenedErrors.fieldErrors },
      'Action: Creación de producto fallida: error de validación',
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
    // Subir la imagen si existe
    let photoId: number | undefined;
    if (photoFile && photoFile.size > 0) {
      // Validar tipo de archivo
      if (!photoFile.type.startsWith('image/')) {
        return {
          success: false,
          message: 'Error de validación.',
          data: fields,
          validationErrors: {
            photo: ['El archivo debe ser una imagen (jpg, png, webp, etc.)'],
          },
          cmsErrors: {},
        };
      }

      // Validar tamaño (máximo 5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (photoFile.size > MAX_SIZE) {
        return {
          success: false,
          message: 'Error de validación.',
          data: fields,
          validationErrors: {
            photo: ['La imagen no debe superar los 5MB'],
          },
          cmsErrors: {},
        };
      }

      const uploadResult = await uploadMedia(photoFile, photoFile.name);
      if (!uploadResult.success || !uploadResult.data) {
        cmsLogger.error(
          { error: uploadResult.message },
          'Action: Error al subir la imagen del producto',
        );
        return {
          success: false,
          message: 'Error al subir la imagen.',
          data: fields,
          validationErrors: {
            photo: ['No se pudo subir la imagen. Intente de nuevo.'],
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
        'Action: Imagen del producto subida exitosamente',
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
        'Action: No se pudo determinar el estado del producto según el stock',
      );
    }

    const result = await postContent<Product>(cmsApi.PRODUCTS, {
      data: cmsData,
    });

    if (!result.success || !result.data) {
      cmsLogger.error(
        { error: result.message },
        'Action: Error al crear el producto en el CMS',
      );
      return {
        success: false,
        message: 'Error al crear el producto.',
        data: fields,
        validationErrors: {},
        cmsErrors: { status: 500, message: result.message },
      };
    }

    const newProduct = result.data;
    cmsLogger.info(
      { productId: newProduct.documentId },
      'Action: Producto creado exitosamente',
    );

    revalidatePath('/control-panel/products');

    return {
      success: true,
      message: 'Producto creado exitosamente.',
      data: fields,
      validationErrors: {},
      cmsErrors: {},
      productId: newProduct.documentId,
    };
  } catch (error) {
    cmsLogger.error({ error }, 'Action: Error de conexión creando producto');
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
 * Actualizar un producto existente
 */
export async function updateProductAction(
  formData: FormData,
): Promise<UpdateProductFormState> {
  const documentId = formData.get('documentId') as string;

  cmsLogger.info({ documentId }, 'Action: Iniciando actualización de producto');

  const fields = {
    documentId,
    name: (formData.get('name') as string) || undefined,
    price: formData.get('price')
      ? parseFloat(formData.get('price') as string)
      : undefined,
    currency: (formData.get('currency') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    stock: formData.get('stock')
      ? parseInt(formData.get('stock') as string)
      : undefined,
    category: (formData.get('category') as string) || undefined,
    subcategory: (formData.get('subcategory') as string) || undefined,
  };

  // Extraer el archivo de imagen (puede ser File o null)
  const photoFile = formData.get('photo') as File | null;

  // Validar documentId
  if (!documentId) {
    cmsLogger.warn('Action: Actualización fallida: documentId requerido');
    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: { documentId: ['El ID del producto es requerido'] },
      cmsErrors: {},
    };
  }

  // Validación de los datos
  const validatedFields = UpdateProductSchema.safeParse(fields);

  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);

    cmsLogger.warn(
      { errors: flattenedErrors.fieldErrors },
      'Action: Actualización de producto fallida: error de validación',
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
    // Subir la imagen si existe
    let photoId: number | undefined;
    if (photoFile && photoFile.size > 0) {
      // Validar tipo de archivo
      if (!photoFile.type.startsWith('image/')) {
        return {
          success: false,
          message: 'Error de validación.',
          data: fields,
          validationErrors: {
            photo: ['El archivo debe ser una imagen (jpg, png, webp, etc.)'],
          },
          cmsErrors: {},
        };
      }

      // Validar tamaño (máximo 5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (photoFile.size > MAX_SIZE) {
        return {
          success: false,
          message: 'Error de validación.',
          data: fields,
          validationErrors: {
            photo: ['La imagen no debe superar los 5MB'],
          },
          cmsErrors: {},
        };
      }

      const uploadResult = await uploadMedia(photoFile, photoFile.name);
      if (!uploadResult.success || !uploadResult.data) {
        cmsLogger.error(
          { error: uploadResult.message },
          'Action: Error al subir la imagen del producto',
        );
        return {
          success: false,
          message: 'Error al subir la imagen.',
          data: fields,
          validationErrors: {
            photo: ['No se pudo subir la imagen. Intente de nuevo.'],
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
        'Action: Imagen del producto subida exitosamente',
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
          'Action: No se pudo determinar el estado del producto según el stock',
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
        'Action: Error al actualizar el producto en el CMS',
      );
      return {
        success: false,
        message: 'Error al actualizar el producto.',
        data: fields,
        validationErrors: {},
        cmsErrors: { status: 500, message: result.message },
      };
    }

    cmsLogger.info({ documentId }, 'Action: Producto actualizado exitosamente');

    revalidatePath('/control-panel/products');

    return {
      success: true,
      message: 'Producto actualizado exitosamente.',
      data: fields,
      validationErrors: {},
      cmsErrors: {},
    };
  } catch (error) {
    cmsLogger.error(
      { error },
      'Action: Error de conexión actualizando producto',
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
 * Eliminar un producto
 */
export async function deleteProductAction(
  formData: FormData,
): Promise<DeleteProductFormState> {
  const documentId = formData.get('documentId') as string;

  cmsLogger.info({ documentId }, 'Action: Iniciando eliminación de producto');

  const fields = { documentId };

  // Validar documentId
  if (!documentId) {
    cmsLogger.warn('Action: Eliminación fallida: documentId requerido');
    return {
      success: false,
      message: 'Error de validación.',
      data: fields,
      validationErrors: { documentId: ['El ID del producto es requerido'] },
      cmsErrors: {},
    };
  }

  try {
    // Verificar que el producto existe
    const product = await getProductByIdAction(documentId);

    if (!product) {
      cmsLogger.warn({ documentId }, 'Action: Producto no encontrado');
      return {
        success: false,
        message: 'Producto no encontrado.',
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
        'Action: Error al eliminar el producto en el CMS',
      );
      return {
        success: false,
        message: 'Error al eliminar el producto.',
        data: fields,
        validationErrors: {},
        cmsErrors: { status: 500, message: result.message },
      };
    }

    cmsLogger.info({ documentId }, 'Action: Producto eliminado exitosamente');

    revalidatePath('/control-panel/products');

    return {
      success: true,
      message: 'Producto eliminado exitosamente.',
      data: fields,
      validationErrors: {},
      cmsErrors: {},
    };
  } catch (error) {
    cmsLogger.error({ error }, 'Action: Error de conexión eliminando producto');
    return {
      success: false,
      message: 'Error de conexión con el servidor.',
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

    if (currentStateName === 'RETIRED') {
      // Reactivar: STOCK si tiene stock, NO_STOCK si no
      if (stock > 0) {
        newStateId = await PRODUCT_STATES.STOCK();
        actionLabel = 'reactivado (En stock)';
      } else {
        newStateId = await PRODUCT_STATES.NO_STOCK();
        actionLabel = 'reactivado (Sin stock)';
      }
    } else {
      // Retirar
      newStateId = await PRODUCT_STATES.RETIRED();
      actionLabel = 'retirado';
    }

    if (!newStateId) {
      cmsLogger.error('Action: No se pudo obtener el documentId del estado');
      return {
        success: false,
        message: 'No se pudo determinar el nuevo estado.',
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
        'Action: Error al cambiar el estado del producto',
      );
      return {
        success: false,
        message: 'Error al cambiar el estado del producto.',
      };
    }

    cmsLogger.info(
      { documentId, actionLabel },
      'Action: Estado del producto actualizado',
    );
    revalidatePath('/control-panel/products');

    return { success: true, message: `Producto ${actionLabel} exitosamente.` };
  } catch (error) {
    cmsLogger.error(
      { error },
      'Action: Error de conexión cambiando estado del producto',
    );
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
}
