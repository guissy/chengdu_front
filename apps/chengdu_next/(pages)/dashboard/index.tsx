import { FiGrid, FiLayout, FiMap, FiMapPin, FiMonitor, FiShoppingBag, FiTag } from 'react-icons/fi';
import Link from 'next/link';
import {PageHeader} from "chengdu_ui";
import { useQuery } from '@tanstack/react-query';
import client from '@/lib/api/client';
import RecentAuditLogs from '@/(pages)/audit/recent-audit-logs';

const Dashboard = () => {
  // 这些数据在实际应用中应该从API获取
  const statsRaw = [
    { id: 1, title: '商圈总数', value: 0, key: 'cbdCount', icon: <FiMap className="h-8 w-8" />, color: 'bg-blue-500' },
    { id: 2, title: '物业小区', value: 0, key: 'partCount', icon: <FiGrid className="h-8 w-8" />, color: 'bg-green-500' },
    { id: 3, title: '铺位总数', value: 0, key: 'positionCount', icon: <FiMapPin className="h-8 w-8" />, color: 'bg-yellow-500' },
    { id: 4, title: '商家总数', value: 0, key: 'shopCount', icon: <FiShoppingBag className="h-8 w-8" />, color: 'bg-red-500' },
    { id: 5, title: '广告位总数', value: 0, key: 'spaceCount', icon: <FiLayout className="h-8 w-8" />, color: 'bg-purple-500' },
    { id: 6, title: '广告活动', value: 0, key: 'campaignCount', icon: <FiTag className="h-8 w-8" />, color: 'bg-indigo-500' },
  ];

  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => client.GET("/api/dashboard", {}),
    select: (data) => {
      return statsRaw.map(stat => ({
        ...stat,
        value: data.data?.[stat.key as keyof typeof data.data],
      }));
    }
  })

  const shortcuts = [
    { id: 1, title: '物业小区', description: '管理商圈内的物业小区信息', path: '/part', icon: <FiGrid className="h-6 w-6" /> },
    { id: 2, title: '铺位管理', description: '管理商铺位置和基本信息', path: '/position', icon: <FiMapPin className="h-6 w-6" /> },
    { id: 3, title: '商家管理', description: '管理商家详细信息和状态', path: '/shop', icon: <FiShoppingBag className="h-6 w-6" /> },
    { id: 4, title: '广告位管理', description: '管理各种类型的广告位资源', path: '/space', icon: <FiMonitor className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="仪表盘"
        subtitle="广告位数据概览"
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats?.map((stat) => (
          <div
            key={stat.id}
            className="card bg-base-100 shadow-md transition-all hover:shadow-lg"
          >
            <div className="card-body p-6">
              <div className="flex items-center space-x-4">
                <div className={`rounded-full p-3 ${stat.color} text-white`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-base-content/70">
                    {stat.title}
                  </div>
                  <div className="text-2xl font-semibold">{stat.value as number}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷入口 */}
      <h2 className="mt-8 text-xl font-semibold">快捷入口</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.id}
            href={shortcut.path}
            className="card bg-base-100 shadow transition-all hover:shadow-md"
          >
            <div className="card-body p-6">
              <div className="mb-4">{shortcut.icon}</div>
              <h3 className="card-title text-lg">{shortcut.title}</h3>
              <p className="text-sm text-base-content/70">{shortcut.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 最近活动 */}
      <h2 className="mt-8 text-xl font-semibold">最近活动</h2>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="overflow-x-auto">
            <RecentAuditLogs />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
