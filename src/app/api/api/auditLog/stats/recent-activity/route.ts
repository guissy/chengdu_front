import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.auditLog.groupBy({
      by: ['operationTime'],
      where: {
        operationTime: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    const stats = logs.map((log) => ({
      date: log.operationTime.toISOString().split('T')[0],
      count: log._count.id,
    }));

    return successResponse(stats);
  } catch (error) {
    console.error('Failed to fetch recent activity stats:', error);
    return errorResponse('获取近期操作记录统计失败');
  }
}
