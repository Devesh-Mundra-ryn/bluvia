import React, { useState } from 'react';
import { Menu, X, Sun, Moon, LogIn } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { activeTab, setActiveTab } = useNavigation();
  const { isDark, toggleTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (tab: 'analysis' | 'upload' | 'info' | 'contact') => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setIsSignUp(false);
  };

  const handleContinueAsGuest = () => {
    setActiveTab('analysis');
    handleCloseModal();
  };

  const handleCreateAccount = () => {
    setIsSignUp(true);
  };

  const handleBackToSignIn = () => {
    setIsSignUp(false);
  };

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
            
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => handleNavClick('analysis')}
                className={`nav-link dark:text-gray-300 dark:hover:text-primary-400 ${activeTab === 'analysis' ? 'text-primary-500 dark:text-primary-400' : ''}`}
              >
                Analysis
              </button>
              <button 
                onClick={() => handleNavClick('upload')}
                className={`nav-link dark:text-gray-300 dark:hover:text-primary-400 ${activeTab === 'upload' ? 'text-primary-500 dark:text-primary-400' : ''}`}
              >
                Upload
              </button>
              <button 
                onClick={() => handleNavClick('info')}
                className={`nav-link dark:text-gray-300 dark:hover:text-primary-400 ${activeTab === 'info' ? 'text-primary-500 dark:text-primary-400' : ''}`}
              >
                Info
              </button>
              <button 
                onClick={() => handleNavClick('contact')}
                className={`nav-link dark:text-gray-300 dark:hover:text-primary-400 ${activeTab === 'contact' ? 'text-primary-500 dark:text-primary-400' : ''}`}
              >
                Contact Us
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} className="text-primary-400" /> : <Moon size={20} className="text-primary-600" />}
              </button>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </button>
              </div>
            </nav>

            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} className="text-primary-400" /> : <Moon size={20} className="text-primary-600" />}
              </button>
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
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => handleNavClick('analysis')}
                  className={`mobile-nav-link text-left dark:text-gray-300 dark:hover:text-primary-400 ${activeTab === 'analysis' ? 'text-primary-500 dark:text-primary-400 bg-gray-50 dark:bg-gray-800' : ''}`}
                >
                  Analysis
                </button>
                <button 
                  onClick={() => handleNavClick('upload')}
                  className={`mobile-nav-link text-left dark:text-gray-300 dark:hover:text-primary-400 ${activeTab === 'upload' ? 'text-primary-500 dark:text-primary-400 bg-gray-50 dark:bg-gray-800' : ''}`}
                >
                  Upload
                </button>
                <button 
                  onClick={() => handleNavClick('info')}
                  className={`mobile-nav-link text-left dark:text-gray-300 dark:hover:text-primary-400 ${activeTab === 'info' ? 'text-primary-500 dark:text-primary-400 bg-gray-50 dark:bg-gray-800' : ''}`}
                >
                  Info
                </button>
                <button 
                  onClick={() => handleNavClick('contact')}
                  className={`mobile-nav-link text-left dark:text-gray-300 dark:hover:text-primary-400 ${activeTab === 'contact' ? 'text-primary-500 dark:text-primary-400 bg-gray-50 dark:bg-gray-800' : ''}`}
                >
                  Contact Us
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Full Screen Modal Overlay - Positioned outside header to cover everything */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Backdrop that covers everything including search bar */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>
          
          {/* Modal positioning */}
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal content */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10001]">
              <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </h3>
                    <div className="mt-4">
                      <form className="space-y-6">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 sm:text-sm px-3"
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 sm:text-sm px-3"
                          />
                        </div>
                        {isSignUp && (
                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              id="confirmPassword"
                              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 sm:text-sm px-3"
                            />
                          </div>
                        )}
                      </form>
                      <div className="mt-6 space-y-4">
                        <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          {isSignUp ? 'Create Account' : 'Sign In'}
                        </button>
                        <button 
                          type="button"
                          onClick={handleContinueAsGuest}
                          className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Continue as Guest
                        </button>
                      </div>
                      <div className="mt-4 text-center">
                        {isSignUp ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <button 
                              type="button"
                              onClick={handleBackToSignIn}
                              className="font-medium text-primary-600 hover:text-primary-500"
                            >
                              Back to Sign In
                            </button>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <button 
                              type="button"
                              onClick={handleCreateAccount}
                              className="font-medium text-primary-600 hover:text-primary-500"
                            >
                              Create Account
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-900 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;