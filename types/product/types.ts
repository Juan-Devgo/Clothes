import * as z from 'zod';
import { CreateProductSchema, UpdateProductSchema } from './schemas';

export type CreateProductData = z.infer<typeof CreateProductSchema>;
export type UpdateProductData = z.infer<typeof UpdateProductSchema>;
