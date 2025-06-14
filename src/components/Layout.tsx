import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;