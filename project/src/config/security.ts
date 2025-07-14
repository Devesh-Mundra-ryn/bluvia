
// Security configuration for production-ready deployment
export const SecurityConfig = {
  // API Configuration
  MAPS_API: {
    // ✅ SECURED: API key is now stored in Supabase Edge Function environment
    // and proxied through our secure endpoint
    PROXY_ENDPOINT: '/functions/v1/maps-proxy',
    RATE_LIMIT: {
      MAX_REQUESTS_PER_MINUTE: 60,
      MAX_REQUESTS_PER_HOUR: 1000
    }
  },

  // Human Detection Settings
  HUMAN_DETECTION: {
    MIN_INTERACTION_TIME: 1500, // milliseconds
    REQUIRED_INTERACTIONS: 1,
    MAX_DETECTION_TIME: 10000, // 10 seconds timeout
    HONEYPOT_ENABLED: true
  },

  // Bot Detection Patterns
  BOT_PATTERNS: [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'telegrambot', 'headlesschrome', 'phantomjs',
    'selenium', 'webdriver', 'automation'
  ],

  // Rate Limiting
  RATE_LIMITS: {
    MAP_LOADS_PER_SESSION: 10,
    API_CALLS_PER_MINUTE: 30
  },

  // Content Security Policy headers (for deployment)
  CSP_HEADERS: {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Removed Google Maps external script
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://maps.gstatic.com https://maps.googleapis.com",
      "connect-src 'self' https://maps.googleapis.com https://*.supabase.co"
    ].join('; ')
  }
};

// Production security checklist
export const SECURITY_CHECKLIST = {
  COMPLETED_FIXES: [
    '✅ Moved Google Maps API key to Supabase Edge Function environment',
    '✅ Created secure proxy endpoint for Maps API calls',
    '✅ Implemented lazy loading with human detection',
    '✅ Added proper CORS and security headers'
  ],
  IMMEDIATE_FIXES: [
    '🔒 Enable Row Level Security (RLS) on csv_data table',
    '🛡️ Update Supabase Edge Functions to verify JWT tokens where needed',
    '📧 Configure proper email templates for auth',
    '🌐 Set up proper CORS policies for production domain',
    '🔐 Implement API rate limiting on Edge Functions',
    '📝 Add audit logging for sensitive operations'
  ],
  BEFORE_PRODUCTION: [
    '🚨 Set up monitoring and alerting',
    '📊 Implement proper error tracking',
    '🔍 Add request logging and analysis',
    '🛡️ Set up Web Application Firewall (WAF)',
    '📱 Configure proper mobile security headers',
    '🔒 Implement Content Security Policy',
    '🌐 Set up proper backup and recovery procedures'
  ]
};

console.log('🔒 Security Configuration Loaded');
console.log('✅ Google Maps API Key Secured via Edge Function Proxy');
console.log('⚠️ REMAINING CHECKLIST:', SECURITY_CHECKLIST);
