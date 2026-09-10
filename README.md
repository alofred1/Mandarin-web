# Alfred Mandarin V4 — Modular GitHub Pages

Pages are split so a dashboard or game error does not block unrelated UI.

- `index.html` — login/register
- `student.html` — student dashboard
- `teacher.html` — teacher panel
- `games.html` — game room
- `leaderboard.html` — online Top 100
- `js/vocabulary.js` — vocabulary bank
- `js/firebase-config.js` — Firebase Web App config
- `js/core.js` — auth/database core
- `js/games.js` — game engine
- `css/style.css` — theme

Firebase Realtime Database rules currently expected by the app:

```json
{
  "rules": {
    "players": {
      ".read": true,
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

Before production, tighten leaderboard read/write rules and make teacher authorization server-side/custom-claims based.
