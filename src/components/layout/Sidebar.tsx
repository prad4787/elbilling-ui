import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Users, FileText, BarChart3, List, Scissors, Clock } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Stocks', icon: <Package size={20} />, path: '/stocks' },
    { name: 'Customers', icon: <Users size={20} />, path: '/customers' },
    { name: 'Bills', icon: <FileText size={20} />, path: '/bills' },
    { name: 'Categories', icon: <List size={20} />, path: '/categories' },
    { name: 'Tailor Counters', icon: <Scissors size={20} />, path: '/tailor-counters' },
    { name: 'Item Status', icon: <Clock size={20} />, path: '/item-status' },
    { name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' }
  ];

  return (
    <aside className="w-64 bg-indigo-700 text-white hidden md:block overflow-y-auto">
      <div className="py-6 px-4 border-b border-indigo-600">
        <Link to="/" className="flex items-center">
          <Package className="h-8 w-8 mr-2" />
          <span className="text-xl font-bold">Inventory</span>
        </Link>
      </div>
      
      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;