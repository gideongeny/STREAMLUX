// Google Services Optimization
// Prevents quota exceeded errors by optimizing Google API usage

// Rate limiting for Google API calls
class GoogleRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly MAX_REQUESTS_PER_MINUTE = 10;
  private readonly WINDOW_MS = 60000; // 1 minute

  canMakeRequest(service: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(service) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(timestamp => now - timestamp < this.WINDOW_MS);
    
    if (recentRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(service, recentRequests);
    return true;
  }

  getWaitTime(service: string): number {
    const requests = this.requests.get(service) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const waitTime = this.WINDOW_MS - (Date.now() - oldestRequest);
    return Math.max(0, waitTime);
  }
}

export const googleRateLimiter = new GoogleRateLimiter();

// Handle Google quota exceeded errors gracefully
export const handleGoogleQuotaError = (error: any, fallback: () => void) => {
  if (
    error?.message?.includes('quota') ||
    error?.message?.includes('Quota Exceeded') ||
    error?.code === 429 ||
    error?.response?.status === 429
  ) {
    console.warn('Google API quota exceeded. Using fallback.');
    fallback();
    return true;
  }
  return false;
};

// Optimize Google Fonts loading
export const optimizeGoogleFonts = () => {
  if (typeof window === 'undefined') return;
  
  // Check if fonts are already loaded
  const fontsLoaded = sessionStorage.getItem('google_fonts_loaded');
  if (fontsLoaded === 'true') {
    return;
  }
  
  // Mark fonts as loaded after a delay
  setTimeout(() => {
    sessionStorage.setItem('google_fonts_loaded', 'true');
  }, 1000);
};

// Initialize optimizations
if (typeof window !== 'undefined') {
  optimizeGoogleFonts();
}

