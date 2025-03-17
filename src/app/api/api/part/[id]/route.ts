import { prisma } from '@/app/lib/prisma'
import { partResponseSchema } from '@/app/lib/schemas/part'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { ErrorWithName } from '@/app/lib/types/prisma'
import { NextRequest } from 'next/server';
import { Part, Position } from '@prisma/client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await context.params).id

    // 查询数据库，找出分区详情
    const part = await prisma.part.findUnique({
      where: { id },
    }) as Part & { positions: Position[] }

    if (!part) {
      return errorResponse('分区不存在', 404)
    }

    // 查询total_space
    const total_space = await prisma.space.count({
      where: {
        shop: {
          cbdId: part.cbdId,
        }
      },
    })

    // 查询total_position
    const total_position = await prisma.position.count({
      where: {
        part: {
          cbdId: part.cbdId,
        },
      },
    })

    // 处理返回数据
    const formattedPart = {
      ...part,
      partId: part.id,
      total_position: total_position,
      total_space: total_space,
    }

    // 验证响应数据
    partResponseSchema.parse(formattedPart)

    return successResponse(formattedPart)
  } catch (error) {
    console.error('Error fetching part detail:', error)
    const err = error as ErrorWithName
    if (err.name === 'ZodError') {
      return errorResponse('请求数据验证失败', 400, err.errors)
    }
    return errorResponse('Internal Server Error')
  }
}
