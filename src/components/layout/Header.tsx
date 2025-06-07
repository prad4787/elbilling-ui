import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex justify-between items-center shadow-soft">
      <div className="flex items-center flex-1">
        <h1 className="text-xl font-bold text-gray-900 mr-8">
          Inventory Management
        </h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => navigate('/profile')}
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3 group-hover:scale-105 transition-transform duration-200">
              <User size={16} />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;