
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import NavigationMenu from '../Navigation/NavigationMenu';
import ThemeToggle from '../UI/ThemeToggle';
import UserProfile from '../Auth/UserProfile';
import AuthModal from '../Auth/AuthModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/image.png" alt="Bluvia Logo" className="h-8 w-auto mr-3" />
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 tracking-wider">B L U V I A</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Water Analysis Solutions</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <NavigationMenu />
              <ThemeToggle />
              <div className="flex items-center space-x-4">
                <UserProfile onShowLogin={() => setShowLoginModal(true)} />
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle />
              <button
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <NavigationMenu isMobile onNavClick={() => setIsMenuOpen(false)} />
              <UserProfile onShowLogin={() => setShowLoginModal(true)} isMobile />
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        showModal={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default Header;
