@echo off
:: 1. copy to app.js
copy update-ytdlp-po-token_v3.js app.js

:: 2. complier app.rc
rc /nologo /fo app.res app.rc

:: 3. complier loader
cl /nologo /c loader.cpp

:: 4. link to exe
link /nologo /OUT:ytdlp-token-updater.exe loader.obj app.res qjs.lib

:: clean
del app.res loader.obj app.js
echo Build completed!
pause