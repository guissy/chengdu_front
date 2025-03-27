type CityListResponse = {
    code?: number | undefined;
    data?: {
        list: {
            id: string;
            name: string;
        }[];
    } | undefined;
};

type DistrictListResponse = {
    code?: number | undefined;
    data?: {
        list: {
            id: string;
            name: string;
        }[];
    } | undefined;
};

type DistrictListRequest = {
    /** 城市ID */
    parentId: string;
};

type CBDListRequest = {
    /** 行政区划ID */
    districtId: string;
};

type CBDListResponse = {
    code?: number | undefined;
    data?: {
        list: {
            id: string;
            name: string;
            addr: string | null;
        }[];
    } | undefined;
};

type ShopAddRequest = {
    /** 商圈ID */
    cbdId: string;
    /** 分区ID */
    partId: string;
    /** 铺位ID */
    positionId?: string | undefined;
    /** 类型，1-餐饮 2-轻食 3-茶楼 4-茶饮/咖啡 5-咖啡馆 6-酒店 */
    type: string;
    /** 品类标签 */
    type_tag?: string | undefined;
    /** 商业类型，1-独立自营店 2-连锁自营店 3-连锁加盟店 */
    business_type: string;
    /** 字号 */
    trademark: string;
    /** 分店 */
    branch?: string | undefined;
    /** 坐标，经纬度 */
    location: [
        number,
        number
    ];
    /** 是否认证 */
    verified?: boolean;
    /** 经营时长，1-一年内新店 2-1~2年 3-2~5年 4-五年以上 */
    duration: string;
    /** 是否展示消费数据 */
    consume_display?: boolean;
    /** 人均消费最低到最高值，单位(分) */
    average_expense: [
        number,
        number
    ];
    /** 性别，1-不限 2-男 3-女 */
    sex: string;
    /** 年龄段最低到最高值 */
    age: [
        number,
        number
    ];
    /** 身份标签 */
    id_tag?: string | undefined;
    /** 标识图片 */
    sign_photo?: string | undefined;
    /** 认证图片 */
    verify_photo?: string[] | undefined;
    /** 外景图片 */
    environment_photo?: string[] | undefined;
    /** 内景图片 */
    building_photo?: string[] | undefined;
    /** 品牌营销图片 */
    brand_photo?: string[] | undefined;
    /** 联系人姓名 */
    contact_name?: string | undefined;
    /** 联系人电话 */
    contact_phone?: string | undefined;
    /** 联系人类型，1-老板 2-店长 3-店员 4-总店管理人员 */
    contact_type?: string | undefined;
    /** 面积，单位(平方米) */
    total_area?: number | undefined;
    /** 客区面积 */
    customer_area?: number | undefined;
    /** 店员人数 */
    clerk_count?: number | undefined;
    /** 营业时间 */
    business_hours: [
        number,
        number
    ];
    /** 休息日，1-周一 2-周二 3-周三 4-周四 5-周五 6-周六 7-周日 8-按需 */
    rest_days: string[];
    /** 客流高峰，1-早餐 2-午餐 3-晚餐 4-宵夜 5-上午 6-下午 7-晚上 8-深夜 */
    volume_peak: string[];
    /** 1-春 2-夏 3-秋 4-冬 5-节假日 6-工作日 7-非工作日 */
    season: string[];
    /** 商家简介 */
    shop_description?: string | undefined;
    /** 投放简介 */
    put_description?: string | undefined;
    /** 是否开放 */
    displayed?: boolean;
    /** 价格基数（单位：分） */
    price_base: number;
    /** 分类标签 */
    classify_tag?: string | undefined;
    /** 备注 */
    remark?: string | undefined;
};

type AuditLogListRequest = {
    page?: number | undefined;
    pageSize?: number | undefined;
    /** 操作类型 */
    operationType?: string | undefined;
    /** 目标类型 */
    targetType?: string | undefined;
    /** 目标ID */
    targetId?: string | undefined;
    /** 操作人 */
    operator?: string | undefined;
    /** 开始日期 */
    startDate?: string | undefined;
    /** 结束日期 */
    endDate?: string | undefined;
};

