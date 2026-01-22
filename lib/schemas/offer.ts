import { z } from "zod";

// Part item schema (for parts)
export const partItemSchema = z.object({
  id: z.string().optional(),
  type: z.literal("part"),
  description: z.string().min(1, "Product name is required"),
  brand: z.string().optional(),
  partNumber: z.string().optional(),
  unitPrice: z.number().min(0, "Price must be positive"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export type PartItemFormData = z.infer<typeof partItemSchema>;

// Service action schema (for labor)
export const serviceActionSchema = z.object({
  id: z.string().optional(),
  actionName: z.string().min(1, "Service action name is required"),
  timeRequired: z.string().optional(), // e.g., "0h 40min"
  pricePerHour: z.number().min(0, "Hourly rate must be positive"),
});

export type ServiceActionFormData = z.infer<typeof serviceActionSchema>;

// Legacy offer item schema (for backward compatibility)
export const offerItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["part", "labor"]),
  description: z.string().min(1, "Description is required"),
  brand: z.string().optional(),
  partNumber: z.string().optional(),
  unitPrice: z.number().min(0, "Price must be positive"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export type OfferItemFormData = z.infer<typeof offerItemSchema>;

// Main offer form schema
export const offerFormSchema = z
  .object({
    // Customer info (denormalized)
    customerName: z.string().min(1, "Customer name is required"),
    customerPhone: z.string().optional(),
    clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),

    // Existing client (if selected)
    clientId: z.string().optional(),

    // Car info
    carModel: z.string().min(1, "Car model is required"),
    carYear: z
      .number()
      .min(1990, "Year must be 1990 or later")
      .max(2030, "Year must be 2030 or earlier"),
    vinText: z.string().optional(),
    carLicensePlate: z.string().optional(),
    carMileage: z.number().min(0, "Mileage must be positive").optional(),

    // Existing car (if selected)
    carId: z.string().optional(),

    // Created by
    createdByName: z.string().min(1, "Creator name is required"),

    // Offer details
    discountPercent: z
      .number()
      .min(0, "Discount must be 0 or more")
      .max(100, "Discount cannot exceed 100%")
      .default(0),
    notes: z.string().optional(),

    // Parts and Services
    parts: z.array(partItemSchema).default([]),
    serviceActions: z.array(serviceActionSchema).default([]),

    // Legacy items field (for backward compatibility)
    items: z.array(offerItemSchema).optional(),
  })
  .refine((data) => data.parts.length + data.serviceActions.length > 0, {
    message: "At least one part or service action is required",
    path: ["parts"],
  });

export type OfferFormData = z.output<typeof offerFormSchema>;

// Default values for the form
export const defaultOfferFormValues: Partial<OfferFormData> = {
  customerName: "",
  customerPhone: "",
  clientEmail: "",
  carModel: "",
  carYear: new Date().getFullYear(),
  vinText: "",
  carLicensePlate: "",
  carMileage: 0,
  createdByName: "",
  discountPercent: 0,
  notes: "",
  parts: [],
  serviceActions: [],
  items: [],
};

// VAT rate
export const VAT_RATE = 0.2; // 20%

// EUR to BGN conversion rate (fixed)
export const EUR_TO_BGN = 1.95583;
