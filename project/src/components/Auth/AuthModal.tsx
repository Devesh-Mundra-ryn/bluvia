import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../context/NavigationContext';

interface AuthModalProps {
  showModal: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ showModal, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const { login, signup } = useAuth();
  const { setActiveTab } = useNavigation();

  const handleCloseModal = () => {
    onClose();
    setIsSignUp(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
  };

  const handleContinueAsGuest = () => {
    setActiveTab('analysis');
    handleCloseModal();
  };

  const handleCreateAccount = () => {
    setIsSignUp(true);
    setAuthError('');
  };

  const handleBackToSignIn = () => {
    setIsSignUp(false);
    setAuthError('');
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long. Please create a stronger password.';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const getErrorMessage = (error: string): string => {
    // Handle email not confirmed FIRST - this is the most specific case
    if (error.includes('Email not confirmed') || error.includes('email_not_confirmed')) {
      return 'Please check your email and confirm your account before signing in.';
    }
    
    // Handle edge function errors - but check if it's actually an email confirmation issue
    if (error.includes('Edge Function returned a non-2xx status code')) {
      // If we can't determine the specific issue, assume it's email confirmation since that's the most common cause
      return 'Please check your email and confirm your account before signing in.';
    }
    
    // Handle specific authentication errors
    if (error.includes('Invalid login credentials') || error.includes('invalid_credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (error.includes('User already registered') || error.includes('already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    
    if (error.includes('weak_password') || error.includes('Password')) {
      return 'Password is too weak. Please use a stronger password with at least 6 characters.';
    }
    
    if (error.includes('invalid_email') || error.includes('email')) {
      return 'Please enter a valid email address.';
    }
    
    // Handle network errors
    if (error.includes('Network error') || error.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.includes('Failed to fetch') || error.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    // Handle rate limiting
    if (error.includes('rate limit') || error.includes('too many')) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    
    // Handle signup confirmation
    if (error.includes('Signup requires email confirmation')) {
      return 'Please check your email and click the confirmation link to complete your registration.';
    }
    
    // Default fallback for unknown errors
    return error || 'An unexpected error occurred. Please try again.';
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    // Client-side validation
    const emailError = validateEmail(email);
    if (emailError) {
      setAuthError(emailError);
      setAuthLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setAuthError(passwordError);
      setAuthLoading(false);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setAuthError('Passwords do not match. Please make sure both password fields are identical.');
      setAuthLoading(false);
      return;
    }

    try {
      const result = isSignUp 
        ? await signup(email, password)
        : await login(email, password);

      if (result.error) {
        const friendlyError = getErrorMessage(result.error);
        setAuthError(friendlyError);
      } else {
        handleCloseModal();
        setActiveTab('analysis');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('An unexpected error occurred. Please check your internet connection and try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>
      
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10001]">
          <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </h3>
                <div className="mt-4">
                  {authError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {authError}
                    </div>
                  )}
                  <form className="space-y-6" onSubmit={handleAuthSubmit}>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 sm:text-sm px-3"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password {isSignUp && <span className="text-gray-500">(minimum 6 characters)</span>}
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
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
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 sm:text-sm px-3"
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <button 
                        type="submit"
                        disabled={authLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {authLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                      </button>
                      <button 
                        type="button"
                        onClick={handleContinueAsGuest}
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Continue as Guest
                      </button>
                    </div>
                  </form>
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
  );
};

export default AuthModal;
