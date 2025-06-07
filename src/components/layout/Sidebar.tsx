import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Users, FileText, BarChart3, List, Scissors, Clock, Building2 } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    // Check for exact match
    if (location.pathname === path) {
      return true;
    }
    
    // Check for parent path matches
    if (path === '/bills' && (location.pathname.startsWith('/bills/') || location.pathname === '/bills')) {
      return true;
    }
    if (path === '/customers' && (location.pathname.startsWith('/customers/') || location.pathname === '/customers')) {
      return true;
    }
    if (path === '/stocks' && (location.pathname.startsWith('/stocks/') || location.pathname === '/stocks')) {
      return true;
    }
    if (path === '/categories' && (location.pathname.startsWith('/categories/') || location.pathname === '/categories')) {
      return true;
    }
    if (path === '/tailor-counters' && (location.pathname.startsWith('/tailor-counters/') || location.pathname === '/tailor-counters')) {
      return true;
    }
    if (path === '/item-status' && (location.pathname.startsWith('/item-status/') || location.pathname === '/item-status')) {
      return true;
    }
    if (path === '/organization' && (location.pathname.startsWith('/organization/') || location.pathname === '/organization')) {
      return true;
    }
    if (path === '/reports' && (location.pathname.startsWith('/reports/') || location.pathname === '/reports')) {
      return true;
    }
    
    return false;
  };
  
  const navItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard', color: 'text-primary-500' },
    { name: 'Stocks', icon: <Package size={20} />, path: '/stocks', color: 'text-green-500' },
    { name: 'Customers', icon: <Users size={20} />, path: '/customers', color: 'text-purple-500' },
    { name: 'Bills', icon: <FileText size={20} />, path: '/bills', color: 'text-orange-500' },
    { name: 'Categories', icon: <List size={20} />, path: '/categories', color: 'text-pink-500' },
    { name: 'Tailor Counters', icon: <Scissors size={20} />, path: '/tailor-counters', color: 'text-yellow-600' },
    { name: 'Item Status', icon: <Clock size={20} />, path: '/item-status', color: 'text-info-500' },
    { name: 'Organization', icon: <Building2 size={20} />, path: '/organization', color: 'text-indigo-500' },
    { name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports', color: 'text-gray-500' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block overflow-y-auto shadow-soft">
      <div className="h-16 px-6 border-b border-gray-100 flex items-center">
        <Link to="/" className="flex items-center group">
          <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">Inventory</span>
            <div className="text-xs text-gray-500 font-medium">Management System</div>
          </div>
        </Link>
      </div>
      
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700 shadow-soft border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`mr-3 transition-colors duration-200 ${
                  isActive(item.path) ? 'text-primary-600' : item.color
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;