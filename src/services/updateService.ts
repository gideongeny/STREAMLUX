import { Capacitor } from '@capacitor/core';
import packageJson from '../../package.json';

const CURRENT_VERSION = packageJson.version || "1.2.0";

export interface ReleaseData {
  tag_name: string;
  body: string;
  assets: { browser_download_url: string }[];
}

export const checkForUpdates = async (): Promise<ReleaseData | null> => {
  try {
    const res = await fetch('https://api.github.com/repos/gideongeny/STREAMLUX/releases/latest');
    if (!res.ok) return null;
    
    const data: ReleaseData = await res.json();
    const latestVersion = data.tag_name.replace(/[vV]/g, '');
    
    // Semantic version comparison
    if (latestVersion.localeCompare(CURRENT_VERSION, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return null;
  }
};

export const triggerManualUpdateCheck = () => {
  window.dispatchEvent(new CustomEvent('streamlux-check-update-manual'));
};

export const isNative = () => Capacitor.isNativePlatform();