type AuditLogListResponse = {
    code?: number | undefined;
    data: {
        list: {
            /** 日志ID */
            id: string;
            /** 操作类型 */
            operationType: "BROWSE" | "CREATE" | "UPDATE" | "DELETE";
            /** 目标类型 */
            targetType: "CBD" | "PART" | "POSITION" | "SHOP" | "SPACE" | "DASHBOARD" | "CITY" | "DISTRICT";
            /** 目标ID */
            targetId: string;
            /** 目标名称 */
            targetName: string;
            /** 操作内容 */
            content: string;
            /** 操作人 */
            operatorName: string;
            /** 操作IP */
            ipAddress: string;
            /** 操作浏览器 */
            userAgent: string;
            /** 操作时间 */
            operationTime: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
};

type DashboardStatsResponse = {
    code?: number | undefined;
    data: {
        /** 商家总数 */
        totalShops: number;
        /** 广告位总数 */
        totalSpaces: number;
        /** 分区总数 */
        totalPartitions: number;
        /** 近期活动统计 */
        recentActivity: {
            /** 新增商家数 */
            shops: number;
            /** 新增广告位数 */
            spaces: number;
            /** 新增分区数 */
            partitions: number;
        };
    };
};

type DashboardShopTypeDistributionResponse = {
    /** 商家类型 */
    type: string;
    /** 数量 */
    count: number;
}[];

type DashboardCbdDistributionResponse = {
    /** 商圈ID */
    id: string;
    /** 商圈名称 */
    name: string;
    /** 数量 */
    shopCount: number;
}[];

type DashboardRecentShopsRequest = {
    /** 返回数量 */
    limit?: number;
};

type DashboardRecentShopsResponse = {
    id: string;
    shop_no: string;
    type: string;
    createdAt: Date;
    trademark: string;
}[];

type PositionListRequest = {
    /** 分区ID */
    partId?: string | undefined;
};

type PositionListResponse = {
    code?: number | undefined;
    data?: {
        list: {
            shopId: string | null;
            shop_no: string | null;
            /** 铺位ID */
            id: string;
            /** 铺位编号 */
            position_no: string;
            /** 广告位总数 */
            total_space?: number;
            /** 已投放广告位总数 */
            put_space?: number;
            /** 价格基数（单位：分） */
            price_base: number;
            /** 是否认证 */
            verified?: boolean;
            /** 是否展示 */
            displayed?: boolean;
            /** 类型 */
            type: ("RESTAURANT" | "LIGHT_FOOD" | "TEA_HOUSE" | "TEA_COFFEE" | "COFFEE_SHOP" | "HOTEL") | null;
            /** 品类标签 */
            type_tag: string | null;
            /** 图片 */
            photo: string[];
            /** 备注 */
            remark: string | null;
            /** 营业时间 [开始时间, 结束时间] */
            business_hours: [
                number,
                number
            ];
        }[];
    } | undefined;
};

type PositionAddRequest = {
    /** 商圈ID */
    cbdId: string;
    /** 分区ID */
    partId: string;
    /** 铺位编号 */
    no: string;
};

type PositionMarkRequest = {
    /** 铺位ID */
    id: string;
    /** 标记内容 */
    remark: string;
};

type PositionBindShopRequest = {
    /** 铺位ID */
    id: string;
    /** 商家ID */
    shopId: string;
};

type PositionUnbindShopRequest = {
    /** 铺位ID */
    id: string;
};

type PositionUpdateRequest = {
    /** 铺位ID */
    id: string;
    /** 铺位编号 */
    no: string;
};

type PositionDeleteRequest = {
    /** 铺位ID */
    id: string;
};

type PartListRequest = {
    /** 商圈ID */
    cbdId?: string | undefined;
};

type PartListResponse = {
    code?: number | undefined;
    data?: {
        list: {
            id: string;
            name: string;
            sequence: number;
            total_space: number;
        }[];
    } | undefined;
};

type ShopListResponse = {
    data: {
        list: {
            id: string;
            shop_no: string;
            trademark?: string | undefined;
            contact_name: string | null;
            contact_phone: string | null;
            position?: ({
                position_no: string;
                partId: string;
            } | undefined) | null;
        }[];
    };
};

type ShopUpdateRequest = {
    /** 联系人姓名 */
    contact_name?: string | undefined;
    /** 联系人电话 */
    contact_phone?: string | undefined;
    /** 经营类型 */
    business_type?: string | undefined;
    /** 商标 */
    trademark?: string | undefined;
    /** 分店名 */
    branch?: string | undefined;
    /** 人均消费 */
    average_expense?: [
        number,
        number
    ] | undefined;
    /** 总面积 */
    total_area?: number | undefined;
    /** 客区面积 */
    customer_area?: number | undefined;
    /** 员工数量 */
    clerk_count?: number | undefined;
    /** 营业时间 */
    business_hours?: [
        number,
        number
    ] | undefined;
    /** 休息日 */
    rest_days?: string[] | undefined;
    /** 商家描述 */
    shop_description?: string | undefined;
};

type ShopListRequest = {
    /** 商圈ID */
    cbdId?: string | undefined;
    /** 搜索关键词 */
    keyword?: string | undefined;
};

type SpaceStatsRequest = {
    /** 商家ID */
    shopId?: string | undefined;
    /** 广告位类型 */
    type?: string | undefined;
    /** 位置 */
    site?: string | undefined;
};

type SpaceStatsResponse = {
    data: {
        /** 总数 */
        total: number;
        /** 按状态统计 */
        byState: {
            [x: string]: number;
        };
        /** 按类型统计 */
        byType: {
            [x: string]: number;
        };
        /** 按位置统计 */
        bySite: {
            [x: string]: number;
        };
        /** 按稳定性统计 */
        byStability: {
            [x: string]: number;
        };
    };
};

type SpaceListRequest = {
    /** 商家ID */
    shopId?: string | undefined;
    /** 广告位类型 */
    type?: string | undefined;
    /** 状态 */
    state?: string | undefined;
    /** 位置 */
    site?: string | undefined;
    /** 稳定性 */
    stability?: string | undefined;
};

type SpaceListResponse = {
    data: {
        list: {
            id: string;
            type: string;
            count: number;
            state: string;
            price_factor: number;
            tag: string | null;
            site: string | null;
            stability: string | null;
            photo: string[];
            description: string | null;
            design_attention: string | null;
            construction_attention: string | null;
            shop: {
                id: string;
                shop_no: string;
            };
        }[];
    };
};

type SpaceExportRequest = {
    /** 商家ID */
    shopId?: string | undefined;
    /** 广告位类型 */
    type?: string | undefined;
    /** 状态 */
    state?: string | undefined;
    /** 位置 */
    site?: string | undefined;
    /** 稳定性 */
    stability?: string | undefined;
    /** 导出格式 */
    format?: "csv" | "excel";
};

type SpaceAddRequest = {
    /** 商家ID */
    shopId: string;
    /** 广告位类型 */
    type: string;
    /** 广告位设置 */
    setting: {
        size?: {
            /** 宽度（毫米） */
            width: number;
            /** 高度（毫米） */
            height: number;
        } | undefined;
        /** 材质 */
        material?: string | undefined;
        /** 安装方式 */
        installation?: string | undefined;
        /** 展示时长（秒） */
        duration?: number | undefined;
        /** 播放频率（次/小时） */
        frequency?: number | undefined;
    };
    /** 广告位数量 */
    count?: number | undefined;
    /** 状态 */
    state?: string | undefined;
    /** 价格因子 */
    price_factor?: number | undefined;
    /** 分类标签 */
    tag?: string | undefined;
    /** 位置 */
    site?: string | undefined;
    /** 稳定性 */
    stability?: string | undefined;
    /** 相册 */
    photo?: string[] | undefined;
    /** 投放推介 */
    description?: string | undefined;
    /** 设计注意事项 */
    design_attention?: string | undefined;
    /** 施工注意事项 */
    construction_attention?: string | undefined;
};

type SpaceSearchRequest = {
    /** 搜索关键词 */
    keyword: string;
    /** 商家ID */
    shopId?: string | undefined;
    /** 广告位类型 */
    type?: string | undefined;
    /** 状态 */
    state?: string | undefined;
    /** 位置 */
    site?: string | undefined;
    /** 稳定性 */
    stability?: string | undefined;
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
};

type SpaceSearchResponse = {
    data: {
        list: {
            id: string;
            type: string;
            count: number;
            state: string;
            price_factor: number;
            tag: string | null;
            site: string | null;
            stability: string | null;
            photo: string[];
            description: string | null;
            design_attention: string | null;
            construction_attention: string | null;
            shop: {
                id: string;
                shop_no: string;
            };
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
};

type SpaceDeleteRequest = {
    /** 广告位ID */
    id: string;
};

type SpacePhotoUploadRequest = {
    /** 广告位ID */
    id: string;
    /** 图片文件列表 */
    photos: any[];
};

type SpacePhotoUploadResponse = {
    data: {
        /** 广告位ID */
        id: string;
        /** 图片URL列表 */
        photo: string[];
    };
};

type SpaceBatchDeleteRequest = {
    /** 广告位ID列表 */
    ids: string[];
};

type SpaceBatchDeleteResponse = {
    data: {
        /** 总数 */
        total: number;
        /** 成功数 */
        success: number;
        /** 失败数 */
        failed: number;
        /** 错误详情 */
        errors: {
            /** 广告位ID */
            id: string;
            /** 错误信息 */
            message: string;
        }[];
    };
};

