import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { SpaceState } from '@prisma/client'

const RequestSchema = z.object({
  id: z.string(),
  state: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const result = RequestSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    const { id, state } = result.data

    // 检查广告位是否存在
    const existingSpace = await prisma.space.findUnique({
      where: { id },
    })

    if (!existingSpace) {
      return errorResponse('Space not found', 404)
    }

    // 更新广告位状态
    const space = await prisma.space.update({
      where: { id },
      data: {
        state: state as SpaceState,
      },
    })

    return successResponse(space)
  } catch (error) {
    console.error('Error updating space state:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 