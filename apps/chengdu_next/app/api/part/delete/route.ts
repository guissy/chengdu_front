import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const RequestSchema = z.object({
  id: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const result = RequestSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    const { id } = result.data

    // 检查分区是否存在
    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        positions: true,
      },
    })

    if (!part) {
      return errorResponse('Part not found', 404)
    }

    // 检查是否有关联的铺位
    if (part.positions.length > 0) {
      return errorResponse('Cannot delete part with associated positions', 400)
    }

    // 删除分区
    await prisma.part.delete({
      where: { id },
    })

    return successResponse({
      message: 'Part deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting part:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 