// React Refresh Fix for Production Builds
// This file provides fallback functions for React Refresh when it's not available

if (typeof window !== 'undefined') {
  // Provide fallback functions for React Refresh
  if (typeof window.$RefreshSig$ === 'undefined') {
    window.$RefreshSig$ = function() {
      return function(type) {
        return type;
      };
    };
  }
  
  if (typeof window.$RefreshReg$ === 'undefined') {
    window.$RefreshReg$ = function(type, id) {
      // No-op in production
    };
  }
}
