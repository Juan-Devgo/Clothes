import z from "zod";
import { CreateCustomerSchema, UpdateCustomerSchema } from "./schemas";

export type CreateCustomerData = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerData = z.infer<typeof UpdateCustomerSchema>;