#!/bin/bash

OUTPUT="src/config/keys.js"

# Start with header
cat > $OUTPUT << 'HEADER'
// ========================================
// AiaCon Central API Keys Configuration
// ========================================
// This file is auto-generated from your existing service files.
// Do not commit this file to version control.

HEADER

# Extract Firebase config from backend.js
if [ -f src/services/backend.js ]; then
  echo "// Firebase (from backend.js)" >> $OUTPUT
  # Extract const firebaseConfig = { ... } block and convert to exports
  sed -n '/const firebaseConfig = {/,/};/p' src/services/backend.js | \
    sed 's/const firebaseConfig = {//; s/};//; s/^[[:space:]]*//; s/:/ =/; s/,$//; /^$/d; s/^/export const firebase/' | \
    sed 's/ = / = "/; s/$/";/' | \
    sed 's/export const firebaseapiKey/export const firebaseApiKey/; s/export const firebaseauthDomain/export const firebaseAuthDomain/; s/export const firebaseprojectId/export const firebaseProjectId/; s/export const firebasestorageBucket/export const firebaseStorageBucket/; s/export const firebasemessagingSenderId/export const firebaseMessagingSenderId/; s/export const firebaseappId/export const firebaseAppId/' >> $OUTPUT
  echo "" >> $OUTPUT
fi

# Extract from storage.js (common variable names)
if [ -f src/services/storage.js ]; then
  echo "// Cloud & Storage Services (from storage.js)" >> $OUTPUT
  # Look for variable assignments like const cloudinaryApiKey = "value";
  grep -E '(cloudinaryApiKey|supabaseUrl|supabaseAnonKey|pinataApiKey|pinataSecretApiKey|storjApiKey|imgbbApiKey|mongodbUri|neonConnectionString|telegramBotToken) =' src/services/storage.js | \
    sed 's/^const //; s/ = / = "/; s/;$/";/; s/^/export const /' >> $OUTPUT
  echo "" >> $OUTPUT
fi

# Extract from music.js
if [ -f src/services/music.js ]; then
  echo "// Music Services (from music.js)" >> $OUTPUT
  grep -E '(youtubeApiKey|jamendoClientId) =' src/services/music.js | \
    sed 's/^const //; s/ = / = "/; s/;$/";/; s/^/export const /' >> $OUTPUT
  echo "" >> $OUTPUT
fi

echo "✅ Keys extracted to $OUTPUT"
echo "⚠️  Please open the file and verify all values are correct."
