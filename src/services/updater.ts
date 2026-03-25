import axios from "axios";

export interface ReleaseInfo {
    version: string;
    downloadUrl: string;
    releaseNotes: string;
    publishedAt: string;
}

const GITHUB_REPO = "gideongeny/STREAMLUX";

export const updaterService = {
    getLatestRelease: async (): Promise<ReleaseInfo | null> => {
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
            );

            const release = response.data;
            // Find the APK asset
            const apkAsset = release.assets.find((asset: any) =>
                asset.name.endsWith(".apk")
            );

            if (apkAsset) {
                return {
                    version: release.tag_name,
                    downloadUrl: apkAsset.browser_download_url,
                    releaseNotes: release.body,
                    publishedAt: release.published_at,
                };
            }
            return null;
        } catch (error) {
            console.warn("Failed to fetch latest release:", error);
            return null;
        }
    },
};
