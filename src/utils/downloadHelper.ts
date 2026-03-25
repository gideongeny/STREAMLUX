// Enhanced download helper that actually downloads files to user's device
import { DownloadInfo } from '../services/download';

export interface DownloadOptions {
  filename?: string;
  quality?: 'auto' | 'high' | 'medium' | 'low';
}

/**
 * Attempts to download a video file directly to user's device
 * Uses multiple strategies: direct download, blob download, or opens in new tab
 */
export async function downloadVideoFile(
  url: string,
  downloadInfo: DownloadInfo,
  options: DownloadOptions = {}
): Promise<void> {
  const filename = options.filename || 
    `${downloadInfo.title}${downloadInfo.episodeName ? ` - ${downloadInfo.episodeName}` : ''}.mp4`;

  try {
    // Strategy 1: Try direct download using fetch + blob (works for CORS-enabled URLs)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'video/*',
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      return;
    }
  } catch (error) {
    console.warn('Direct blob download failed, trying alternative method:', error);
  }

  // Strategy 2: Use backend proxy for CORS-restricted URLs
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';
    const proxyUrl = `${backendUrl}/proxy?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      return;
    }
  } catch (error) {
    console.warn('Backend proxy download failed:', error);
  }

  // Strategy 3: Fallback - open in new tab (user can manually download)
  window.open(url, '_blank');
  
  // Show notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Download Started', {
      body: `Opening ${filename} in new tab. Use browser's download option.`,
      icon: '/icon.png',
    });
  }
}

/**
 * Extract direct video URL from embed page
 * This is a simplified version - in production, you'd use a backend service
 */
export async function extractVideoUrl(embedUrl: string): Promise<string | null> {
  try {
    // For now, return the embed URL - actual extraction should be done on backend
    // Backend can scrape the embed page and extract the actual video URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';
    const response = await fetch(`${backendUrl}/extract-video?url=${encodeURIComponent(embedUrl)}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.videoUrl || null;
    }
  } catch (error) {
    console.error('Failed to extract video URL:', error);
  }
  
  return null;
}
