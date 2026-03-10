import { z } from "zod";

export const annotationSchema = z.object({
  user_id: z.string().trim().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().trim().default(""),
  extra_tags: z.array(z.string().trim()).default([])
});

export const ownershipSchema = z.object({
  owner_user_id: z.string().trim().optional(),
  visibility: z.enum(["private", "public"]).default("private")
});

export const importJsonRequestSchema = z.object({
  document: z.unknown(),
  raw_capture: z.unknown().optional(),
  annotations: annotationSchema.optional(),
  ownership: ownershipSchema.optional()
});

export const importUrlRequestSchema = z.object({
  url: z.string().url(),
  manual_notes: z.string().default(""),
  annotations: annotationSchema.optional(),
  ownership: ownershipSchema.optional()
});

export const importImageRequestSchema = z.object({
  image_base64: z.string().min(1),
  mime_type: z.string().min(1).default("image/png"),
  source_url: z.string().url().optional(),
  manual_notes: z.string().default(""),
  annotations: annotationSchema.optional(),
  ownership: ownershipSchema.optional()
});

export const createUserRequestSchema = z.object({
  display_name: z.string().trim().min(1)
});

export const createBookRequestSchema = z.object({
  name: z.string().trim().min(1),
  visibility: z.enum(["private", "public"]).default("private")
});

export const saveRecipeToBookRequestSchema = z.object({
  recipe_id: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().trim().default(""),
  extra_tags: z.array(z.string().trim()).default([])
});

export type UserAnnotationInput = z.infer<typeof annotationSchema>;
