# 🔐 Password Strength Analyzer

A full-stack web app that evaluates password strength in real time.

Built with **Node.js + Express** (backend) and vanilla **HTML/CSS/JS** (frontend).

---

## Features

- ✅ Real-time password strength scoring (0–100)
- ✅ 8 security checks (length, complexity, uniqueness, common passwords, etc.)
- ✅ Actionable suggestions to improve your password
- ✅ 3 stronger alternative password suggestions
- ✅ Copy-to-clipboard for alternatives
- ✅ Show/hide password toggle
- ✅ REST API endpoint (`POST /api/analyze`)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/password-analyzer.git
cd password-analyzer

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Then open your browser at **http://localhost:3000**

For development with auto-reload:
```bash
npm run dev
```

---

## API Reference

### `POST /api/analyze`

Analyzes a password and returns a strength report.

**Request body:**
```json
{ "password": "MyP@ssw0rd!" }
```

**Response:**
```json
{
  "score": 80,
  "label": "Strong",
  "color": "#97C459",
  "checks": {
    "len8": true,
    "len12": false,
    "uppercase": true,
    "lowercase": true,
    "number": true,
    "special": true,
    "noRepeats": true,
    "notCommon": true
  },
  "suggestions": [],
  "alternatives": ["Myp4!xdrKa2", "Myp7#wvzRa9", "Myp2@qntHa6"]
}
```

---

## Project Structure

```
password-analyzer/
├── server.js          # Express server entry point
├── routes/
│   └── analyze.js     # Password analysis API logic
├── public/
│   ├── index.html     # Frontend UI
│   ├── style.css      # Styles
│   └── app.js         # Frontend JS (calls the API)
├── package.json
├── .gitignore
└── README.md
```

---

## Deploying

You can deploy this for free on:
- [Render](https://render.com) — connect your GitHub repo, set start command to `npm start`
- [Railway](https://railway.app) — import from GitHub and deploy in one click
- [Cyclic](https://cyclic.sh) — free Node.js hosting

---

## License

MIT — free to use and modify.
