import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const typeDistribution = await prisma.shop.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
    });

    const distribution = typeDistribution.map((item) => ({
      type: item.type,
      count: item._count.type,
    }));

    return successResponse(distribution);
  } catch (error) {
    console.error('Failed to fetch shop type distribution:', error);
    return errorResponse('获取商家类型分布失败');
  }
}
