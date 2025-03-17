import { z } from 'zod';

export const districtListSchema = z.object({
  keyword: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).default(10),
});

export const districtSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  level: z.number(),
  parentId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const districtListResponseSchema = z.object({
  total: z.number(),
  items: z.array(districtSchema),
});

export type DistrictListRequest = z.infer<typeof districtListSchema>;
export type DistrictListResponse = z.infer<typeof districtListResponseSchema>;
export type District = z.infer<typeof districtSchema>; 