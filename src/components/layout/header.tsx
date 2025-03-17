import { FiBell, FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import { useUiStore } from '@/store/ui';
import Link from 'next/link';

const Header = () => {
  const { theme, toggleTheme, toggleSidebar } = useUiStore();

  return (
    <header className="bg-base-200 shadow-md">
      <div className="navbar container mx-auto">
        <div className="navbar-start">
          <button
            className="btn btn-ghost btn-square"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <Link href="/" className="btn btn-ghost text-xl normal-case">
            广告位管理平台
          </Link>
        </div>

        <div className="navbar-end gap-2">
          <button
            className="btn btn-ghost btn-circle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? '切换到暗色主题' : '切换到亮色主题'}
          >
            {theme === 'light' ? (
              <FiMoon className="h-5 w-5" />
            ) : (
              <FiSun className="h-5 w-5" />
            )}
          </button>

          <button className="btn btn-ghost btn-circle" aria-label="通知">
            <div className="indicator">
              <FiBell className="h-5 w-5" />
              <span className="badge badge-primary badge-xs indicator-item">2</span>
            </div>
          </button>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="avatar btn btn-circle btn-ghost">
              <div className="size-6 rounded-full">
                <img
                  alt="用户头像"
                  src="https://avatars1.githubusercontent.com/u/7098795?s=460&v=4"
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-sm z-10 mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li>
                <a className="justify-between">
                  个人资料
                  <span className="badge">新</span>
                </a>
              </li>
              <li>
                <a>设置</a>
              </li>
              <li>
                <a>退出登录</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
