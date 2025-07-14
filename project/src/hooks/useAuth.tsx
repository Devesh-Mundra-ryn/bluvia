
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('supabase-session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('supabase-session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      console.log('Attempting login with Supabase function...');
      
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: { email, password }
      });

      if (error) {
        console.error('Login error:', error);
        return { error: error.message || 'Login failed' };
      }

      // Check if the response contains an error (from the edge function)
      if (data && data.error) {
        console.error('Login error from edge function:', data.error);
        return { error: data.error };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        localStorage.setItem('supabase-session', JSON.stringify(data.session));
        console.log('Login successful');
      }

      return {};
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      console.log('Attempting signup with Supabase function...');
      
      const { data, error } = await supabase.functions.invoke('auth-signup', {
        body: { email, password }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error: error.message || 'Signup failed' };
      }

      // Check if the response contains an error (from the edge function)
      if (data && data.error) {
        console.error('Signup error from edge function:', data.error);
        return { error: data.error };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        localStorage.setItem('supabase-session', JSON.stringify(data.session));
        console.log('Signup successful');
      }

      return {};
    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('supabase-session');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
