// This file is auto-generated by @hey-api/openapi-ts

import type { GetAuditLogStatsRecentActivityResponse, GetDashboardRecentShopsResponse } from './types.gen';

export const getDashboardRecentShopsResponseTransformer = async (data: any): Promise<GetDashboardRecentShopsResponse> => {
    if (data.data) {
        data.data = data.data.map((item: any) => {
            if (item.createdAt) {
                item.createdAt = new Date(item.createdAt);
            }
            return item;
        });
    }
    return data;
};

export const getAuditLogStatsRecentActivityResponseTransformer = async (data: any): Promise<GetAuditLogStatsRecentActivityResponse> => {
    if (data.data) {
        data.data = data.data.map((item: any) => {
            if (item.date) {
                item.date = new Date(item.date);
            }
            return item;
        });
    }
    return data;
};
