import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { DistrictListRequestSchema, DistrictListResponseSchema } from '@/lib/schema/location'

/**
 * @desc: 获取城市下属区县列表
 * @body: DistrictListRequest
 * @response: DistrictListResponse
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求参数
    const requestResult = DistrictListRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const districts = await prisma.district.findMany({
      where: {
        cityId: requestResult.data.parentId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    const response = {
      list: districts,
    }

    // 验证响应数据
    const responseResult = DistrictListResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error fetching districts:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
