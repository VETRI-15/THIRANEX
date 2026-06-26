# 🔐 Secure Login System

A full-stack secure login web application built with **Node.js + Express**, featuring hashed passwords, SQL injection protection, session management, rate limiting, and optional **Two-Factor Authentication (2FA)**.

---

## 🌟 Key Features

| Feature | Details |
|---|---|
| **Password Hashing** | bcryptjs with cost factor 12 |
| **Input Validation** | express-validator (sanitizes all inputs, blocks SQL injection) |
| **Session Management** | Secure HTTP-only cookies, 30-min expiry, logout |
| **Rate Limiting** | Max 10 login attempts per IP per 15 minutes |
| **Account Lockout** | Auto-locks account for 15 min after 5 failed attempts |
| **2FA (Optional)** | TOTP via speakeasy + QR code (Google Authenticator, Authy) |
| **Password Strength** | Live indicator on registration form |
| **Change Password** | From dashboard with current password verification |

---

## 🗂️ Project Structure

```
secure-login-system/
│
├── server.js              # Express app entry point
├── db.js                  # JSON flat-file database (swap with SQL in prod)
├── package.json
│
├── routes/
│   ├── auth.js            # Register, Login, Logout, 2FA setup/verify
│   └── dashboard.js       # Protected dashboard, change password
│
├── middleware/
│   └── auth.js            # requireAuth / requireNoAuth guards
│
├── views/                 # EJS templates
│   ├── register.ejs
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── 2fa-setup.ejs
│   ├── 2fa-verify.ejs
│   ├── error.ejs
│   └── partials/
│       └── head.ejs
│
├── public/
│   └── css/
│       └── style.css      # Full custom CSS
│
└── data/
    └── users.json         # Auto-created on first run
```

---

## ⚙️ Installation & Running

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/secure-login-system.git
cd secure-login-system

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open in browser
# http://localhost:3000
```

---

## 🔒 Security Features In Detail

### 1. Password Hashing (bcrypt)
Passwords are **never stored in plain text**. bcryptjs with a cost factor of 12 is used:
```js
const hash = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(inputPassword, storedHash);
```

### 2. SQL Injection Protection
All inputs are sanitized and validated using `express-validator`:
- `.trim()` removes leading/trailing whitespace
- `.normalizeEmail()` normalizes email formats
- `.isEmail()`, `.isLength()`, `.matches()` enforce strict rules

### 3. Session Security
```js
cookie: {
  httpOnly: true,   // JS cannot access the cookie (prevents XSS)
  secure: false,    // Set true in production with HTTPS
  maxAge: 1800000   // 30-minute inactivity timeout
}
```

### 4. Rate Limiting
```js
rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
```
Blocks brute-force attacks by limiting login attempts per IP.

### 5. Account Lockout
After 5 failed login attempts, the account is locked for 15 minutes.

### 6. Two-Factor Authentication (2FA)
TOTP (Time-based One-Time Password) using the `speakeasy` library.  
Compatible with **Google Authenticator**, **Authy**, **Microsoft Authenticator**.

---

## 🖥️ Screenshots

| Page | Description |
|---|---|
| `/auth/register` | Registration with password strength meter |
| `/auth/login` | Login with rate limiting |
| `/dashboard` | Protected dashboard with account info |
| `/auth/2fa-setup` | QR code scan for 2FA setup |
| `/auth/2fa-verify` | 2FA code entry |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Backend server |
| EJS | Server-side templating |
| bcryptjs | Password hashing |
| express-session | Session management |
| express-rate-limit | Brute-force protection |
| express-validator | Input validation & sanitization |
| speakeasy | TOTP 2FA generation/verification |
| qrcode | QR code generation for 2FA setup |

---

## 🚀 Production Notes

Before deploying to production:
1. Set `cookie.secure = true` (requires HTTPS)
2. Use a strong, persistent session secret from environment variables
3. Replace the JSON file database with PostgreSQL or MySQL
4. Add HTTPS / SSL certificate

---

## 👨‍💻 Author

Built as a Cybersecurity Web Application project.

---

## 📄 License

MIT License
