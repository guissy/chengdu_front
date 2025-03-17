import React from 'react';
import { FiGrid, FiHome, FiMap, FiMapPin, FiMonitor, FiShoppingBag, FiTarget } from 'react-icons/fi';

// 路由配置接口
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  name: string;
  icon?: React.ReactNode;
  hideInMenu?: boolean;
}

export const routes: Partial<RouteConfig>[] = [
  {
    path: '/dashboard',
    name: '仪表盘',
    icon: <FiHome />,
  },
  {
    path: '/audit-list',
    name: '审核列表',
    icon: <FiHome />,
    hideInMenu: true,
  },
  {
    path: '/part',
    name: '物业小区',
    icon: <FiGrid />,
  },
  {
    path: '/part/:id',
    name: '小区详情',
    hideInMenu: true,
  },
  {
    path: '/position',
    name: '铺位管理',
    icon: <FiMapPin />,
  },
  {
    path: '/position/:id',
    name: '铺位详情',
    hideInMenu: true,
  },
  {
    path: '/shop',
    name: '商家管理',
    icon: <FiShoppingBag />,
  },
  {
    path: '/shop/:id',
    name: '商家详情',
    hideInMenu: true,
  },
  {
    path: '/space',
    name: '广告位管理',
    icon: <FiMonitor />,
  },
  {
    path: '/space/:id',
    name: '广告位详情',
    hideInMenu: true,
  },
  {
    path: '/district',
    name: '行政区划',
    icon: <FiMap />,
  },
  {
    path: '/cbd',
    name: '商圈管理',
    icon: <FiTarget />,
  },
];
