import { z } from 'zod';

export const dashboardStatsSchema = z.object({
  totalShops: z.number(),
  totalSpaces: z.number(),
  totalCbds: z.number(),
  totalParts: z.number(),
});

export const recentShopSchema = z.object({
  id: z.string(),
  shop_no: z.string(),
  trademark: z.string(),
  branch: z.string().nullable(),
  type: z.string(),
  type_tag: z.string().nullable(),
  business_type: z.string(),
  verify_status: z.boolean(),
  cbd: z.object({
    id: z.string(),
    name: z.string(),
  }),
  part: z.object({
    id: z.string(),
    name: z.string(),
  }),
  createdAt: z.string(),
});

export const cbdDistributionSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    district: z.string(),
    shopCount: z.number(),
    partCount: z.number(),
  })
);

export const shopTypeDistributionSchema = z.array(
  z.object({
    type: z.string(),
    count: z.number(),
  })
);

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type RecentShop = z.infer<typeof recentShopSchema>;
export type CbdDistribution = z.infer<typeof cbdDistributionSchema>;
export type ShopTypeDistribution = z.infer<typeof shopTypeDistributionSchema>; 