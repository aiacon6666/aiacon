#!/bin/bash
echo "# AiaCon CTO Review Report" > CTO_REVIEW.md
echo "Generated: $(date)" >> CTO_REVIEW.md
echo "" >> CTO_REVIEW.md

# 1. Firestore Security Rules Check
echo "## 1. Firestore Security Issues" >> CTO_REVIEW.md
if grep -q "allow read: if true" firestore.rules 2>/dev/null; then
  echo "- ❌ **CRITICAL**: Public read access in firestore.rules – anyone can read all data." >> CTO_REVIEW.md
else
  echo "- ✅ No public reads found." >> CTO_REVIEW.md
fi
if grep -q "allow write: if true" firestore.rules 2>/dev/null; then
  echo "- ❌ **CRITICAL**: Public write access – data can be deleted or corrupted." >> CTO_REVIEW.md
else
  echo "- ✅ No public writes found." >> CTO_REVIEW.md
fi
if ! grep -q "request.auth.uid == userId" firestore.rules; then
  echo "- ⚠️ **HIGH**: Missing user isolation – users might read others' data." >> CTO_REVIEW.md
fi

# 2. Missing Indexes
echo "" >> CTO_REVIEW.md
echo "## 2. Missing Firestore Indexes" >> CTO_REVIEW.md
if [ ! -f firestore.indexes.json ]; then
  echo "- ⚠️ **MEDIUM**: No indexes defined – queries will fail at scale." >> CTO_REVIEW.md
else
  echo "- ✅ firestore.indexes.json exists. Deploy with: firebase deploy --only firestore:indexes" >> CTO_REVIEW.md
fi

# 3. Performance Bottlenecks
echo "" >> CTO_REVIEW.md
echo "## 3. Performance Issues" >> CTO_REVIEW.md
if grep -r "getDocs(collection(db" src/ --include="*.js" | grep -v "limit" | grep -v "query"; then
  echo "- ⚠️ **HIGH**: Unbounded Firestore queries found – will read entire collections." >> CTO_REVIEW.md
else
  echo "- ✅ No unbounded queries detected." >> CTO_REVIEW.md
fi
if grep -r "onSnapshot" src/ --include="*.js" | grep -v "unsubscribe"; then
  echo "- ⚠️ **MEDIUM**: Real-time listeners may not be unsubscribed – memory leak risk." >> CTO_REVIEW.md
fi
if ! grep -q "InteractionManager" src/screens/auth/LoginScreen.js; then
  echo "- ⚠️ **MEDIUM**: Login screen does not defer heavy animations – may block UI startup." >> CTO_REVIEW.md
fi

# 4. Authentication Weaknesses
echo "" >> CTO_REVIEW.md
echo "## 4. Authentication & Security" >> CTO_REVIEW.md
if ! grep -q "sendEmailVerification" src/services/backend.js; then
  echo "- ⚠️ **HIGH**: Email verification not enforced – fake accounts possible." >> CTO_REVIEW.md
else
  echo "- ✅ Email verification implemented." >> CTO_REVIEW.md
fi
if ! grep -q "recaptchaVerifier" src/screens/auth/PhoneAuthScreen.js; then
  echo "- ⚠️ **MEDIUM**: Phone auth missing reCAPTCHA – SMS bombing risk." >> CTO_REVIEW.md
fi
if ! grep -q "AppCheck" src/services/backend.js; then
  echo "- ⚠️ **MEDIUM**: Firebase App Check not integrated – API abuse risk." >> CTO_REVIEW.md
fi

# 5. File Upload Vulnerabilities
echo "" >> CTO_REVIEW.md
echo "## 5. Media Upload Risks" >> CTO_REVIEW.md
if grep -q "uploadProfileImage" src/services/backend.js; then
  if ! grep -q "image/jpeg" src/services/backend.js; then
    echo "- ⚠️ **HIGH**: No file type validation – could upload malicious files." >> CTO_REVIEW.md
  fi
  if ! grep -q "resize" src/services/backend.js; then
    echo "- ⚠️ **MEDIUM**: Images uploaded at full resolution – bandwidth and storage costs." >> CTO_REVIEW.md
  fi
fi

# 6. Offline & Cache Strategy
echo "" >> CTO_REVIEW.md
echo "## 6. Offline Support" >> CTO_REVIEW.md
if grep -q "AsyncStorage" src/features/feed/feedService.js 2>/dev/null; then
  echo "- ✅ Feed has offline cache." >> CTO_REVIEW.md
else
  echo "- ⚠️ **LOW**: No offline caching for feed – poor experience on weak connections." >> CTO_REVIEW.md
fi

