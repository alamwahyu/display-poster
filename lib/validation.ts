import { z } from "zod";

export const fitModeSchema = z.enum(["CONTAIN", "COVER", "STRETCH"]);
export const posterStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export const displayStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export const transitionSchema = z.enum(["FADE", "SLIDE", "NONE"]);

const nullableDate = z
  .union([z.string().datetime(), z.string().length(0), z.null(), z.undefined()])
  .transform((value) => (value ? new Date(value) : null));

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export const posterFormSchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().max(1000).optional().nullable(),
  status: posterStatusSchema.default("ACTIVE"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  duration: z.coerce.number().int().min(1).max(86400).default(10),
  fitMode: fitModeSchema.default("CONTAIN"),
  startDate: nullableDate,
  endDate: nullableDate,
  displayIds: z.array(z.string()).default([])
});

export const posterJsonSchema = posterFormSchema.extend({
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional()
});

export const displaySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  description: z.string().max(1000).optional().nullable(),
  status: displayStatusSchema.default("ACTIVE"),
  isDefault: z.coerce.boolean().default(false)
});

export const displaySettingSchema = z.object({
  defaultDuration: z.coerce.number().int().min(1).max(86400),
  transition: transitionSchema,
  transitionDuration: z.coerce.number().int().min(0).max(10000),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  defaultFitMode: fitModeSchema,
  pollingInterval: z.coerce.number().int().min(10).max(300),
  enableFullscreenButton: z.coerce.boolean(),
  hideCursor: z.coerce.boolean(),
  showEmptyMessage: z.coerce.boolean()
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), sortOrder: z.number().int().min(0) }))
});
