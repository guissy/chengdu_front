import { z } from 'zod';
import { BaseResponseSchema } from './base';

// 城市模型
export const CitySchema = z.object({
  id: z.string(),
  name: z.string().describe('城市名称'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 城市列表响应
export const CityListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    list: z.array(z.object({
      id: z.string(),
      name: z.string(),
    })),
  }).optional(),
});

// 区域模型
export const DistrictSchema = z.object({
  id: z.string(),
  name: z.string().describe('区域名称'),
  cityId: z.string().describe('城市id'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 区域列表请求
export const DistrictListRequestSchema = z.object({
  parentId: z.string().describe('城市ID'),
});

// 区域列表响应
export const DistrictListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    list: z.array(z.object({
      id: z.string(),
      name: z.string(),
    })),
  }).optional(),
});

// 商圈模型
export const CBDSchema = z.object({
  id: z.string(),
  name: z.string().describe('商圈名称'),
  addr: z.string().nullable().describe('地址'),
  districtId: z.string().describe('行政区划id'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 商圈列表请求
export const CBDListRequestSchema = z.object({
  districtId: z.string().describe('行政区划ID'),
});

// 商圈列表响应
export const CBDListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    list: z.array(z.object({
      id: z.string(),
      name: z.string(),
      addr: z.string().nullable(),
    })),
  }).optional(),
});