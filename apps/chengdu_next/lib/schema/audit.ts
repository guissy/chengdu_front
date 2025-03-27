import { z } from 'zod';
import { BaseResponseSchema, PaginationParamsSchema } from './base';
import { OperationTypeEnum, OperationTargetEnum } from './enums';

// 审计日志基础字段
const auditLogBaseFields = {
  id: z.string().describe('日志ID'),
  operationType: OperationTypeEnum.describe('操作类型'),
  targetType: OperationTargetEnum.describe('目标类型'),
  targetId: z.string().describe('目标ID'),
  targetName: z.string().describe('目标名称'),
  content: z.string().describe('操作内容'),
  operatorName: z.string().describe('操作人'),
  ipAddress: z.string().describe('操作IP'),
  userAgent: z.string().describe('操作浏览器'),
  operationTime: z.date().describe('操作时间'),
};

// 审计日志模型
export const AuditLogSchema = z.object({
  ...auditLogBaseFields,
});

// 审计日志列表请求
export const AuditLogListRequestSchema = PaginationParamsSchema.extend({
  operationType: z.string().optional().describe('操作类型'),
  targetType: z.string().optional().describe('目标类型'),
  targetId: z.string().optional().describe('目标ID'),
  operator: z.string().optional().describe('操作人'),
  startDate: z.string().optional().describe('开始日期'),
  endDate: z.string().optional().describe('结束日期'),
});

// 审计日志列表响应
export const AuditLogListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    list: z.array(z.object({
      ...auditLogBaseFields,
    })),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  }),
});

// 审计日志统计基础字段
const auditLogStatsBaseFields = {
  operationType: z.string().describe('类型'),
  count: z.number().describe('数量'),
};

// 审计日志操作类型统计响应
export const AuditLogOperationTypeStatsResponseSchema = BaseResponseSchema.extend({
  data: z.array(z.object(auditLogStatsBaseFields)).optional(),
});

// 审计日志近期活动统计响应
export const AuditLogRecentActivityStatsResponseSchema = BaseResponseSchema.extend({
  data: z.array(z.object({
    date: z.string().describe('日期'),
    count: z.number().describe('数量'),
  })).optional(),
});

// 审计日志详情响应
export const AuditLogDetailResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    ...auditLogBaseFields,
  }),
}); 
