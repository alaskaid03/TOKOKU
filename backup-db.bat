@echo off
set DATESTR=%date:~10,4%%date:~4,2%%date:~7,2%
if "%DATESTR%"=="" set DATESTR=%date:~-4%%date:~-7,2%%date:~-10,2%
set SRC=C:\Users\ALASKAID\tokoku\backend\prisma\dev.db
set DST=C:\Users\ALASKAID\tokoku\backend\prisma\backups\dev-%DATESTR%.db
mkdir "C:\Users\ALASKAID\tokoku\backend\prisma\backups" 2>nul
copy /Y "%SRC%" "%DST%" >nul
echo [%date% %time%] Backup -> %DST% >> C:\Users\ALASKAID\tokoku\backend\logs\backup.log
:: hapus backup >30 hari
forfiles /p "C:\Users\ALASKAID\tokoku\backend\prisma\backups" /m *.db /d -30 /c "cmd /c del @path" 2>nul
