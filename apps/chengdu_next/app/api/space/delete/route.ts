import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { SpaceDeleteRequestSchema } from '@/lib/schema/space'

/**
 * @desc: 删除空间
 * @body: SpaceDeleteRequest
 * @response: { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = SpaceDeleteRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { id } = requestResult.data

    // 检查广告位是否存在
    const space = await prisma.space.findUnique({
      where: { id },
    })

    if (!space) {
      return errorResponse('Space not found', 404)
    }

    // 删除广告位
    await prisma.space.delete({
      where: { id },
    })

    return successResponse({
      message: 'Space deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting space:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 