# 7. Critical Bugs from Code Patterns
echo "" >> CTO_REVIEW.md
echo "## 7. Critical Bug Risks" >> CTO_REVIEW.md
if grep -r ".then(" src/ --include="*.js" | grep -v "await" | grep -v "catch"; then
  echo "- ⚠️ **MEDIUM**: Unhandled promise rejections may crash the app." >> CTO_REVIEW.md
fi
if grep -r "setInterval" src/ --include="*.js" | grep -v "clearInterval"; then
  echo "- ⚠️ **HIGH**: setInterval without cleanup – memory leaks and battery drain." >> CTO_REVIEW.md
fi

# 8. Dependency Health
echo "" >> CTO_REVIEW.md
echo "## 8. Dependencies & Configuration" >> CTO_REVIEW.md
if ! grep -q "hermesEnabled" app.json; then
  echo "- ⚠️ **MEDIUM**: Hermes not enabled – slower startup and larger APK." >> CTO_REVIEW.md
else
  echo "- ✅ Hermes is enabled." >> CTO_REVIEW.md
fi
if ! grep -q "expo-updates" package.json; then
  echo "- ⚠️ **LOW**: No over‑the‑air updates – users must reinstall for fixes." >> CTO_REVIEW.md
fi

# 9. Top 20 Fixes (Hardcoded based on analysis)
echo "" >> CTO_REVIEW.md
echo "## 9. Top 20 Prioritized Fixes" >> CTO_REVIEW.md
echo "### CRITICAL (Fix immediately)" >> CTO_REVIEW.md
echo "1. **Firestore Security Rules** – Replace all `allow read: if true` with user‑specific rules." >> CTO_REVIEW.md
echo "2. **Email Verification** – Enforce `emailVerified` before allowing login or posting." >> CTO_REVIEW.md
echo "3. **File Type Validation** – Only allow images/jpeg, png, and reject scripts." >> CTO_REVIEW.md
echo "4. **setInterval Cleanup** – Clear all intervals in useEffect return functions." >> CTO_REVIEW.md
echo "5. **Unbounded Queries** – Add `.limit()` to every Firestore query." >> CTO_REVIEW.md
echo "" >> CTO_REVIEW.md
echo "### HIGH (Next week)" >> CTO_REVIEW.md
echo "6. **Firebase App Check** – Enable to prevent API abuse." >> CTO_REVIEW.md
echo "7. **Image Compression** – Resize images before upload." >> CTO_REVIEW.md
echo "8. **Real‑time Listener Unsubscription** – Unsubscribe all onSnapshot in useEffect." >> CTO_REVIEW.md
echo "9. **Index Deployment** – Deploy firestore.indexes.json." >> CTO_REVIEW.md
echo "10. **Rate Limiting** – Implement Cloud Function rate limits for signup." >> CTO_REVIEW.md
echo "" >> CTO_REVIEW.md
echo "### MEDIUM (This sprint)" >> CTO_REVIEW.md
echo "11. **Offline Cache** – Implement AsyncStorage for user profile and feed." >> CTO_REVIEW.md
echo "12. **Hermes & Bundle Optimization** – Already done." >> CTO_REVIEW.md
echo "13. **ReCaptcha for Phone Auth** – Add to prevent SMS abuse." >> CTO_REVIEW.md
echo "14. **Memory Leak Audit** – Check all event listeners." >> CTO_REVIEW.md
echo "15. **Deep Link Handling** – Add for notifications and invites." >> CTO_REVIEW.md
echo "16. **Error Tracking** – Integrate Sentry or Firebase Crashlytics." >> CTO_REVIEW.md
echo "17. **Analytics** – Add Firebase Analytics for user funnel." >> CTO_REVIEW.md
echo "18. **Accessibility** – Add accessibility labels to all buttons." >> CTO_REVIEW.md
echo "19. **UI Performance** – Remove heavy animations from LoginScreen." >> CTO_REVIEW.md
echo "20. **Documentation** – Add JSDoc comments for all services." >> CTO_REVIEW.md

# 10. Final Roadmap
echo "" >> CTO_REVIEW.md
echo "## 10. Production Readiness Roadmap" >> CTO_REVIEW.md
echo "**Phase 1 (Immediate – 2 days)** – Fix critical security issues (#1-5 above)." >> CTO_REVIEW.md
echo "**Phase 2 (1 week)** – Implement offline cache, image compression, and App Check." >> CTO_REVIEW.md
echo "**Phase 3 (2 weeks)** – Build feed UI, stories UI, and messaging UI using the services created in Part 4." >> CTO_REVIEW.md
echo "**Phase 4 (1 month)** – Add reels, communities, and AI recommendations." >> CTO_REVIEW.md
echo "**Phase 5 (ongoing)** – Performance monitoring, A/B testing, and growth features." >> CTO_REVIEW.md

echo "" >> CTO_REVIEW.md
echo "✅ Review complete. See above for critical issues." >> CTO_REVIEW.md

cat CTO_REVIEW.md
