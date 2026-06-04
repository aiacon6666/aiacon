#!/bin/bash

echo "// Central API keys configuration" > src/config/keys.js
echo "// Do not commit this file to version control" >> src/config/keys.js
echo "" >> src/config/keys.js

# Extract from src/services/backend.js (Firebase config)
if [ -f src/services/backend.js ]; then
  grep -E "(apiKey|authDomain|projectId|storageBucket|messagingSenderId|appId):" src/services/backend.js | sed 's/^/export const /; s/:/ = /; s/,//' >> src/config/keys.js
  echo "" >> src/config/keys.js
fi

# Extract from src/services/storage.js (Cloudinary, Supabase, etc.)
if [ -f src/services/storage.js ]; then
  grep -E "(cloudinary|supabase|pinata|storj|imgbb|mongodb|neon|telegram):" src/services/storage.js >> src/config/keys.js
  echo "" >> src/config/keys.js
fi

# Extract from src/services/music.js (YouTube, Jamendo, etc.)
if [ -f src/services/music.js ]; then
  grep -E "(youtubeApiKey|jamendoClientId|audius):" src/services/music.js >> src/config/keys.js
  echo "" >> src/config/keys.js
fi

echo "✅ Extracted keys to src/config/keys.js"
echo "⚠️  Please review the file and make sure all keys are correct."
