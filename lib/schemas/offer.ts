import { z } from "zod";

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

export const serviceActionSchema = z.object({
  id: z.string().optional(),
  actionName: z.string().min(1, "Service action name is required"),
  timeRequired: z.string().optional(),
  pricePerHour: z.number().min(0, "Hourly rate must be positive"),
  isFixedPrice: z.boolean().optional().default(false),
  fixedPriceAmount: z.number().min(0).optional(),
});

export type ServiceActionFormData = z.infer<typeof serviceActionSchema>;

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

export const offerFormSchema = z.object({
    customerName: z.string().optional().default(""),
    customerPhone: z.string().optional(),
    clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    clientId: z.string().optional(),

    carModel: z.string().optional().default(""),
    carModelDetail: z.string().optional(),
    repairName: z.string().optional(),
    carYear: z
      .number()
      .min(1990, "Year must be 1990 or later")
      .max(2030, "Year must be 2030 or earlier")
      .nullable()
      .optional(),
    vinText: z.string().optional(),
    carLicensePlate: z.string().optional(),
    carMileage: z
      .number()
      .min(0, "Mileage must be positive")
      .nullable()
      .optional(),
    carMileageUnit: z.enum(["km", "miles"]).default("km"),
    carId: z.string().optional(),

    createdByName: z.string().optional().default(""),

    discountPercent: z
      .number()
      .min(0, "Discount must be 0 or more")
      .max(100, "Discount cannot exceed 100%")
      .default(0),
    discountPartsPercent: z.number().min(0).max(100).default(0),
    discountServicesPercent: z.number().min(0).max(100).default(0),
    notes: z.string().optional(),
    notesInternal: z.string().optional(),
    notesService: z.string().optional(),

    parts: z.array(partItemSchema).default([]),
    serviceActions: z.array(serviceActionSchema).default([]),
    items: z.array(offerItemSchema).optional(),
  });

export type OfferFormData = z.output<typeof offerFormSchema>;

export const defaultOfferFormValues: Partial<OfferFormData> = {
  customerName: "",
  customerPhone: "",
  clientEmail: "",
  carModel: "",
  carModelDetail: "",
  repairName: "",
  carYear: undefined,
  vinText: "",
  carLicensePlate: "",
  carMileage: undefined,
  carMileageUnit: "km",
  createdByName: "",
  discountPercent: 0,
  discountPartsPercent: 0,
  discountServicesPercent: 0,
  notes: "",
  notesInternal: "",
  notesService: "",
  parts: [],
  serviceActions: [],
  items: [],
};

export const VAT_RATE = 0.2;
export const EUR_TO_BGN = 1.95583;
