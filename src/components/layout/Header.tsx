import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">
        Inventory Management System
      </h1>
      
      <div className="flex items-center space-x-4">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => navigate('/profile')}
        >
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-2">
            <User size={16} />
          </div>
          <span>{user?.name || 'User'}</span>
        </div>
        
        <button 
          onClick={logout}
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;