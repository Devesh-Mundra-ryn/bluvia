
import React from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../context/NavigationContext';

interface UserProfileProps {
  onShowLogin: () => void;
  isMobile?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ onShowLogin, isMobile = false }) => {
  const { user, logout } = useAuth();
  const { setActiveTab } = useNavigation();

  const handleLogout = async () => {
    await logout();
    setActiveTab('analysis');
  };

  if (user) {
    return (
      <div className={isMobile ? "pt-4 border-t border-gray-200 dark:border-gray-700" : "flex items-center space-x-3"}>
        <div className={`flex items-center space-x-2 ${isMobile ? 'mb-3' : ''}`}>
          <User size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onShowLogin}
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700"
    >
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </button>
  );
};

export default UserProfile;
