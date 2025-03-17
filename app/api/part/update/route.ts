import { prisma } from '@/app/lib/prisma'
import { partUpdateSchema } from '@/app/lib/schemas/part'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { ErrorWithName } from '@/app/lib/types/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = partUpdateSchema.parse(body)

    const { id, name } = validatedData

    // 验证分区是否存在
    const existingPart = await prisma.part.findUnique({
      where: { id },
    })

    if (!existingPart) {
      return errorResponse('分区不存在', 404)
    }

    // 更新分区
    await prisma.part.update({
      where: { id },
      data: {
        name,
      },
    })

    return successResponse(null)
  } catch (error) {
    console.error('Error updating part:', error)
    const err = error as ErrorWithName
    if (err.name === 'ZodError') {
      return errorResponse('请求数据验证失败', 400, err.errors)
    }
    return errorResponse('Internal Server Error')
  }
}
