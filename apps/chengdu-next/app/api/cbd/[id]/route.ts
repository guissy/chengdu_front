import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string(),
})

/**
 * @desc: 获取商圈详情
 * @params: { id: string }
 * @response: { id: string, name: string, addr: string }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 验证参数
    const result = paramsSchema.safeParse(await params)
    if (!result.success) {
      return errorResponse('Invalid parameters', 400, result.error)
    }

    // 2. 查询数据库
    const cbd = await prisma.cBD.findUnique({
      where: {
        id: result.data.id,
      },
      select: {
        id: true,
        name: true,
        addr: true,
      },
    })

    if (!cbd) {
      return errorResponse('CBD not found', 404)
    }

    // 3. 返回成功响应
    return successResponse(cbd)
  } catch (error) {
    console.error('Error fetching CBD:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 
