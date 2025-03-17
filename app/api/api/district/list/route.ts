import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'
import { districtListSchema } from '@/app/lib/schemas/district';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, page, pageSize } = districtListSchema.parse(body);

    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { code: { contains: keyword } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      prisma.district.count({ where }),
      prisma.district.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse({
      total,
      list: items,
    });
  } catch (error) {
    console.error('Failed to fetch district list:', error);
    return errorResponse('获取区域列表失败');
  }
}
