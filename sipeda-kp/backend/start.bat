@echo off
echo [INFO] Sedang mencari proses yang menggunakan port 5000...

:: Cari PID yang menggunakan port 5000 dan kill
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    if "%%a" NEQ "0" (
        echo [INFO] Ditemukan proses (PID: %%a) di port 5000. Mematikan...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo [INFO] Port 5000 seharusnya sudah bersih.
echo [INFO] Memulai server...
echo.

npm run dev
pause
