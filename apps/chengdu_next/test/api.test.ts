import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request, { Response } from 'supertest';
import resetDb from './seed';
import { beforeEach } from '@vitest/runner';
import dotenv from 'dotenv';

const envPath = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envPath });

console.log('当前环境:', process.env.NODE_ENV);
console.log('使用的数据库URL:', process.env.DATABASE_URL?.split('@')[1]);

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api';

// Test data for request bodies
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

interface ApiResponse<T> {
  code: number;
  data: T;
}

// 启动和关闭服务器
beforeAll(async () => {
  // 确保环境变量已设置
});

afterAll(async () => {
  // 清理资源
  await resetDb('test');
});

beforeEach(async () => {
  try {
    await resetDb('test');
    console.log('Database reset successful');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
});

// 通用检查响应格式的函数
const expectSuccessResponse = (response: Response) => {
  expect(response.status).toBe(200);
  const body = response.body as ApiResponse<unknown>;
  expect(body.code).toBe(200);
  expect(body.data).toBeDefined();
};

// 测试套件
describe('业务系统 API 测试', () => {
  // 健康检查
  describe('健康检查 API', () => {
    it('GET /health - 应返回成功响应', async () => {
      const response = await request(BASE_URL).get('/health');
      expect(response.status).toBe(200);
    });
  });

  // 行政区划
  describe('行政区划 API', () => {
    it('GET /city/cityList - 应返回城市列表', async () => {
      const response = await request(BASE_URL)
        .get('/city/cityList')
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');
      expect(Array.isArray(response.body.data.list)).toBe(true);

      if (response.body.data.list.length > 0) {
        const city = response.body.data.list[0];
        expect(city).toHaveProperty('id');
        expect(city).toHaveProperty('name');
      }
    });

    it('POST /district/list - 应返回区域列表', async () => {
      const response = await request(BASE_URL)
        .post('/district/list')
        .set('authorization', 'valid-api-key')
        .send({ parentId: testData.cityId });

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');
      expect(Array.isArray(response.body.data.list)).toBe(true);

      if (response.body.data.list.length > 0) {
        const district = response.body.data.list[0];
        expect(district).toHaveProperty('id');
        expect(district).toHaveProperty('name');
      }
    });
  });

  // 商圈相关
  describe('商圈 API', () => {
    it('POST /cbd/list - 应返回商圈列表', async () => {
      const response = await request(BASE_URL)
        .post('/cbd/list')
        .set('authorization', 'valid-api-key')
        .send({ districtId: testData.districtId });

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');
      expect(Array.isArray(response.body.data.list)).toBe(true);

      if (response.body.data.list.length > 0) {
        const cbd = response.body.data.list[0];
        expect(cbd).toHaveProperty('id');
        expect(cbd).toHaveProperty('name');
        expect(cbd).toHaveProperty('addr');
      }
    });
  });

  // 物业小区
  describe('物业小区 API', () => {
    it('POST /part/list - 应返回物业小区列表', async () => {
      const response = await request(BASE_URL)
        .post('/part/list')
        .set('authorization', 'valid-api-key')
        .send({ cbdId: testData.cbdId });

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');

      if (response.body.data.list.length > 0) {
        const part = response.body.data.list[0];
        expect(part).toHaveProperty('id');
        expect(part).toHaveProperty('name');
        expect(part).toHaveProperty('sequence');
        expect(part).toHaveProperty('total_space');
      }
    });

    it('GET /part/{id} - 应返回物业小区详情', async () => {
      const response = await request(BASE_URL)
        .get(`/part/${testData.partId}`)
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('sequence');
      expect(response.body.data).toHaveProperty('total_space');
    });

    it('POST /part/add - 应成功新增物业小区', async () => {
      const newPart = {
        cbdId: testData.cbdId,
        name: '测试物业小区',
        sequence: 1
      };

      const response = await request(BASE_URL)
        .post('/part/add')
        .set('authorization', 'valid-api-key')
        .send(newPart);

      expectSuccessResponse(response);
    });

    it('POST /part/update - 应成功编辑物业小区', async () => {
      const updatePart = {
        id: testData.partId,
        name: '更新的物业小区名称'
      };

      const response = await request(BASE_URL)
        .post('/part/update')
        .set('authorization', 'valid-api-key')
        .send(updatePart);

      expectSuccessResponse(response);
    });

    it('POST /part/delete - 应成功删除物业小区', async () => {
      const response = await request(BASE_URL)
        .post('/part/delete')
        .set('authorization', 'valid-api-key')
        .send({ id: testData.partIdNoPosition });

      expectSuccessResponse(response);
    });
  });

  // 铺位
  describe('铺位 API', () => {
    it('POST /position/list - 应返回铺位列表', async () => {
      const response = await request(BASE_URL)
        .post('/position/list')
        .set('authorization', 'valid-api-key')
        .send({ partId: testData.partId });

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');

      if (response.body.data.list.length > 0) {
        const position = response.body.data.list[0];
        expect(position).toHaveProperty('positionId');
        expect(position).toHaveProperty('position_no');
        expect(position).toHaveProperty('total_space');
      }
    });

    it('GET /position/{id} - 应返回铺位详情', async () => {
      const response = await request(BASE_URL)
        .get(`/position/${testData.positionId}`)
        .set('authorization', 'valid-api-key');

      // 注意：这个API返回201状态码
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('positionId');
      expect(response.body.data).toHaveProperty('position_no');
    });

    it('POST /position/add - 应成功新增铺位', async () => {
      const newPosition = {
        cbdId: testData.cbdId,
        partId: testData.partId,
        no: 'A-101'
      };

      const response = await request(BASE_URL)
        .post('/position/add')
        .set('authorization', 'valid-api-key')
        .send(newPosition);

      expectSuccessResponse(response);
    });

    it('POST /position/update - 应成功编辑铺位', async () => {
      const updatePosition = {
        id: testData.positionId,
        no: 'A-102'
      };

      const response = await request(BASE_URL)
        .post('/position/update')
        .set('authorization', 'valid-api-key')
        .send(updatePosition);

      expectSuccessResponse(response);
    });

    it('POST /position/set - 应成功设置为空铺', async () => {
      const response = await request(BASE_URL)
        .post('/position/set')
        .set('authorization', 'valid-api-key')
        .send({ id: testData.positionId });

      expectSuccessResponse(response);
    });

    it('POST /position/bindShop - 应成功关联新商家', async () => {
      const response = await request(BASE_URL)
        .post('/position/bindShop')
        .set('authorization', 'valid-api-key')
        .send({
          id: testData.positionIdNoShop,
          shopId: testData.shopIdNoSpace
        });

      expectSuccessResponse(response);
    });

    it('POST /position/mark - 应成功标记铺位', async () => {
      const response = await request(BASE_URL)
        .post('/position/mark')
        .set('authorization', 'valid-api-key')
        .send({
          id: testData.positionId,
          remark: '测试标记'
        });

      expectSuccessResponse(response);
    });


    it('POST /position/delete - 应成功删除铺位', async () => {
      await request(BASE_URL)
        .post('/position/set')
        .set('authorization', 'valid-api-key')
        .send({ id: testData.positionId });

      const response = await request(BASE_URL)
        .post('/position/delete')
        .set('authorization', 'valid-api-key')
        .send({ id: testData.positionId });

      expectSuccessResponse(response);
    });
  });

  // 商家
  describe('商家 API', () => {
    it('GET /shop/list - 应返回商家列表', async () => {
      const response = await request(BASE_URL)
        .get('/shop/list')
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');

      if (response.body.data.list.length > 0) {
        const shop = response.body.data.list[0];
        expect(shop).toHaveProperty('id');
        expect(shop).toHaveProperty('trademark');
        expect(shop).toHaveProperty('business_type');
      }
    });

    it('GET /shop/listUnbind - 应返回未关联商家列表', async () => {
      const response = await request(BASE_URL)
        .get('/shop/listUnbind')
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');
    });

    it('GET /shop/{id} - 应返回商家详情', async () => {
      const response = await request(BASE_URL)
        .get(`/shop/${testData.shopId}`)
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('trademark');
    });

    it('POST /shop/add - 应成功新增商家', async () => {
      const newShop = {
        cbdId: testData.cbdId,
        partId: testData.partId,
        shop_no: "AS007",
        type: 'RESTAURANT', // 餐饮
        business_type: 'INDEPENDENT', // 独立自营店
        trademark: '测试品牌',
        location: [116.123, 39.456],
        duration: 'LESS_THAN_ONE', // 1~2年
        average_expense: [2000, 5000],
        sex: 'ALL', // 不限
        age: [18, 45],
        business_hours: [9, 21],
        rest_days: ['SUNDAY'], // 周日
        volume_peak: ['LUNCH', 'DINNER'], // 午餐、晚餐
        season: ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'], // 四季
        price_base: 3000
      };

      const response = await request(BASE_URL)
        .post('/shop/add')
        .set('authorization', 'valid-api-key')
        .send(newShop);

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('id');
    });

    it('POST /shop/update - 应成功编辑商家', async () => {
      const updateShop = {
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
        price_base: 3500
      };

      const response = await request(BASE_URL)
        .post('/shop/update')
        .set('authorization', 'valid-api-key')
        .send(updateShop);

      expectSuccessResponse(response);
    });

    it('POST /shop/delete - 应成功删除商家', async () => {
      const response = await request(BASE_URL)
        .post('/shop/delete')
        .set('authorization', 'valid-api-key')
        .send({ id: testData.shopIdNoSpace });

      expectSuccessResponse(response);
    });
  });

  // 广告位
  describe('广告位 API', () => {
    it('POST /space/list - 应返回广告位列表', async () => {
      const response = await request(BASE_URL)
        .post('/space/list')
        .set('authorization', 'valid-api-key')
        .send({ shopId: testData.shopId });

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');

      if (response.body.data.list.length > 0) {
        const space = response.body.data.list[0];
        expect(space).toHaveProperty('id');
        expect(space).toHaveProperty('type');
        expect(space).toHaveProperty('shopId');
      }
    });

    it('GET /space/{id} - 应返回广告位详情', async () => {
      const response = await request(BASE_URL)
        .get(`/space/${testData.spaceId}`)
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('type');
      expect(response.body.data).toHaveProperty('shopId');
    });

    it('POST /space/add - 应成功新增广告位', async () => {
      const newSpace = {
        shopId: testData.shopId,
        type: 'TABLE_STICKER', // 方桌不干胶贴
        setting: {
          size: {
            width: 21,  // 宽度（毫米）
            height: 297  // 高度（毫米），类似A4纸大小
          },
          material: "PVC不干胶贴纸",  // 材质
          installation: "贴附式",  // 安装方式
          duration: 0,  // 展示时长（秒）- 不适用于静态贴纸，设为0
          frequency: 0   // 播放频率（次/小时）- 不适用于静态贴纸，设为0
        },
        state: 'ENABLED' // 启用
      };

      const response = await request(BASE_URL)
        .post('/space/add')
        .set('authorization', 'valid-api-key')
        .send(newSpace);

      expectSuccessResponse(response);
    });

    it('POST /space/update - 应成功编辑广告位', async () => {
      const updateSpace = {
        id: testData.spaceId,
        type: 'TABLE_STICKER',
        setting: { size: '15x15cm' },
        state: 'ENABLED'
      };

      const response = await request(BASE_URL)
        .post('/space/update')
        .set('authorization', 'valid-api-key')
        .send(updateSpace);

      expectSuccessResponse(response);
    });


    it('POST /space/updateState - 应成功更新广告位状态', async () => {
      const response = await request(BASE_URL)
        .post('/space/updateState')
        .set('authorization', 'valid-api-key')
        .send({
          id: testData.spaceId,
          state: 'DISABLED' // 禁用
        });

      expectSuccessResponse(response);
    });

    it('POST /space/delete - 应成功删除广告位', async () => {
      const response = await request(BASE_URL)
        .post('/space/delete')
        .set('authorization', 'valid-api-key')
        .send({ id: testData.spaceId });

      expectSuccessResponse(response);
    });

  });

  // 仪表盘
  describe('仪表盘 API', () => {
    it('GET /dashboard - 应返回仪表盘统计数据', async () => {
      const response = await request(BASE_URL)
        .get('/dashboard')
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('cbdCount');
      expect(response.body.data).toHaveProperty('partCount');
      expect(response.body.data).toHaveProperty('positionCount');
      expect(response.body.data).toHaveProperty('shopCount');
      expect(response.body.data).toHaveProperty('spaceCount');
      expect(response.body.data).toHaveProperty('campaignCount');
    });

    it('GET /dashboard/recent-shops - 应返回最近添加的商家', async () => {
      const response = await request(BASE_URL)
        .get('/dashboard/recent-shops')
        .query({ limit: '3' })
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const shop = response.body.data[0];
        expect(shop).toHaveProperty('id');
        expect(shop).toHaveProperty('trademark');
        expect(shop).toHaveProperty('createdAt');
      }
    });

    it('GET /dashboard/cbd-distribution - 应返回商圈分布统计', async () => {
      const response = await request(BASE_URL)
        .get('/dashboard/cbd-distribution')
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const cbd = response.body.data[0];
        expect(cbd).toHaveProperty('id');
        expect(cbd).toHaveProperty('name');
        expect(cbd).toHaveProperty('shopCount');
      }
    });

    it('GET /dashboard/shop-type-distribution - 应返回商家类型分布', async () => {
      const response = await request(BASE_URL)
        .get('/dashboard/shop-type-distribution')
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const typeData = response.body.data[0];
        expect(typeData).toHaveProperty('type');
        expect(typeData).toHaveProperty('count');
      }
    });
  });

  // 审计日志
  describe('审计日志 API', () => {
    it('GET /auditLog - 应返回审计日志列表', async () => {
      const response = await request(BASE_URL)
        .get('/auditLog')
        .query({
          page: 1,
          pageSize: 10,
          operationType: 'CREATE',
          targetType: 'SHOP'
        })
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('pageSize');
      expect(response.body.data).toHaveProperty('totalPages');
    });

    it('GET /auditLog/{id} - 应返回审计日志详情', async () => {
      const logId = 'audit-001';
      const response = await request(BASE_URL)
        .get(`/auditLog/${logId}`)
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('operationType');
      expect(response.body.data).toHaveProperty('targetType');
      expect(response.body.data).toHaveProperty('operatorName');
    });

    it('GET /auditLog/stats/operation-types - 应返回操作类型统计', async () => {
      const response = await request(BASE_URL)
        .get('/auditLog/stats/operation-types')
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const stat = response.body.data[0];
        expect(stat).toHaveProperty('operationType');
        expect(stat).toHaveProperty('count');
      }
    });

    it('GET /auditLog/stats/recent-activity - 应返回近期操作记录统计', async () => {
      const response = await request(BASE_URL)
        .get('/auditLog/stats/recent-activity')
        .query({ days: '7' })
        .set('authorization', 'valid-api-key');

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const activity = response.body.data[0];
        expect(activity).toHaveProperty('date');
        expect(activity).toHaveProperty('count');
      }
    });
  });
});
