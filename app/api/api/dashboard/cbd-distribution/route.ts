import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const cbds = await prisma.cBD.findMany({
      select: {
        id: true,
        name: true,
        district: true,
        _count: {
          select: {
            shops: true,
            parts: true,
          },
        },
      },
    });

    const distribution = cbds.map((cbd) => ({
      id: cbd.id,
      name: cbd.name,
      district: cbd.district,
      shopCount: cbd._count.shops,
      partCount: cbd._count.parts,
    }));

    return successResponse(distribution);
  } catch (error) {
    console.error('Failed to fetch CBD distribution:', error);
    return errorResponse('获取商圈分布统计失败');
  }
}
