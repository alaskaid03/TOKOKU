# TokoKu — Local Ops (Auto Start, Backup, Log, Recovery)

## Auto Start (Windows nyala)
- **File:** `C:/Users/ALASKAID/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/TokoKu.bat`
  - Delay 10 detik setelah login, lalu jalankan `C:/Users/ALASKAID/tokoku/start-tokoku.bat`
- **start-tokoku.bat:** `node src/server.js` (0.0.0.0:3001) + `npx vite --host 0.0.0.0 --port 5173` -> log ke `backend/logs/app.log`
- **Test manual:** Double-click `start-tokoku.bat` atau `Startup/TokoKu.bat`

## Backup Harian
- **Script:** `C:/Users/ALASKAID/tokoku/backup-db.bat` -> copy `prisma/dev.db` ke `prisma/backups/dev-YYYYMMDD.db`, log `logs/backup.log`, hapus backup >30 hari
- **Jadwal:** Task Scheduler `TokoKu-Backup` setiap hari 02:00 (Interactive only)
- **Cek:** `schtasks /query /tn TokoKu-Backup` atau `ls backend/prisma/backups/`
- **Manual:** Jalankan `backup-db.bat` atau `cp prisma/dev.db prisma/backups/dev-$(date +%Y%m%d).db`

## Log Aktivitas
- **App log:** `backend/logs/app.log` — backend + frontend stdout (request logger `[ISO] METHOD path` + error)
- **Backup log:** `backend/logs/backup.log`
- **Lihat:** `tail -f backend/logs/app.log` atau `cat backend/logs/app.log | tail`

## Recovery Jika PC Restart/Mati
1. **PC nyala -> login** -> TokoKu auto start 10 detik kemudian (Startup folder)
2. Jika tidak auto: double-click `C:/Users/ALASKAID/tokoku/start-tokoku.bat`
3. Cek: `curl http://localhost:3001/api/health` dan `curl http://localhost:5173/` atau buka `http://192.168.1.12:5173` di HP (1 WiFi)
4. Jika port dipakai: `TASKKILL /F /IM node.exe` lalu jalankan lagi `start-tokoku.bat`
5. Jika DB rusak: `copy prisma/backups/dev-YYYYMMDD.db prisma/dev.db` lalu restart backend
6. Jika gagal total: `cd backend && npx prisma db push && node prisma/seed.js` (reset ke seed)

## Akses Jaringan Lokal
- Frontend: http://192.168.1.12:5173 (HP 1 WiFi)
- Backend:  http://192.168.1.12:3001/api/health
- Cari IP: `ipconfig` -> IPv4 (192.168.x.x); jika pindah WiFi, IP berubah — cek lagi

## Firewall (jika HP tidak konek)
Jalankan sebagai Administrator:
```
netsh advfirewall firewall add rule name="TokoKu" dir=in action=allow protocol=TCP localport=3001,5173
```

## Nonaktifkan Auto Start
Hapus `Startup/TokoKu.bat` dan `schtasks /delete /tn TokoKu-Backup /f`


## V1.2 Operasional
- Foto produk: AdminProducts input file -> FormData /api/products (multer), Products tampil <img src="/uploads/...">, fallback 📦
- Badge: StockBadge (Habis 0 / Stok rendah <5 / Stok N) di Products & AdminProducts
- Laporan: GET /admin/sales?range=daily|weekly, halaman /admin/reports
- Riwayat stok: GET /admin/stock-log?productId&limit, halaman /admin/stock
- Notifikasi: GET /admin/notifications (pendingCount + recent), AdminBell di Navbar polling 30s
