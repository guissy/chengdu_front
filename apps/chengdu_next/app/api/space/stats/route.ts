import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { SpaceStatsRequestSchema, SpaceStatsResponseSchema } from '@/lib/schema/space'
import { SpaceType, SpaceSite } from '@prisma/client'

/**
 * @desc: 获取空间统计数据
 * @body: SpaceStatsRequest
 * @response: SpaceStatsResponse
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = SpaceStatsRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { shopId, type, site } = requestResult.data

    // 构建查询条件
    const where = {
      ...(shopId ? { shopId } : {}),
      ...(type ? { type: type as SpaceType } : {}),
      ...(site ? { site: site as SpaceSite } : {}),
    }

    // 获取总数
    const total = await prisma.space.count({ where })

    // 按状态统计
    const byStateResult = await prisma.space.groupBy({
      by: ['state'],
      where,
      _count: true,
    })
    const byState = Object.fromEntries(
      byStateResult.map(item => [item.state, item._count])
    )

    // 按类型统计
    const byTypeResult = await prisma.space.groupBy({
      by: ['type'],
      where,
      _count: true,
    })
    const byType = Object.fromEntries(
      byTypeResult.map(item => [item.type, item._count])
    )

    // 按位置统计
    const bySiteResult = await prisma.space.groupBy({
      by: ['site'],
      where,
      _count: true,
    })
    const bySite = Object.fromEntries(
      bySiteResult.map(item => [item.site || 'UNKNOWN', item._count])
    )

    // 按稳定性统计
    const byStabilityResult = await prisma.space.groupBy({
      by: ['stability'],
      where,
      _count: true,
    })
    const byStability = Object.fromEntries(
      byStabilityResult.map(item => [item.stability || 'UNKNOWN', item._count])
    )

    const response = {
      total,
      byState,
      byType,
      bySite,
      byStability,
    }

    // 验证响应数据
    const responseResult = SpaceStatsResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error getting space stats:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 