import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const RequestSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  sequence: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const result = RequestSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    const { id, name, sequence } = result.data

    // 检查物业小区是否存在
    const existingPart = await prisma.part.findUnique({
      where: { id },
    })

    if (!existingPart) {
      return errorResponse('Part not found', 404)
    }

    // 更新物业小区
    const part = await prisma.part.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(sequence !== undefined && { sequence }),
      },
    })

    return successResponse(part)
  } catch (error) {
    console.error('Error updating part:', error)
    return errorResponse('Internal Server Error', 500)
  }
}