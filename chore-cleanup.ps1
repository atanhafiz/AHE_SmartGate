# ===============================================
# AHE SMARTGATE CLEANUP SCRIPT (FINAL STABLE v2)
# PowerShell Version (No Emoji - Windows Safe)
# ===============================================

Write-Host "Starting SmartGate cleanup..." -ForegroundColor Cyan

# --- Create organized folders ---
$folders = @(
  "src/components/Admin",
  "src/components/Guard",
  "src/components/Shared",
  "src/hooks",
  "src/lib",
  "src/pages",
  "src/utils",
  "src/styles",
  "public/images",
  "supabase/functions/notify-telegram"
)
foreach ($f in $folders) {
  if (!(Test-Path $f)) { New-Item -ItemType Directory -Path $f | Out-Null }
}

# --- Move core files safely ---
$moveMap = @{
  "src\App.jsx" = "src\"
  "src\main.jsx" = "src\"
  "src\index.css" = "src\styles\"
  "supabase-schema.sql" = "supabase\schema.sql"
  "supabase-trigger.sql" = "supabase\trigger.sql"
  "supabase-seed-data.sql" = "supabase\seed.sql"
  "supabase-profiles-schema.sql" = "supabase\profiles-schema.sql"
}

foreach ($pair in $moveMap.GetEnumerator()) {
  if (Test-Path $pair.Key) {
    Move-Item -Path $pair.Key -Destination $pair.Value -Force
  }
}

# --- Move batch of matching files safely ---
$patterns = @(
  "src\components\*.jsx",
  "src\hooks\*.js",
  "src\lib\supabaseClient.js",
  "src\pages\*.jsx",
  "src\utils\*.js"
)
foreach ($pattern in $patterns) {
  Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | ForEach-Object {
    Move-Item $_.FullName -Destination (Split-Path $pattern) -Force -ErrorAction SilentlyContinue
  }
}

# --- Clean up junk Markdown and auto files ---
Write-Host "Removing auto-generated logs and junk..." -ForegroundColor Yellow
$junkPatterns = @(
  "*_SUMMARY.md", "*_FIX.md", "*_REPORT.md", "*_GUIDE.md", "*_COMPLETE.md",
  "AUTO_*", "SMARTGATE_*", "SUPABASE_*", "TELEGRAM_*", "UPLOAD_*",
  "STABLE_*", "PIPELINE_*", "SESSION_*", "ROUTING_*", "FINAL_*",
  "CORS_*", "ENHANCED_*", "DYNAMIC_*", "ENTRYFORM_*", "PERFECT_*", "SYSTEM_*"
)
foreach ($pattern in $junkPatterns) {
  Get-ChildItem -Path . -Recurse -Include $pattern -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}

# --- Delete test and deployment scripts ---
Write-Host "Removing test & deployment leftovers..." -ForegroundColor DarkYellow
$deletePatterns = @(
  "test*.js", "system-test.js", "verify-build.js",
  "fix-netlify-404.js", "deploy-to-netlify.js",
  "setup-env.js", "NETLIFY_DEPLOYMENT.md", "DEPLOYMENT.md",
  "env.config.js", "env.example"
)
foreach ($pattern in $deletePatterns) {
  Get-ChildItem -Path . -Recurse -Include $pattern -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}

if (Test-Path "supabase\.temp") { Remove-Item -Recurse -Force "supabase\.temp" }

# --- Show new folder structure (3 levels deep) ---
Write-Host ""
Write-Host "[INFO] Final folder structure (Top 3 levels):" -ForegroundColor Green
Get-ChildItem -Depth 3 | ForEach-Object { $_.FullName }

# --- Git Commit ---
Write-Host ""
Write-Host "[INFO] Committing cleanup changes..." -ForegroundColor Cyan
git add .
git commit -m "chore: cleanup and stabilize SmartGate structure"
git push

Write-Host ""
Write-Host "DONE: Cleanup complete! SmartGate structure is now clean and stable." -ForegroundColor Green
