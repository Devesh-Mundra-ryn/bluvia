
interface VerificationSession {
  isVerified: boolean;
  timestamp: number;
  mapsLoaded: boolean;
}

class SessionManager {
  private static instance: SessionManager;
  private readonly SESSION_KEY = 'maps_security_session';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  getSession(): VerificationSession | null {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: VerificationSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() - session.timestamp > this.SESSION_DURATION) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.warn('Failed to retrieve session data:', error);
      this.clearSession();
      return null;
    }
  }

  setVerified(): void {
    const session: VerificationSession = {
      isVerified: true,
      timestamp: Date.now(),
      mapsLoaded: false
    };
    
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      console.log('User verification stored in session');
    } catch (error) {
      console.warn('Failed to store session data:', error);
    }
  }

  setMapsLoaded(): void {
    const session = this.getSession();
    if (session) {
      session.mapsLoaded = true;
      try {
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      } catch (error) {
        console.warn('Failed to update maps loaded status:', error);
      }
    }
  }

  isVerified(): boolean {
    const session = this.getSession();
    return session?.isVerified ?? false;
  }

  isMapsLoaded(): boolean {
    const session = this.getSession();
    return session?.mapsLoaded ?? false;
  }

  clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear session data:', error);
    }
  }
}

export const sessionManager = SessionManager.getInstance();
