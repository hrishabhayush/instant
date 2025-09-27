# 🔧 Chrome Extension Debugging Guide

## 🚨 **Extension Shows Blank Page - Common Fixes**

### ✅ **1. Check Build Output**
Your extension is now properly built with React Router. The build includes:
- ✅ `popup.bundle.js` (176 KB) - Contains React Router and all components
- ✅ `popup.html` - Has proper script tag injection
- ✅ `manifest.json` - Correctly configured for Manifest V3

### ✅ **2. Verify Installation**
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the `dist` folder
4. Pin the extension to your toolbar
5. Click the extension icon

### 🔍 **3. Debug Console Errors**
If the extension is still blank, check for errors:

1. **Right-click the extension icon** → "Inspect popup"
2. **Open DevTools Console** and look for:
   - ❌ `Failed to load resource` errors
   - ❌ `Uncaught ReferenceError` 
   - ❌ `React is not defined`
   - ❌ `Cannot read property of undefined`

### 🛠️ **4. Common Issues & Solutions**

#### **Issue: Script not loading**
```html
<!-- ❌ Missing script tag -->
<body><div id="root"></div></body>

<!-- ✅ Fixed - Webpack injects script -->
<body><div id="root"></div></body>
<script defer src="popup.bundle.js"></script>
```

#### **Issue: Chrome Extension CSP (Content Security Policy)**
If you see CSP errors, the extension might be blocking inline scripts. Our setup avoids this by:
- ✅ All JavaScript in separate `.js` files
- ✅ No inline scripts in HTML
- ✅ Proper webpack bundling

#### **Issue: React Router not working**
Check if you see these console messages:
```
✅ "POPUP SCRIPT STARTING"
✅ "DOM loaded, initializing React app..."
✅ "Root element found, creating React root..."
✅ "React app rendered successfully"
```

### 🧪 **5. Test Navigation**
Once the extension loads, test these features:

1. **Home Page**: Should show product cards
2. **Product Details**: Click "Show More" → Navigate to product page
3. **Settings**: Click settings icon (add icon) → Navigate to settings
4. **Back Navigation**: Use "← Back" buttons to return

### 📁 **6. File Structure Verification**
Ensure your `dist` folder contains:
```
dist/
├── popup.html          ✅ (with script tag)
├── popup.bundle.js     ✅ (176 KB React bundle)
├── manifest.json       ✅ (Manifest V3)
├── icon.png           ✅
└── src/assets/        ✅ (SVG files)
```

### 🚀 **7. Quick Fix Commands**
If you need to rebuild:
```bash
cd /Users/aaronchen/Downloads/primer-2.0/apps/extension
pnpm run build
```

### 🎯 **8. Expected Behavior**
Your extension should now have:
- ✅ **Multi-page navigation** (like MetaMask)
- ✅ **Smooth transitions** (no page reloads)
- ✅ **React Router** for client-side routing
- ✅ **Three pages**: Home, Product Details, Settings
- ✅ **Back navigation** on all sub-pages

### 🆘 **Still Having Issues?**
If the extension is still blank:

1. **Check the console** for specific error messages
2. **Verify the dist folder** is loaded in Chrome Extensions
3. **Try reloading** the extension in `chrome://extensions/`
4. **Check file permissions** - make sure all files are readable

The extension is now properly configured with React Router and should work exactly like MetaMask's multi-page navigation!
