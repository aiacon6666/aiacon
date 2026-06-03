#!/bin/bash

echo "========================================="
echo "AiaCon Project Diagnostic Report"
echo "========================================="
echo ""

# 1. Check if we are in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ CRITICAL: Not in AiaCon project root. No package.json found."
  exit 1
else
  echo "✅ Project root: $(pwd)"
fi

# 2. Check node_modules
if [ -d "node_modules" ]; then
  echo "✅ node_modules exists"
else
  echo "❌ CRITICAL: node_modules missing. Run: npm install"
fi

# 3. Check key packages
echo ""
echo "--- Installed Packages ---"
missing_pkgs=()
for pkg in "@react-navigation/native" "firebase" "expo-linear-gradient" "expo-blur" "react-native-reanimated" "react-native-svg" "expo-auth-session" "@react-native-async-storage/async-storage" "expo-splash-screen" "expo-image-picker" "@react-native-community/datetimepicker"; do
  if grep -q "\"$pkg\"" package.json 2>/dev/null; then
    echo "  ✅ $pkg"
  else
    echo "  ❌ MISSING: $pkg"
    missing_pkgs+=("$pkg")
  fi
done

# 4. Check Firebase config
echo ""
echo "--- Firebase Configuration ---"
if [ -f "firebaseConfig.js" ]; then
  if grep -q "YOUR_API_KEY" firebaseConfig.js || grep -q "YOUR_" firebaseConfig.js; then
    echo "⚠️  firebaseConfig.js exists but contains placeholder values (YOUR_...)"
    echo "   Edit it with real Firebase project config."
  else
    echo "✅ firebaseConfig.js looks valid (no placeholders detected)"
  fi
else
  echo "❌ CRITICAL: firebaseConfig.js missing. Create it with your Firebase config."
fi

# 5. Check Android folder (native splash)
echo ""
echo "--- Android Native Configuration ---"
if [ -d "android" ]; then
  echo "✅ android/ folder exists"
  if [ -f "android/app/src/main/res/drawable/splash_background.xml" ]; then
    echo "✅ Native splash drawable exists"
  else
    echo "⚠️  Native splash drawable missing. Run: npx expo prebuild --platform android"
  fi
else
  echo "❌ android/ folder missing. Run: npx expo prebuild --platform android"
fi

# 6. Check app.json for proper package name
echo ""
echo "--- app.json ---"
if grep -q '"package": "com.aiacon.app"' app.json 2>/dev/null; then
  echo "✅ Package name set to com.aiacon.app"
elif grep -q '"package":' app.json; then
  echo "⚠️  Package name is set but not com.aiacon.app (may still work)"
else
  echo "❌ No android.package found in app.json. Add it."
fi

# 7. Check security rules files
echo ""
echo "--- Security Rules ---"
if [ -f "firestore.rules" ]; then
  echo "✅ firestore.rules exists"
else
  echo "⚠️  firestore.rules missing (will affect deployment)"
fi
if [ -f "storage.rules" ]; then
  echo "✅ storage.rules exists"
else
  echo "⚠️  storage.rules missing"
fi

# 8. Check Cloud Functions
echo ""
echo "--- Cloud Functions ---"
if [ -d "functions" ] && [ -f "functions/package.json" ]; then
  echo "✅ functions/ folder exists"
  if [ -d "functions/node_modules" ]; then
    echo "✅ functions dependencies installed"
  else
    echo "⚠️  functions dependencies not installed. Run: cd functions && npm install"
  fi
else
  echo "⚠️  functions/ folder missing or incomplete"
fi

# 9. Check for placeholder values in critical files
echo ""
echo "--- Placeholder Values Check ---"
found_placeholders=false
for file in src/services/backend.js src/context/AuthContext.js; do
  if [ -f "$file" ]; then
    if grep -q "YOUR_API_KEY\|YOUR_AUTH_DOMAIN\|YOUR_PROJECT_ID\|YOUR_" "$file" 2>/dev/null; then
      echo "⚠️  Placeholders found in $file"
      found_placeholders=true
    fi
  fi
done
if [ "$found_placeholders" = false ]; then
  echo "✅ No obvious placeholder values detected in backend or context files."
fi

# 10. Check if Hermes is enabled
echo ""
echo "--- Hermes (Performance) ---"
if grep -q '"hermesEnabled": true' app.json 2>/dev/null; then
  echo "✅ Hermes enabled"
else
  echo "⚠️  Hermes not enabled. Add \"hermesEnabled\": true to app.json"
fi

# 11. Check splash images
echo ""
echo "--- Splash Assets ---"
if [ -f "assets/splash.png" ]; then
  echo "✅ assets/splash.png exists"
else
  echo "⚠️  assets/splash.png missing (use default or add your own)"
fi

# 12. Final summary
echo ""
echo "========================================="
echo "SUMMARY OF MISSING CRITICAL ACTIONS"
echo "========================================="
if [ ${#missing_pkgs[@]} -gt 0 ]; then
  echo "❌ Missing packages: ${missing_pkgs[*]}"
  echo "   Run: npm install && npx expo install ${missing_pkgs[*]}"
fi
if [ ! -f "firebaseConfig.js" ] || grep -q "YOUR_" firebaseConfig.js 2>/dev/null; then
  echo "❌ Firebase config missing or has placeholders"
fi
if [ ! -d "android" ]; then
  echo "❌ Android native folder missing (needed for splash)"
fi
if [ ! -d "functions/node_modules" ]; then
  echo "⚠️  Cloud Functions not fully set up"
fi

echo ""
echo "To proceed, first fix the critical issues above."
echo "Run: npx expo start --clear after fixing."
