import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const RequestSchema = z.object({
  cbdId: z.string(),
  name: z.string(),
  sequence: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const result = RequestSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    const { cbdId, name, sequence } = result.data

    // 检查商圈是否存在
    const existingCbd = await prisma.cBD.findUnique({
      where: { id: cbdId },
    })

    if (!existingCbd) {
      return errorResponse('CBD not found', 404)
    }

    // 创建分区
    const part = await prisma.part.create({
      data: {
        cbdId,
        name,
        sequence,
      },
    })

    return successResponse(part)
  } catch (error) {
    console.error('Error creating part:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 