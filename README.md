# Alfred Mandarin Learning Platform — Global Leaderboard

Versi GitHub Pages dengan:
- Username siswa + PIN/password
- XP kumulatif
- Level otomatis (1 level / 1000 XP)
- Global Leaderboard Top 100
- Ranking real-time dari Firebase Realtime Database
- Riwayat lokal tetap berjalan offline
- Admin tetap memakai akun `alfred.admin`

## 1. Firebase

Buat project di Firebase Console, lalu:

1. Add Web App.
2. Authentication → Sign-in method → aktifkan **Email/Password**.
3. Realtime Database → Create Database.
4. Salin konfigurasi Web App ke `index.html`, pada bagian:

```js
const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 2. Security Rules

Untuk prototipe kelas, gunakan rules berikut di Realtime Database Rules:

```json
{
  "rules": {
    "players": {
      ".read": true,
      "$uid": {
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.hasChildren(['username','xp','level'])",
        "username": { ".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 30" },
        "xp": { ".validate": "newData.isNumber() && newData.val() >= 0" },
        "level": { ".validate": "newData.isNumber() && newData.val() >= 1" }
      }
    }
  }
}
```

Catatan: `.read: true` membuat Top 100 dapat dibaca publik. Penulisan tetap dibatasi ke akun yang sedang login.

## 3. GitHub Pages

Upload `index.html` ke root repository `Mandarin-web`.

Settings → Pages:
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

URL:
`https://alofred1.github.io/Mandarin-web/`

## 4. Cara kerja XP

Setiap hasil game mengirim skor ke Firebase dan menambah XP:

`XP baru = XP lama + skor game`

Level:

`Level = floor(XP / 1000) + 1`

Leaderboard diurutkan berdasarkan XP terbesar dan menampilkan maksimal 100 siswa.

## Penting

`apiKey` Firebase Web App memang boleh berada di kode browser; keamanan utamanya berasal dari Authentication dan Realtime Database Security Rules. Jangan pernah memasukkan service-account private key ke HTML.
