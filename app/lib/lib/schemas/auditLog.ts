import { z } from 'zod';

export const auditLogQuerySchema = z.object({
  keyword: z.string().optional(),
  operationType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).default(10),
});

export const auditLogSchema = z.object({
  id: z.string(),
  operationType: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  userId: z.string(),
  userName: z.string(),
  details: z.string(),
  createdAt: z.string(),
});

export const auditLogResponseSchema = z.object({
  id: z.string(),
  operationType: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  userId: z.string(),
  userName: z.string(),
  details: z.string(),
  createdAt: z.string(),
  changes: z.record(z.unknown()).nullable(),
});

export const paginatedResponseSchema = z.object({
  total: z.number(),
  items: z.array(auditLogSchema),
});

export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type AuditLogResponse = z.infer<typeof auditLogResponseSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>; 