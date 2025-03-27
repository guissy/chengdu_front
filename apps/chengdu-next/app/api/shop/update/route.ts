import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { ShopUpdateRequestSchema } from '@/lib/schema/shop'
import { BusinessType, RestDay } from '@prisma/client'

const RequestSchema = z.object({
  id: z.string(),
  ...ShopUpdateRequestSchema.shape
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求参数
    const result = RequestSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    const { id, ...data } = result.data

    // 检查商家是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id },
    })

    if (!existingShop) {
      return errorResponse('Shop not found', 404)
    }

    // 更新商家
    const shop = await prisma.shop.update({
      where: { id },
      data: {
        ...data,
        business_hours: data.business_hours ? data.business_hours.map(h => parseInt(String(h))) : undefined,
        business_type: data.business_type as BusinessType,
        rest_days: data.rest_days ? data.rest_days.map(d => d as RestDay) : undefined,
        average_expense: data.average_expense,
      },
    })

    return successResponse(shop)
  } catch (error) {
    console.error('Error updating shop:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
