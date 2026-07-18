// Utility for resolving image URLs

/**
 * Robust image URL resolver that handles:
 * 1. TMDB relative paths (e.g., /abc.jpg)
 * 2. YouTube full URLs (e.g., https://.../vi/...)
 * 3. External provider URLs (e.g., https://images.unsplash.com/...)
 * 4. Fallback for missing paths
 */
export const getSafeImageUrl = (path?: string, size: "w342" | "w500" | "original" = "w342"): string => {
  if (!path) return "/defaultPoster.jpg";
  
  // If it's already a full URL, return it as is
  if (path.startsWith("http")) {
    return path;
  }
  
  // Otherwise, it's a TMDB relative path
  const base = size === "original" ? "https://image.tmdb.org/t/p/original" : `https://image.tmdb.org/t/p/${size}`;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
