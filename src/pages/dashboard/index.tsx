import { FiShoppingBag, FiGrid, FiTag, FiMapPin, FiLayout, FiMap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/page-header';

const Dashboard = () => {
  // 这些数据在实际应用中应该从API获取
  const stats = [
    { id: 1, title: '商圈总数', value: 25, icon: <FiMap className="h-8 w-8" />, color: 'bg-blue-500' },
    { id: 2, title: '物业分区', value: 120, icon: <FiGrid className="h-8 w-8" />, color: 'bg-green-500' },
    { id: 3, title: '铺位总数', value: 358, icon: <FiMapPin className="h-8 w-8" />, color: 'bg-yellow-500' },
    { id: 4, title: '店铺总数', value: 275, icon: <FiShoppingBag className="h-8 w-8" />, color: 'bg-red-500' },
    { id: 5, title: '广告位总数', value: 1254, icon: <FiLayout className="h-8 w-8" />, color: 'bg-purple-500' },
    { id: 6, title: '广告活动', value: 42, icon: <FiTag className="h-8 w-8" />, color: 'bg-indigo-500' },
  ];

  const shortcuts = [
    { id: 1, title: '物业分区', description: '管理商圈内的物业分区信息', path: '/part', icon: <FiGrid className="h-6 w-6" /> },
    { id: 2, title: '铺位管理', description: '管理商铺位置和基本信息', path: '/position', icon: <FiMapPin className="h-6 w-6" /> },
    { id: 3, title: '店铺管理', description: '管理店铺详细信息和状态', path: '/shop', icon: <FiShoppingBag className="h-6 w-6" /> },
    { id: 4, title: '广告位管理', description: '管理各种类型的广告位资源', path: '/space', icon: <FiLayout className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="仪表盘"
        subtitle="业务系统数据概览"
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
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
                  <div className="text-2xl font-semibold">{stat.value}</div>
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
            to={shortcut.path}
            className="card bg-base-100 shadow transition-all hover:shadow-md"
          >
            <div className="card-body p-6">
              <div className="mb-4 text-primary">{shortcut.icon}</div>
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
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>操作类型</th>
                  <th>操作内容</th>
                  <th>操作人</th>
                  <th>操作时间</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>新增分区</td>
                  <td>添加了物业分区"北区一层"</td>
                  <td>张三</td>
                  <td>2025-03-10 14:30:45</td>
                </tr>
                <tr>
                  <td>编辑店铺</td>
                  <td>更新了店铺"星巴克太古里店"的信息</td>
                  <td>李四</td>
                  <td>2025-03-10 11:22:18</td>
                </tr>
                <tr>
                  <td>删除广告位</td>
                  <td>删除了广告位"TD-001"</td>
                  <td>王五</td>
                  <td>2025-03-09 16:45:30</td>
                </tr>
                <tr>
                  <td>新增铺位</td>
                  <td>添加了铺位"SLT-1F-005"</td>
                  <td>张三</td>
                  <td>2025-03-09 10:12:55</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
