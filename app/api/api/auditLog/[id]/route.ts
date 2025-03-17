import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auditLog = await prisma.auditLog.findUnique({
      where: { id: (await params).id },
    });

    if (!auditLog) {
      return errorResponse('审计日志不存在', 404);
    }

    return successResponse(auditLog);
  } catch (error) {
    console.error('Failed to fetch audit log detail:', error);
    return errorResponse('获取审计日志详情失败');
  }
}
