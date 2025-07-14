
interface HumanDetectionOptions {
  minInteractionTime?: number;
  requiredInteractions?: number;
}

// Extend Window interface to include chrome property
declare global {
  interface Window {
    chrome?: {
      runtime?: unknown;
    };
  }
}

class HumanDetector {
  private interactionCount = 0;
  private startTime = Date.now();
  private hasScrolled = false;
  private hasMouseMoved = false;
  private hasKeyPressed = false;
  private isListening = false;
  private listeners: (() => void)[] = [];

  constructor(private options: HumanDetectionOptions = {}) {
    this.options = {
      minInteractionTime: 2000, // 2 seconds minimum
      requiredInteractions: 2, // At least 2 different types of interactions
      ...options
    };
  }

  start(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check for bot indicators first
      if (this.isSuspiciousBot()) {
        resolve(false);
        return;
      }

      if (this.isListening) {
        resolve(this.isHuman());
        return;
      }

      this.isListening = true;
      
      const checkHuman = () => {
        if (this.isHuman()) {
          this.cleanup();
          resolve(true);
        }
      };

      // Mouse movement detection
      const handleMouseMove = () => {
        if (!this.hasMouseMoved) {
          this.hasMouseMoved = true;
          this.interactionCount++;
          checkHuman();
        }
      };

      // Scroll detection
      const handleScroll = () => {
        if (!this.hasScrolled) {
          this.hasScrolled = true;
          this.interactionCount++;
          checkHuman();
        }
      };

      // Keyboard detection
      const handleKeyPress = () => {
        if (!this.hasKeyPressed) {
          this.hasKeyPressed = true;
          this.interactionCount++;
          checkHuman();
        }
      };

      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('keydown', handleKeyPress, { passive: true });

      // Store cleanup functions
      this.listeners = [
        () => document.removeEventListener('mousemove', handleMouseMove),
        () => document.removeEventListener('scroll', handleScroll),
        () => document.removeEventListener('keydown', handleKeyPress)
      ];

      // Fallback timeout - if no interaction after 10 seconds, assume bot
      setTimeout(() => {
        if (this.isListening) {
          this.cleanup();
          resolve(false);
        }
      }, 10000);
    });
  }

  private isSuspiciousBot(): boolean {
    // Check user agent for known bots
    const userAgent = navigator.userAgent.toLowerCase();
    const botPatterns = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
      'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
      'whatsapp', 'telegrambot', 'headlesschrome', 'phantomjs'
    ];

    if (botPatterns.some(pattern => userAgent.includes(pattern))) {
      console.log('Bot detected via user agent');
      return true;
    }

    // Check for headless browser indicators with proper typing
    if (!window.chrome || typeof window.chrome.runtime === 'undefined') {
      // Additional headless checks
      if ((navigator as any).webdriver === true) {
        console.log('Headless browser detected');
        return true;
      }
    }

    return false;
  }

  private isHuman(): boolean {
    const timeElapsed = Date.now() - this.startTime;
    const hasMinTime = timeElapsed >= (this.options.minInteractionTime || 2000);
    const hasEnoughInteractions = this.interactionCount >= (this.options.requiredInteractions || 2);
    
    return hasMinTime && hasEnoughInteractions;
  }

  private cleanup(): void {
    this.isListening = false;
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}

export const detectHuman = (options?: HumanDetectionOptions): Promise<boolean> => {
  const detector = new HumanDetector(options);
  return detector.start();
};
