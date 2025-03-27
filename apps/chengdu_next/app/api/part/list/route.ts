import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { PartListRequestSchema, PartListResponseSchema } from '@/lib/schema/part'

/**
 * @desc: 获取分区列表
 * @body: PartListRequest
 * @response: PartListResponse
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = PartListRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { cbdId } = requestResult.data

    // 构建查询条件
    const where = cbdId ? { cbdId } : {}

    // 查询分区列表
    const parts = await prisma.part.findMany({
      where,
      select: {
        id: true,
        name: true,
        sequence: true,
        positions: {
          select: {
            total_space: true,
          },
        },
      },
      orderBy: {
        sequence: 'asc',
      },
    })

    // 转换数据格式
    const list = parts.map(part => ({
      id: part.id,
      name: part.name,
      sequence: part.sequence,
      total_space: part.positions.reduce((sum, pos) => sum + pos.total_space, 0),
    }))

    const response = { list }

    // 验证响应数据
    const responseResult = PartListResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error fetching parts:', error)
    return errorResponse('Internal Server Error', 500)
  }
}

/**
 * @desc: 获取分区列表
 * @query: PartListRequest
 * @response: PartListResponse
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const body = {
      cbdId: searchParams.get('cbdId') || undefined,
    }
    
    // 验证请求参数
    const requestResult = PartListRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { cbdId } = requestResult.data

    // 构建查询条件
    const where = cbdId ? { cbdId } : {}

    // 查询分区列表
    const parts = await prisma.part.findMany({
      where,
      select: {
        id: true,
        name: true,
        sequence: true,
        positions: {
          select: {
            total_space: true,
          },
        },
      },
      orderBy: {
        sequence: 'asc',
      },
    })

    // 转换数据格式
    const list = parts.map(part => ({
      id: part.id,
      name: part.name,
      sequence: part.sequence,
      total_space: part.positions.reduce((sum, pos) => sum + pos.total_space, 0),
    }))

    const response = { list }

    // 验证响应数据
    const responseResult = PartListResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error fetching parts:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 