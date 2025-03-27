import { printNode, zodToTs } from 'zod-to-ts';
import fs from 'node:fs';
import path from 'node:path';
import { CBDListRequestSchema, CBDListResponseSchema, CityListResponseSchema, DistrictListRequestSchema, DistrictListResponseSchema } from '@/lib/schema/location';
import {
  ShopAddRequestSchema,
  ShopListRequestSchema,
  ShopListResponseSchema,
  ShopResponseSchema,
  ShopUpdateRequestSchema
} from '@/lib/schema/shop';
import { AuditLogListRequestSchema, AuditLogListResponseSchema } from '@/lib/schema/audit';
import { DashboardStatsResponseSchema, DashboardShopTypeDistributionResponseSchema, DashboardCbdDistributionResponseSchema, DashboardRecentShopsRequestSchema, DashboardRecentShopsResponseSchema } from '@/lib/schema/dashboard';
import { PartListRequestSchema, PartListResponseSchema } from '@/lib/schema/part';
import { PositionListRequestSchema, PositionListResponseSchema, PositionAddRequestSchema, PositionMarkRequestSchema, PositionBindShopRequestSchema, PositionUnbindShopRequestSchema, PositionUpdateRequestSchema, PositionDeleteRequestSchema } from '@/lib/schema/position';
import { SpaceStatsRequestSchema, SpaceStatsResponseSchema, SpaceListRequestSchema, SpaceListResponseSchema, SpaceExportRequestSchema, SpaceAddRequestSchema, SpaceSearchRequestSchema, SpaceSearchResponseSchema, SpaceDeleteRequestSchema, SpacePhotoUploadRequestSchema, SpacePhotoUploadResponseSchema, SpaceBatchDeleteRequestSchema, SpaceBatchDeleteResponseSchema } from '@/lib/schema/space';

function convertZodToTs(schema: any, token: string) {
  const { node } = zodToTs(schema, token)
  const source = (`type ${token} = ` + printNode(node) + ';\n\n')
  const source_old = fs.readFileSync(path.resolve(__dirname, '../lib/schema/types/ZodSchema.ts'))
  if (!source_old.includes(`type ${token} =`)) {
    fs.appendFileSync(path.resolve(__dirname, '../lib/schema/types/ZodSchema.ts'), source)
  }
}
// DistrictListRequestSchema
convertZodToTs(AuditLogListRequestSchema, 'AuditLogListRequest');
convertZodToTs(AuditLogListResponseSchema, 'AuditLogListResponse');
convertZodToTs(CBDListRequestSchema, 'CBDListRequest');
convertZodToTs(CBDListResponseSchema, 'CBDListResponse');
convertZodToTs(CityListResponseSchema, 'CityListResponse');
convertZodToTs(DashboardCbdDistributionResponseSchema, 'DashboardCbdDistributionResponse');
convertZodToTs(DashboardRecentShopsRequestSchema, 'DashboardRecentShopsRequest');
convertZodToTs(DashboardRecentShopsResponseSchema, 'DashboardRecentShopsResponse');
convertZodToTs(DashboardShopTypeDistributionResponseSchema, 'DashboardShopTypeDistributionResponse');
convertZodToTs(DashboardStatsResponseSchema, 'DashboardStatsResponse');
convertZodToTs(DistrictListRequestSchema, 'DistrictListRequest');
convertZodToTs(DistrictListResponseSchema, 'DistrictListResponse');
convertZodToTs(PartListRequestSchema, 'PartListRequest');
convertZodToTs(PartListResponseSchema, 'PartListResponse');
convertZodToTs(PositionAddRequestSchema, 'PositionAddRequest');
convertZodToTs(PositionBindShopRequestSchema, 'PositionBindShopRequest');
convertZodToTs(PositionDeleteRequestSchema, 'PositionDeleteRequest');
convertZodToTs(PositionListRequestSchema, 'PositionListRequest');
convertZodToTs(PositionListResponseSchema, 'PositionListResponse');
convertZodToTs(PositionMarkRequestSchema, 'PositionMarkRequest');
convertZodToTs(PositionUnbindShopRequestSchema, 'PositionUnbindShopRequest');
convertZodToTs(PositionUpdateRequestSchema, 'PositionUpdateRequest');
convertZodToTs(ShopResponseSchema, 'ShopResponse');
convertZodToTs(ShopAddRequestSchema, 'ShopAddRequest');
convertZodToTs(ShopListRequestSchema, 'ShopListRequest');
convertZodToTs(ShopListResponseSchema, 'ShopListResponse');
convertZodToTs(ShopUpdateRequestSchema, 'ShopUpdateRequest');
convertZodToTs(SpaceAddRequestSchema, 'SpaceAddRequest');
convertZodToTs(SpaceBatchDeleteRequestSchema, 'SpaceBatchDeleteRequest');
convertZodToTs(SpaceBatchDeleteResponseSchema, 'SpaceBatchDeleteResponse');
convertZodToTs(SpaceDeleteRequestSchema, 'SpaceDeleteRequest');
convertZodToTs(SpaceExportRequestSchema, 'SpaceExportRequest');
convertZodToTs(SpaceListRequestSchema, 'SpaceListRequest');
convertZodToTs(SpaceListResponseSchema, 'SpaceListResponse');
convertZodToTs(SpacePhotoUploadRequestSchema, 'SpacePhotoUploadRequest');
convertZodToTs(SpacePhotoUploadResponseSchema, 'SpacePhotoUploadResponse');
convertZodToTs(SpaceSearchRequestSchema, 'SpaceSearchRequest');
convertZodToTs(SpaceSearchResponseSchema, 'SpaceSearchResponse');
convertZodToTs(SpaceStatsRequestSchema, 'SpaceStatsRequest');
convertZodToTs(SpaceStatsResponseSchema, 'SpaceStatsResponse');
