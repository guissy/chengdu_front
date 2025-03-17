import { prisma } from '@/app/lib/prisma'
import { partAddSchema } from '@/app/lib/schemas/part'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { ErrorWithName } from '@/app/lib/types/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = partAddSchema.parse(body)

    const { name, cbdId } = validatedData

    // 验证商圈存在
    const existingCbd = await prisma.cBD.findUnique({
      where: { id: cbdId },
    })

    if (!existingCbd) {
      return errorResponse('商圈不存在', 404)
    }

    // 创建分区
    const newPart = await prisma.part.create({
      data: {
        name,
        cbdId,
        sequence: 0,
      },
    })

    return successResponse({ id: newPart.id })
  } catch (error) {
    console.error('Error creating part:', error)
    const err = error as ErrorWithName
    if (err.name === 'ZodError') {
      return errorResponse('请求数据验证失败', 400, err.errors)
    }
    return errorResponse('Internal Server Error')
  }
}
