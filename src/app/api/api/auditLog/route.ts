import { errorResponse, successResponse } from '@/app/lib/utils/response';
import { prisma } from '@/app/lib/prisma'
import { auditLogQuerySchema } from '@/app/lib/schemas/auditLog';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      keyword: searchParams.get('keyword') || undefined,
      operationType: searchParams.get('operationType') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
    };

    const validatedQuery = auditLogQuerySchema.parse(query);

    const where = {
      AND: [
        validatedQuery.keyword
          ? {
              OR: [
                { details: { contains: validatedQuery.keyword } },
                { userName: { contains: validatedQuery.keyword } },
              ],
            }
          : {},
        validatedQuery.operationType
          ? { operationType: validatedQuery.operationType }
          : {},
        validatedQuery.startDate
          ? { operationTime: { gte: new Date(validatedQuery.startDate) } }
          : {},
        validatedQuery.endDate
          ? { operationTime: { lte: new Date(validatedQuery.endDate) } }
          : {},
      ],
    } as Prisma.AuditLogWhereInput;

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (validatedQuery.page - 1) * validatedQuery.pageSize,
        take: validatedQuery.pageSize,
        orderBy: { operationTime: 'desc' },
      }),
    ]);
    const pageSize = validatedQuery.pageSize;
    const totalPages = Math.ceil(total / pageSize);
    return successResponse({
      total,
      page: validatedQuery.page,
      pageSize,
      totalPages,
      items,
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return errorResponse('获取审计日志列表失败');
  }
}
