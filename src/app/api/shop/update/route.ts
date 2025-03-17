import { prisma } from '@/app/lib/prisma'
import { shopUpdateSchema } from '@/app/lib/schemas/shop'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { Shop } from '@prisma/client'
import { ErrorWithName } from '@/app/lib/types/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = shopUpdateSchema.parse(body)

    const { id, ...updateData } = validatedData

    // 验证商家是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id },
    })

    if (!existingShop) {
      return errorResponse('商家不存在', 404)
    }


    // // 验证铺位存在
    // if (updateData.positionId) {
    //   const existingPosition = await prisma.position.findUnique({
    //     where: { id: updateData.positionId },
    //   }) as Position
    //
    //   if (!existingPosition) {
    //     return errorResponse('铺位不存在', 404)
    //   }
    //
    //   // 验证铺位是否已被占用（排除当前商家）
    //   if (existingPosition.shopId && existingPosition.shopId !== id) {
    //     return errorResponse('铺位已被占用', 400)
    //   }
    // }

    // 更新商家信息
    await prisma.shop.update({
      where: { id },
      data: updateData as unknown as Shop,
    })

    return successResponse(null)
  } catch (error) {
    console.error('Error updating shop:', error)
    const err = error as ErrorWithName
    if (err.name === 'ZodError') {
      return errorResponse('请求数据验证失败', 400, err.errors)
    }
    return errorResponse('Internal Server Error')
  }
}
