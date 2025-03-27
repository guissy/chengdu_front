// 🔥 生成 Proto 文件
import { BaseResponseSchema, PaginationParamsSchema } from '@/lib/schema/base';
import { OperationTypeEnum, OperationTargetEnum } from '@/lib/schema/enums';
import fs from 'node:fs';
import { zodToProto } from '@/utils/zod_to_proto';
import { CBDListResponseSchema, CityListResponseSchema, DistrictListResponseSchema } from '@/lib/schema/location';
import { z } from 'zod';
enum PaymentStatus {
  INITIALIZED = 'INITIALIZED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}
export const OrderStatusSchema = z.object({
    requestTag: z.string(),
    requestMethod: z.string(),
    requestUrl: z.string(),
    requestTime: z.string(),
    requestHeader: z.string(),
    requestBody: z.string(),
    responseTime: z.string(),
    responseMessage: z.string(),
    responseStatus: z.string(),
    responseInterval: z.number(),
    remark: z.string(),
    token: z.string().optional(),
    downstreamOrderNo: z.string().optional(),
  })

const schema = {
  OrderStatusSchema,
}

try {
  const protoDefinition1 = zodToProto(schema);
  console.log(protoDefinition1)
  // fs.writeFileSync("/Users/zhonglvgui/Documents/h5/chengdu03/schemas/OrderStatus.proto", protoDefinition1);
} catch (error) {
  console.error(error);
}
