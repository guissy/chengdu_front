import { prisma } from '@/app/lib/prisma'
import { shopDeleteSchema } from '@/app/lib/schemas/shop'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { ErrorWithName } from '@/app/lib/types/prisma'
import { Shop, Space } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = shopDeleteSchema.parse(body)

    const { id } = validatedData

    // 验证商家是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id },
      include: {
        spaces: true,
      },
    }) as Shop & { spaces: Space[] }

    if (!existingShop) {
      return errorResponse('商家不存在', 404)
    }

    // 检查是否有关联的铺位
    if (existingShop.spaces && existingShop.spaces.length > 0) {
      return errorResponse('该商家还有关联的铺位，无法删除', 400)
    }

    // 删除商家
    await prisma.shop.delete({
      where: { id },
    })

    return successResponse(null)
  } catch (error) {
    console.error('Error deleting shop:', error)
    const err = error as ErrorWithName
    if (err.name === 'ZodError') {
      return errorResponse('请求数据验证失败', 400, err.errors)
    }
    return errorResponse('Internal Server Error')
  }
}
