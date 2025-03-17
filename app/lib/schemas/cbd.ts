import { z } from 'zod'

export const cbdListSchema = z.object({
  districtId: z.string(),
})

export const cbdSchema = z.object({
  id: z.string(),
  name: z.string(),
  // cityId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const cbdListResponseSchema = z.object({
  list: z.array(
    cbdSchema.extend({
      // cbdId: z.string(),
      total_part: z.number(),
    })
  ),
})
