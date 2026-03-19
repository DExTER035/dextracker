@echo off
title DexTrack - Supabase Setup
color 0A
echo.
echo  ==============================================
echo   DexTrack Supabase Setup
echo  ==============================================
echo.
echo  Step 1: Logging into Supabase...
echo  A browser tab will open. Sign in with GitHub.
echo  (GitHub user: DExTER035)
echo.
"%LOCALAPPDATA%\supabase-cli\supabase.exe" login
echo.
echo  Step 2: Checking login...
"%LOCALAPPDATA%\supabase-cli\supabase.exe" projects list
echo.
echo  Login complete! Close this window and tell Antigravity "done"
pause
