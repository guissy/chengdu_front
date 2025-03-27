import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import resetDb from './seed';
// import { beforeEach } from '@vitest/runner';
import dotenv from 'dotenv';

const envPath = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envPath });

// const BASE_URL = 'http://localhost:3002/api';
const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
console.log('BASE_URL', BASE_URL);

// 测试数据
const testData = {
  cityId: 'city-001',
  districtId: 'dist-001',
  cbdId: 'cbd-001',
  partId: 'part-001',
  partIdNoPosition: 'part-020',
  positionId: 'pos-001',
  positionIdNoShop: 'pos-006',
  shopId: 'shop-001',
  shopIdNoSpace: 'shop-006',
  spaceId: 'space-001',
};

// 启动和关闭服务器
beforeAll(async () => {
  // 初始化服务器，比如： await app.listen({...});
});

afterAll(async () => {
  // 清理工作，比如： await app.close();
});

beforeAll(async () => {
  await resetDb('test');
});

// 定义各个接口的配置信息
const endpoints = [
  {
    name: '健康检查 /health',
    method: 'get',
    path: '/health',
    auth: false,
  },
  {
    name: '城市列表',
    method: 'get',
    path: '/city/cityList',
    auth: true,
  },
  {
    name: '区域列表',
    method: 'post',
    path: '/district/list',
    auth: true,
    payload: { parentId: testData.cityId },
  },
  {
    name: '商圈列表',
    method: 'post',
    path: '/cbd/list',
    auth: true,
    payload: { districtId: testData.districtId },
  },
  {
    name: '物业小区列表',
    method: 'post',
    path: '/part/list',
    auth: true,
    payload: { cbdId: testData.cbdId },
  },
  {
    name: '物业小区详情',
    method: 'get',
    path: `/part/${testData.partId}`,
    auth: true,
  },
  {
    name: '新增物业小区',
    method: 'post',
    path: '/part/add',
    auth: true,
    payload: {
      cbdId: testData.cbdId,
      name: '测试物业小区',
      sequence: 1,
    },
  },
  {
    name: '编辑物业小区',
    method: 'post',
    path: '/part/update',
    auth: true,
    payload: {
      id: testData.partId,
      name: '更新的物业小区名称',
    },
  },
  {
    name: '删除物业小区',
    method: 'post',
    path: '/part/delete',
    auth: true,
    payload: { id: testData.partIdNoPosition },
  },
  {
    name: '铺位列表',
    method: 'post',
    path: '/position/list',
    auth: true,
    payload: { partId: testData.partId },
  },
  {
    name: '铺位详情',
    method: 'get',
    path: `/position/${testData.positionId}`,
    auth: true,
  },
  {
    name: '新增铺位',
    method: 'post',
    path: '/position/add',
    auth: true,
    payload: {
      cbdId: testData.cbdId,
      partId: testData.partId,
      no: 'A-101',
    },
  },
  {
    name: '编辑铺位',
    method: 'post',
    path: '/position/update',
    auth: true,
    payload: {
      id: testData.positionId,
      no: 'A-102',
    },
  },
  {
    name: '设置为空铺（铺位）',
    method: 'post',
    path: '/position/set',
    auth: true,
    payload: { id: testData.positionId },
  },
  {
    name: '关联新商家',
    method: 'post',
    path: '/position/bindShop',
    auth: true,
    payload: {
      id: testData.positionIdNoShop,
      shopId: testData.shopIdNoSpace,
    },
  },
  {
    name: '标记铺位',
    method: 'post',
    path: '/position/mark',
    auth: true,
    payload: {
      id: testData.positionId,
      remark: '测试标记',
    },
  },
  {
    name: '删除铺位',
    method: 'post',
    path: '/position/delete',
    auth: true,
    payload: { id: testData.positionId },
  },
  {
    name: '商家列表',
    method: 'get',
    path: '/shop/list',
    auth: true,
  },
  {
    name: '未关联商家列表',
    method: 'get',
    path: '/shop/listUnbind',
    auth: true,
  },
  {
    name: '商家详情',
    method: 'get',
    path: `/shop/${testData.shopId}`,
    auth: true,
  },
  {
    name: '新增商家',
    method: 'post',
    path: '/shop/add',
    auth: true,
    payload: {
      cbdId: testData.cbdId,
      partId: testData.partId,
      type: 'RESTAURANT',
      business_type: 'INDEPENDENT',
      trademark: '测试品牌',
      location: [116.123, 39.456],
      duration: 'LESS_THAN_ONE',
      average_expense: [2000, 5000],
      sex: 'ALL',
      age: [18, 45],
      business_hours: [9, 21],
      rest_days: ['SUNDAY'],
      volume_peak: ['LUNCH', 'DINNER'],
      season: ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'],
      price_base: 3000,
    },
  },
  {
    name: '编辑商家',
    method: 'post',
    path: '/shop/update',
    auth: true,
    payload: {
      id: testData.shopId,
      type: 'RESTAURANT',
      business_type: 'INDEPENDENT',
      trademark: '更新的品牌名',
      location: [116.123, 39.456],
      duration: 'LESS_THAN_ONE',
      average_expense: [3000, 6000],
      sex: 'ALL',
      age: [20, 50],
      business_hours: [8, 22],
      rest_days: ['SUNDAY'],
      volume_peak: ['LUNCH', 'DINNER'],
      season: ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'],
      price_base: 3500,
    },
  },
  {
    name: '删除商家',
    method: 'post',
    path: '/shop/delete',
    auth: true,
    payload: { id: testData.shopIdNoSpace },
  },
  {
    name: '广告位列表',
    method: 'post',
    path: '/space/list',
    auth: true,
    payload: { shopId: testData.shopId },
  },
  {
    name: '广告位详情',
    method: 'get',
    path: `/space/${testData.spaceId}`,
    auth: true,
  },
  {
    name: '新增广告位',
    method: 'post',
    path: '/space/add',
    auth: true,
    payload: {
      shopId: testData.shopId,
      type: 'TABLE_STICKER',
      setting: { size: '10x10cm' },
      state: 'ENABLED',
    },
  },
  {
    name: '编辑广告位',
    method: 'post',
    path: '/space/update',
    auth: true,
    payload: {
      id: testData.spaceId,
      type: 'TABLE_STICKER',
      setting: { size: '15x15cm' },
      state: 'ENABLED',
    },
  },
  {
    name: '更新广告位状态',
    method: 'post',
    path: '/space/updateState',
    auth: true,
    payload: {
      id: testData.spaceId,
      state: 'DISABLED',
    },
  },
  {
    name: '删除广告位',
    method: 'post',
    path: '/space/delete',
    auth: true,
    payload: { id: testData.spaceId },
  },
  {
    name: '仪表盘统计',
    method: 'get',
    path: '/dashboard',
    auth: true,
  },
  {
    name: '最近添加的商家',
    method: 'get',
    path: '/dashboard/recent-shops?limit=3',
    auth: true,
  },
  {
    name: '商圈分布统计',
    method: 'get',
    path: '/dashboard/cbd-distribution',
    auth: true,
  },
  {
    name: '商家类型分布',
    method: 'get',
    path: '/dashboard/shop-type-distribution',
    auth: true,
  },
  {
    name: '审计日志列表',
    method: 'get',
    path: '/auditLog?page=1&pageSize=10&operationType=CREATE&targetType=SHOP',
    auth: true,
  },
  {
    name: '审计日志详情',
    method: 'get',
    // 注意：此处使用示例 id，需要确保该 id 存在或替换为有效的 id
    path: '/auditLog/2be3db3e-c36b-468d-8c4e-7b92a63980b8',
    auth: true,
  },
  {
    name: '操作类型统计',
    method: 'get',
    path: '/auditLog/stats/operation-types',
    auth: true,
  },
  {
    name: '近期操作记录统计',
    method: 'get',
    path: '/auditLog/stats/recent-activity?days=7',
    auth: true,
  },
];

// 辅助函数：递归删除所有 updatedAt 属性
function omitUpdatedAt(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(omitUpdatedAt);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
      // 如果 key 为 updatedAt，则忽略；否则处理值
      if (key === 'updatedAt') return acc;
      acc[key] = omitUpdatedAt((obj as Record<string, unknown>)[key]);
      return acc;
    }, {});
  }
  return obj;
}

describe.skip('接口快照测试', () => {
  endpoints.forEach(endpoint => {
    it(endpoint.name, async () => {
      const httpMethod = endpoint.method.toLowerCase() as 'get' | 'post';
      // 根据是否需要鉴权设置 header
      const req = request(BASE_URL)[httpMethod](endpoint.path)
        .set('authorization', endpoint.auth ? 'valid-api-key' : '');

      // 如果是 POST 请求且有 payload 则发送数据
      const response =
        httpMethod === 'post'
          ? await req.send(endpoint.payload || {})
          : await req;

      // 可选：对响应状态码做初步断言
      expect(response.status).toBeOneOf([200, 308, 400]);
      // 使用快照保存返回的数据
      expect(omitUpdatedAt(response.body)).toMatchSnapshot();
    });
  });
});
