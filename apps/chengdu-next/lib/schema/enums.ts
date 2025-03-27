import { createZodEnumWithDescriptions } from '../zod-utils'; // 假设这是工具函数所在文件

// 商家类型枚举
export const ShopType = createZodEnumWithDescriptions({
  RESTAURANT: '餐饮',
  LIGHT_FOOD: '轻食',
  TEA_HOUSE: '茶楼',
  TEA_COFFEE: '茶饮/咖啡',
  COFFEE_SHOP: '咖啡馆',
  HOTEL: '酒店',
});
export const ShopTypeEnum = ShopType.schema;

// 商业类型枚举
export const BusinessType = createZodEnumWithDescriptions({
  INDEPENDENT: '独立经营',
  CHAIN_DIRECT: '连锁直营',
  CHAIN_FRANCHISE: '连锁加盟',
});
export const BusinessTypeEnum = BusinessType.schema;

// 性别枚举
export const Gender = createZodEnumWithDescriptions({
  ALL: '全部',
  MALE: '男',
  FEMALE: '女',
});
export const GenderEnum = Gender.schema;

// 联系人类型枚举
export const ContactType = createZodEnumWithDescriptions({
  OWNER: '店主',
  MANAGER: '经理',
  STAFF: '员工',
  HEADQUARTERS: '总部',
});
export const ContactTypeEnum = ContactType.schema;

// 经营时长枚举
export const OperationDuration = createZodEnumWithDescriptions({
  LESS_THAN_ONE: '少于1年',
  ONE_TO_TWO: '1-2年',
  TWO_TO_FIVE: '2-5年',
  MORE_THAN_FIVE: '5年以上',
});
export const OperationDurationEnum = OperationDuration.schema;

// 休息日枚举
export const RestDay = createZodEnumWithDescriptions({
  MONDAY: '星期一',
  TUESDAY: '星期二',
  WEDNESDAY: '星期三',
  THURSDAY: '星期四',
  FRIDAY: '星期五',
  SATURDAY: '星期六',
  SUNDAY: '星期日',
  ON_DEMAND: '按需休息',
});
export const RestDayEnum = RestDay.schema;

// 客流高峰枚举
export const PeakTime = createZodEnumWithDescriptions({
  BREAKFAST: '早餐',
  LUNCH: '午餐',
  DINNER: '晚餐',
  LATE_NIGHT: '深夜',
  MORNING: '上午',
  AFTERNOON: '下午',
  EVENING: '傍晚',
  MIDNIGHT: '午夜',
});
export const PeakTimeEnum = PeakTime.schema;

// 季节枚举
export const Season = createZodEnumWithDescriptions({
  SPRING: '春季',
  SUMMER: '夏季',
  AUTUMN: '秋季',
  WINTER: '冬季',
  HOLIDAY: '节假日',
  WORKDAY: '工作日',
  NON_WORKDAY: '非工作日',
});
export const SeasonEnum = Season.schema;

// 广告位类型枚举
export const SpaceType = createZodEnumWithDescriptions({
  TABLE_STICKER: '桌贴',
  TABLE_PLACEMAT: '桌垫',
  STAND: '立牌',
  X_BANNER: 'X展架',
  TV_LED: '电视/LED屏',
  PROJECTOR: '投影仪',
});
export const SpaceTypeEnum = SpaceType.schema;

// 广告位状态枚举
export const SpaceState = createZodEnumWithDescriptions({
  ENABLED: '启用',
  DISABLED: '禁用',
});
export const SpaceStateEnum = SpaceState.schema;

// 广告位位置枚举
export const SpaceSite = createZodEnumWithDescriptions({
  MAIN_AREA: '主区域',
  SHOP_ENTRANCE: '店门口',
  ENTRANCE_PASSAGE: '入口通道',
  PRIVATE_ROOM: '包间',
  TOILET_PASSAGE: '洗手间通道',
  TOILET: '洗手间',
  OUTDOOR_AREA: '户外区域',
  OUTSIDE_WALL: '外墙',
  STREET_WALL: '街边墙',
});
export const SpaceSiteEnum = SpaceSite.schema;

// 广告位稳定性枚举
export const SpaceStability = createZodEnumWithDescriptions({
  FIXED: '固定',
  SEMI_FIXED: '半固定',
  MOVABLE: '可移动',
  TEMPORARY: '临时',
});
export const SpaceStabilityEnum = SpaceStability.schema;

// 操作类型枚举
export const OperationType = createZodEnumWithDescriptions({
  BROWSE: '浏览',
  CREATE: '创建',
  UPDATE: '更新',
  DELETE: '删除',
});
export const OperationTypeEnum = OperationType.schema;

// 操作对象枚举
export const OperationTarget = createZodEnumWithDescriptions({
  CBD: '商业区',
  PART: '部件',
  POSITION: '位置',
  SHOP: '店铺',
  SPACE: '空间',
  DASHBOARD: '仪表盘',
  CITY: '城市',
  DISTRICT: '区域',
});
export const OperationTargetEnum = OperationTarget.schema;
