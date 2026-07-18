/**
 * Basic input sanitization utility to prevent XSS and prompt injection
 */

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // 1. Strip basic HTML tags
  let sanitized = input.replace(/<[^>]*>?/gm, '');
  
  // 2. Remove script injections and javascript protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');
  
  // 3. Optional: Trim leading/trailing whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};
