import { z } from 'zod'

export const partSchema = z.object({
  id: z.string(),
  name: z.string(),
  cbdId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const partListSchema = z.object({
  cbdId: z.string(),
})

export const partDetailSchema = z.object({
  id: z.string(),
})

export const partAddSchema = z.object({
  name: z.string(),
  cbdId: z.string(),
})

export const partUpdateSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const partDeleteSchema = z.object({
  id: z.string(),
})

export const partListResponseSchema = z.object({
  list: z.array(
    partSchema.extend({
      partId: z.string(),
      total_position: z.number(),
    })
  ),
})

export const partResponseSchema = partSchema.extend({
  partId: z.string(),
  total_position: z.number(),
})
