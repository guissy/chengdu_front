import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // 获取各项统计数据
    const [
      cbdCount,
      partCount,
      positionCount,
      shopCount,
      spaceCount,
    ] = await Promise.all([
      prisma.cBD.count(),
      prisma.part.count(),
      prisma.position.count(),
      prisma.shop.count(),
      prisma.space.count(),
    ])

    return successResponse({
      cbdCount,
      partCount,
      positionCount,
      shopCount,
      spaceCount,
      campaignCount: 0, // 暂时没有 DASHBOARD 表
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 
