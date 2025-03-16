'use client';

import { usePathname } from 'next/navigation';
import { useUiStore } from '@/store/ui';
import { routes } from './routes';
import Link from 'next/link';

const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen } = useUiStore();
  
  // 只显示没有hideInMenu标记的路由
  const menuRoutes = routes.filter((route) => !route.hideInMenu);
  
  return (
    <aside
      className={`fixed left-0 top-16 z-20 h-[calc(100vh-64px)] w-64 transform bg-base-200 shadow-lg transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full overflow-y-auto p-4">
        <ul className="menu menu-md gap-2">
          {menuRoutes.map((route) => (
            <li key={route.path}>
              <Link
                href={route.path || ''}
                className={`flex items-center gap-3 ${pathname === route.path ? 'active' : ''}`}
              >
                {route.icon && <span>{route.icon}</span>}
                <span>{route.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;