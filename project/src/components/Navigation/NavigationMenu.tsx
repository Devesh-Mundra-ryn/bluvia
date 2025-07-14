
import React from 'react';
import { useNavigation } from '../../context/NavigationContext';

interface NavigationMenuProps {
  isMobile?: boolean;
  onNavClick?: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isMobile = false, onNavClick }) => {
  const { activeTab, setActiveTab } = useNavigation();

  const handleNavClick = (tab: 'analysis' | 'upload' | 'info' | 'contact') => {
    setActiveTab(tab);
    if (onNavClick) onNavClick();
  };

  const baseNavClass = isMobile 
    ? "mobile-nav-link text-left dark:text-gray-300 dark:hover:text-primary-400"
    : "nav-link dark:text-gray-300 dark:hover:text-primary-400";

  const activeClass = isMobile
    ? "text-primary-500 dark:text-primary-400 bg-gray-50 dark:bg-gray-800"
    : "text-primary-500 dark:text-primary-400";

  return (
    <nav className={isMobile ? "flex flex-col space-y-4" : "hidden md:flex items-center space-x-6"}>
      <button 
        onClick={() => handleNavClick('analysis')}
        className={`${baseNavClass} ${activeTab === 'analysis' ? activeClass : ''}`}
      >
        Analysis
      </button>
      <button 
        onClick={() => handleNavClick('upload')}
        className={`${baseNavClass} ${activeTab === 'upload' ? activeClass : ''}`}
      >
        Upload
      </button>
      <button 
        onClick={() => handleNavClick('info')}
        className={`${baseNavClass} ${activeTab === 'info' ? activeClass : ''}`}
      >
        Info
      </button>
      <button 
        onClick={() => handleNavClick('contact')}
        className={`${baseNavClass} ${activeTab === 'contact' ? activeClass : ''}`}
      >
        Contact Us
      </button>
    </nav>
  );
};

export default NavigationMenu;
