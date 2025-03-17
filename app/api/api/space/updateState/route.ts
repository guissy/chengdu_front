import { prisma } from '@/app/lib/prisma'
import { spaceUpdateStateSchema } from '@/app/lib/schemas/space'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Space } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = spaceUpdateStateSchema.parse(body)

    const { id, state } = validatedData

    // 验证广告位是否存在
    const existingSpace = await prisma.space.findUnique({
      where: { id },
    }) as Space

    if (!existingSpace) {
      return errorResponse('广告位不存在', 404)
    }

    // 更新广告位状态
    await prisma.space.update({
      where: { id },
      data: {
        state,
      },
    })

    return successResponse(null)
  } catch (error) {
    console.error('Error updating space state:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
