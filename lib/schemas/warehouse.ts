import { z } from "zod";

export const warehousePartSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  part_number: z.string().min(1, "Part number is required"),
  manufacturer: z.string().default("MERCEDES"),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
  cost_price: z.number().min(0, "Cost price must be 0 or more"),
  sale_price: z.number().min(0, "Sale price must be 0 or more"),
  replaced_by: z.string().optional(),
});

export type WarehousePartFormData = z.infer<typeof warehousePartSchema>;
