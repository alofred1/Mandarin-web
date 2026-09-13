# Alfred Mandarin Modular V5

Perbaikan utama V5: Firebase Auth session ditunggu melalui `onAuthStateChanged` sebelum redirect/profile dibaca, sehingga tidak terjadi loop kembali ke login setelah daftar.

Struktur: index.html, student.html, games.html, leaderboard.html, teacher.html, css/style.css, js/*.js.

Firebase config berada di `js/firebase-config.js`. Jangan ubah Rules yang sudah berhasil kecuali diperlukan.
