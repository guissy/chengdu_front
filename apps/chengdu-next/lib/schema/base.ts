import { z } from 'zod';

// 基础响应模型
export const BaseResponseSchema = z.object({
  code: z.number().optional(),
  data: z.any().optional(),
});

// 分页请求参数
export const PaginationParamsSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

// 分页响应模型
export const PaginationResponseSchema = z.object({
  items: z.array(z.any()),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// 坐标模型
export const LocationSchema = z.tuple([z.number(), z.number()]).describe('坐标，经纬度 [经度, 纬度]');

// 营业时间模型
export const BusinessHoursSchema = z.tuple([z.number(), z.number()]).describe('营业时间 [开始时间, 结束时间]');

// 年龄范围模型
export const AgeRangeSchema = z.tuple([z.number(), z.number()]).describe('年龄段最低到最高值 [最低, 最高]');

// 消费范围模型
export const ExpenseRangeSchema = z.tuple([z.number(), z.number()]).describe('人均消费最低到最高值，单位(分) [最低, 最高]');