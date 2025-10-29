#!/bin/bash
# ===============================================
# 🧹 AHE SMARTGATE CLEANUP SCRIPT (FINAL STABLE v2)
# ===============================================
# Objective: Cleanup old Cursor-generated junk, reorganize structure, and keep valid source code only.

echo "🚀 Starting SmartGate cleanup..."

# --- Create organized folders ---
mkdir -p src/components/Admin
mkdir -p src/components/Guard
mkdir -p src/components/Shared
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/pages
mkdir -p src/utils
mkdir -p src/styles
mkdir -p public/images
mkdir -p supabase/functions/notify-telegram

# --- Move core app files ---
mv src/App.jsx src/main.jsx src/index.css src/styles/ 2>/dev/null || true
mv src/components/*.jsx src/components/Shared/ 2>/dev/null || true
mv src/hooks/*.js src/hooks/ 2>/dev/null || true
mv src/lib/supabaseClient.js src/lib/ 2>/dev/null || true
mv src/pages/*.jsx src/pages/ 2>/dev/null || true
mv src/utils/*.js src/utils/ 2>/dev/null || true

# --- Move Supabase SQL structure ---
mv supabase-schema.sql supabase/schema.sql 2>/dev/null || true
mv supabase-trigger.sql supabase/trigger.sql 2>/dev/null || true
mv supabase-seed-data.sql supabase/seed.sql 2>/dev/null || true
mv supabase-profiles-schema.sql supabase/profiles-schema.sql 2>/dev/null || true

# --- Move Edge Function ---
mv supabase/functions/notify-telegram/* supabase/functions/notify-telegram/ 2>/dev/null || true

# --- Delete Cursor junk and auto-generated summary files ---
echo "🧽 Removing auto-generated logs and junk..."
find . -type f -name "*_SUMMARY.md" -delete
find . -type f -name "*_FIX.md" -delete
find . -type f -name "*_REPORT.md" -delete
find . -type f -name "*_GUIDE.md" -delete
find . -type f -name "*_COMPLETE.md" -delete
find . -type f -name "AUTO_*" -delete
find . -type f -name "SMARTGATE_*" -delete
find . -type f -name "SUPABASE_*" -delete
find . -type f -name "TELEGRAM_*" -delete
find . -type f -name "UPLOAD_*" -delete
find . -type f -name "STABLE_*" -delete
find . -type f -name "PIPELINE_*" -delete
find . -type f -name "SESSION_*" -delete
find . -type f -name "ROUTING_*" -delete
find . -type f -name "FINAL_*" -delete
find . -type f -name "CORS_*" -delete
find . -type f -name "ENHANCED_*" -delete
find . -type f -name "DYNAMIC_*" -delete
find . -type f -name "ENTRYFORM_*" -delete
find . -type f -name "PERFECT_*" -delete
find . -type f -name "SYSTEM_*" -delete

# --- Delete test and old deployment scripts ---
echo "🗑️  Removing test & deployment leftovers..."
rm -f test*.js system-test.js verify-build.js fix-netlify-404.js deploy-to-netlify.js
rm -f setup-env.js NETLIFY_DEPLOYMENT.md DEPLOYMENT.md env.config.js env.example
rm -rf supabase/.temp 2>/dev/null || true

# --- Show cleaned structure (3 levels deep) ---
echo "📂 Final folder structure:"
tree -L 3 -I "node_modules|dist|.temp" || ls -R | head -n 100

# --- Git Commit ---
echo "✅ Committing cleanup changes..."
git add .
git commit -m "chore: cleanup and stabilize SmartGate structure"
git push

echo "🎉 Cleanup complete! SmartGate structure is now clean and stable."
