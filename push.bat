@echo off
cd /d "C:\Users\insan\OneDrive\Desktop\dextracker"
"C:\Program Files\Git\bin\git.exe" add frontend/src/
"C:\Program Files\Git\bin\git.exe" commit -m "fix: remove all cyan and purple from all components"
"C:\Program Files\Git\bin\git.exe" push origin master
echo Done!
