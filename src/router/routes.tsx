import React, { lazy } from 'react';
import { FiHome, FiGrid, FiMapPin, FiShoppingBag, FiMonitor, FiMap, FiTarget } from 'react-icons/fi';

// 懒加载页面组件
const Dashboard = lazy(() => import('@/pages/dashboard'));
const PartList = lazy(() => import('@/pages/part/list'));
const PartDetail = lazy(() => import('@/pages/part/detail'));
const PositionList = lazy(() => import('@/pages/position/list'));
const PositionDetail = lazy(() => import('@/pages/position/detail'));
const ShopList = lazy(() => import('@/pages/shop/list'));
const ShopDetail = lazy(() => import('@/pages/shop/detail'));
const SpaceList = lazy(() => import('@/pages/space/list'));
const SpaceDetail = lazy(() => import('@/pages/space/detail'));
const DistrictList = lazy(() => import('@/pages/district/list'));
const CbdList = lazy(() => import('@/pages/cbd/list'));
const AuditList = lazy(() => import('@/pages/audit/list'));

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  name: string;
  icon?: React.ReactNode;
  hideInMenu?: boolean;
}

export const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: Dashboard,
    name: '仪表盘',
    icon: <FiHome />,
  },
  {
    path: '/audit-list',
    component: AuditList,
    name: '审核列表',
    icon: <FiHome />,
    hideInMenu: true,
  },
  {
    path: '/part',
    component: PartList,
    name: '物业小区',
    icon: <FiGrid />,
  },
  {
    path: '/part/:id',
    component: PartDetail,
    name: '小区详情',
    hideInMenu: true,
  },
  {
    path: '/position',
    component: PositionList,
    name: '铺位管理',
    icon: <FiMapPin />,
  },
  {
    path: '/position/:id',
    component: PositionDetail,
    name: '铺位详情',
    hideInMenu: true,
  },
  {
    path: '/shop',
    component: ShopList,
    name: '商家管理',
    icon: <FiShoppingBag />,
  },
  {
    path: '/shop/:id',
    component: ShopDetail,
    name: '商家详情',
    hideInMenu: true,
  },
  {
    path: '/space',
    component: SpaceList,
    name: '广告位管理',
    icon: <FiMonitor />,
  },
  {
    path: '/space/:id',
    component: SpaceDetail,
    name: '广告位详情',
    hideInMenu: true,
  },
  {
    path: '/district',
    component: DistrictList,
    name: '行政区划',
    icon: <FiMap />,
  },
  {
    path: '/cbd',
    component: CbdList,
    name: '商圈管理',
    icon: <FiTarget />,
  },
];
