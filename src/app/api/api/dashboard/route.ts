import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const [totalShops, totalSpaces, totalCbds, totalParts, totalPositions] = await Promise.all([
      prisma.shop.count(),
      prisma.space.count(),
      prisma.cBD.count(),
      prisma.part.count(),
      prisma.position.count()
    ]);

    return successResponse({
      shopCount: totalShops,
      spaceCount: totalSpaces,
      cbdCount: totalCbds,
      partCount: totalParts,
      positionCount: totalPositions,
      campaignCount: 0,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return errorResponse('获取仪表盘统计数据失败');
  }
}
