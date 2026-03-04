/**
 * SafeHTML Utility
 * 
 * Cleans content strings from 3rd party APIs (RapidAPI, WatchMode, etc) 
 * to prevent XSS and malicious script injection.
 */

export const sanitizeString = (str: string | null | undefined): string => {
    if (!str) return '';

    // Basic HTML tag removal but preserve common content structure if needed
    // In our case, we mostly want to strip all tags to be safe as we use custom UI
    return str
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Strip scripts
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")  // Strip styles
        .replace(/on\w+="[^"]*"/g, "")                        // Strip event handlers
        .replace(/javascript:[^"]*/g, "")                    // Strip javascript protocols
        .replace(/<[^>]*>?/gm, "")                           // Strip all other tags
        .trim();
};

/**
 * Ensures text is safe to be put directly into elements
 */
export const makeSafeText = (text: any): string => {
    if (typeof text !== 'string') return String(text || '');
    return sanitizeString(text);
};
