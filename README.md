# Alfred Mandarin — Global Leaderboard Classic

## Isi versi ini
- Tema klasik: merah, hitam, abu-abu, putih, pink, kuning/gold.
- HSK 3.0 style levels: HSK 1, 2, 3, 4, 5, 6, dan HSK 7–9.
- Tombol mode game dibuat lebih tahan terhadap masalah tap mobile.
- Filter level lama A1/A2/B1/B2 dimigrasikan menjadi HSK1/HSK2/HSK3/HSK4 sebagai pemetaan awal/legacy, bukan klaim ekuivalensi resmi.
- Firebase Authentication + Realtime Database tetap digunakan untuk Global Leaderboard.

## GitHub Pages
Upload `index.html` ke root repository, lalu aktifkan Settings → Pages → Deploy from branch → main → root.

URL target:
https://alofred1.github.io/Mandarin-web/

## Firebase
1. Firebase Console → buat project.
2. Tambahkan Web App.
3. Authentication → Sign-in method → Email/Password → Enable.
4. Realtime Database → Create database.
5. Salin konfigurasi Web App dari Firebase ke `FIREBASE_CONFIG` di index.html.
6. Atur Realtime Database Rules sesuai file rules yang dipakai pada paket sebelumnya.

Catatan: Realtime Database harus memakai `databaseURL` yang diberikan Firebase; bentuk URL dapat berbeda menurut region.
