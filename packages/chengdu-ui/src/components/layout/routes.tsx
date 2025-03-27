import React from 'react';
import { FiGrid, FiHome, FiMap, FiMapPin, FiMonitor, FiShoppingBag, FiTarget } from 'react-icons/fi';

// 路由配置接口
export interface RouteConfig {
  path: string;
  name: string;
  icon?: React.ReactElement;
  hideInMenu?: boolean;
}

export const routes: Partial<RouteConfig>[] = [
  {
    path: '/dashboard',
    name: '仪表盘',
    icon: (<FiHome />) as React.ReactElement,
  },
  {
    path: '/audit-list',
    name: '审核列表',
    icon: (<FiHome />) as React.ReactElement,
    hideInMenu: true,
  },
  {
    path: '/part',
    name: '物业小区',
    icon: (<FiGrid />) as React.ReactElement,
  },
  {
    path: '/part/:id',
    name: '小区详情',
    hideInMenu: true,
  },
  {
    path: '/position',
    name: '铺位管理',
    icon: (<FiMapPin />) as React.ReactElement,
  },
  {
    path: '/position/:id',
    name: '铺位详情',
    hideInMenu: true,
  },
  {
    path: '/shop',
    name: '商家管理',
    icon: (<FiShoppingBag />) as React.ReactElement,
  },
  {
    path: '/shop/:id',
    name: '商家详情',
    hideInMenu: true,
  },
  {
    path: '/space',
    name: '广告位管理',
    icon: (<FiMonitor />) as React.ReactElement,
  },
  {
    path: '/space/:id',
    name: '广告位详情',
    hideInMenu: true,
  },
  {
    path: '/district',
    name: '行政区划',
    icon: (<FiMap />) as React.ReactElement,
  },
  {
    path: '/cbd',
    name: '商圈管理',
    icon: (<FiTarget />) as React.ReactElement,
  },
];
