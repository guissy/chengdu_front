import { z } from 'zod'

export const citySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const cityListResponseSchema = z.object({
  list: z.array(citySchema),
}) 