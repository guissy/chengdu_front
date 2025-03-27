import { z } from 'zod';
import { BaseResponseSchema } from './base';
import { ShopTypeEnum } from './enums';

// 分区模型
export const PartSchema = z.object({
  id: z.string(),
  name: z.string().describe('分区名称'),
  sequence: z.number().describe('排序值'),
  cbdId: z.string().describe('商圈id'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 分区列表请求
export const PartListRequestSchema = z.object({
  cbdId: z.string().optional().describe('商圈ID'),
});

// 分区列表响应
export const PartListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    list: z.array(z.object({
      id: z.string(),
      name: z.string(),
      sequence: z.number(),
      total_space: z.number(),
    })),
  }).optional(),
});

// 分区新增请求
export const PartAddRequestSchema = z.object({
  cbdId: z.string().describe('商圈ID'),
  name: z.string().describe('分区名称'),
  sequence: z.number().describe('排序值'),
});

// 分区更新请求
export const PartUpdateRequestSchema = z.object({
  id: z.string().describe('分区ID'),
  name: z.string().describe('分区名称'),
});
