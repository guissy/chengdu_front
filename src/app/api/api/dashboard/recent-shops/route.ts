import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const recentShops = await prisma.shop.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shop_no: true,
        trademark: true,
        branch: true,
        type: true,
        type_tag: true,
        business_type: true,
        // verify_status: true,
        cbd: {
          select: {
            id: true,
            name: true,
          },
        },
        part: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    return successResponse(recentShops);
  } catch (error) {
    console.error('Failed to fetch recent shops:', error);
    return errorResponse('获取最近添加的商家失败');
  }
}
