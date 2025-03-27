import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { CBDListRequestSchema, CBDListResponseSchema } from '@/lib/schema/location'

/**
 * @desc: 获取商圈列表
 * @body: CBDListRequest
 * @response: CBDListResponse
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = CBDListRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const cbds = await prisma.cBD.findMany({
      where: {
        districtId: requestResult.data.districtId,
      },
      select: {
        id: true,
        name: true,
        addr: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    const response = {
      list: cbds,
    }

    // 验证响应数据
    const responseResult = CBDListResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error fetching CBDs:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 