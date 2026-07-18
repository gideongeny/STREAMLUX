// Polyfills for older browsers (iPhone 6+, Android 5+)

// Export empty object to make this a module
export {};

// String.padStart polyfill for older browsers (iOS < 11, Android < 7)
if (!String.prototype.padStart) {
  String.prototype.padStart = function(maxLength: number, fillString?: string): string {
    const str = String(this);
    if (str.length >= maxLength) {
      return str;
    }
    const fill = fillString || ' ';
    const fillLength = maxLength - str.length;
    let fillStr = '';
    while (fillStr.length < fillLength) {
      fillStr += fill;
    }
    return fillStr.slice(0, fillLength) + str;
  };
}

