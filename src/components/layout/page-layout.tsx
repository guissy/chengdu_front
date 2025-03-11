import { Outlet } from 'react-router-dom';
import Header from './header';
import Sidebar from './sidebar';
import Footer from './footer';
import { useUiStore } from '@/store/ui';

const PageLayout = () => {
  const { sidebarOpen } = useUiStore();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
