import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const operationTypes = await prisma.auditLog.groupBy({
      by: ['operationType'],
      _count: {
        operationType: true,
      },
    });

    const stats = operationTypes.map((type) => ({
      operationType: type.operationType,
      count: type._count.operationType,
    }));

    return successResponse(stats);
  } catch (error) {
    console.error('Failed to fetch operation type stats:', error);
    return errorResponse('获取操作类型统计失败');
  }
}
