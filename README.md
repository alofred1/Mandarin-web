# Alfred Mandarin V6

## Struktur
- `index.html` login/daftar
- `student.html` dashboard siswa: dua tombol utama Latihan & Tugas Guru + Community
- `assignments.html` tugas siswa
- `games.html` game
- `leaderboard.html` Top 100; guru/admin ditandai dan tidak eligible hadiah
- `chat.html` global/admin/guru/private/notifikasi + voice note + live voice room
- `teacher.html` membuat, memeriksa, dan menilai tugas
- `admin.html` mengurus web dan membuat akun guru
- `js/vocabulary.js` bank kosakata terpisah

## Admin bootstrap
1. Login sebagai `alfredAdmin`.
2. Lihat UID pada Admin Console.
3. Firebase Realtime Database -> Data: buat `admins/<UID> = true`.
4. Setelah itu panel Admin dapat membuat akun guru.

## Rules
Import isi `firebase-database-rules.json` ke Realtime Database Rules. Import `firebase-storage-rules.txt` ke Storage Rules untuk voice note.

## Catatan keamanan
Frontend Firebase config bukan mekanisme otorisasi. Rules harus tetap dipasang. Untuk produksi yang lebih kuat, pindahkan role ke Firebase Auth custom claims dan buat backend/Cloud Functions untuk pemberian hadiah, grading sensitif, dan provisioning akun.

## Voice
- Voice note memakai MediaRecorder + Firebase Storage.
- Live voice memakai WebRTC + RTDB signaling dan cocok untuk kelas kecil. Untuk kelas besar gunakan SFU seperti LiveKit/Cloudflare/mediasoup.


SECURITY NOTE
The public login page does not advertise the admin account or provide an Admin autofill button. Admin uses the same normal login form. Do not publish admin credentials in HTML/JavaScript. Authorization must be enforced by Firebase rules and the admin UID/role data.
