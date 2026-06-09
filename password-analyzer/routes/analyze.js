const express = require('express');
const router = express.Router();

const COMMON_PASSWORDS = [
  'password','123456','qwerty','letmein','welcome','monkey','dragon',
  'master','abc123','admin','iloveyou','sunshine','princess','football',
  'shadow','superman','batman','trustno1','hello','password1','passw0rd',
  '12345678','1234567','123456789','qwerty123','111111','1234','test',
];

function scorePassword(password) {
  if (!password) return { score: 0, label: 'Empty', color: 'red' };

  let score = 0;
  const checks = {
    len8:      password.length >= 8,
    len12:     password.length >= 12,
    len16:     password.length >= 16,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
    noRepeats: !(/(.)\1{2,}/.test(password)),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
    uniqueChars: (new Set(password).size / password.length) > 0.7,
  };

  if (checks.len8)      score += 10;
  if (checks.len12)     score += 15;
  if (checks.len16)     score += 10;
  if (checks.uppercase) score += 10;
  if (checks.lowercase) score += 10;
  if (checks.number)    score += 10;
  if (checks.special)   score += 15;
  if (checks.noRepeats) score += 10;
  if (checks.notCommon) score += 10;
  if (checks.uniqueChars) score += 5;

  score = Math.min(score, 100);

  let label, color;
  if (score < 25)      { label = 'Very weak';   color = '#E24B4A'; }
  else if (score < 50) { label = 'Weak';         color = '#EF9F27'; }
  else if (score < 70) { label = 'Fair';         color = '#FAC775'; }
  else if (score < 90) { label = 'Strong';       color = '#97C459'; }
  else                 { label = 'Very strong';  color = '#1D9E75'; }

  return { score, label, color, checks };
}

function getSuggestions(password) {
  const tips = [];
  if (!password) return tips;
  if (password.length < 8)  tips.push('Use at least 8 characters.');
  else if (password.length < 12) tips.push('Aim for 12+ characters for better security.');
  if (!/[A-Z]/.test(password)) tips.push('Add uppercase letters (A–Z).');
  if (!/[a-z]/.test(password)) tips.push('Add lowercase letters (a–z).');
  if (!/[0-9]/.test(password)) tips.push('Include at least one number.');
  if (!/[^A-Za-z0-9]/.test(password)) tips.push('Add special characters like !@#$%.');
  if (/(.)\1{2,}/.test(password)) tips.push('Avoid repeating characters (e.g. "aaa").');
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) tips.push('This is a very common password — avoid it.');
  return tips;
}

function generateAlternatives(base) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums  = '0123456789';
  const special = '!@#$%^&*-_=+?';

  const rand = str => str[Math.floor(Math.random() * str.length)];

  const alts = [];
  for (let i = 0; i < 3; i++) {
    let pwd = '';
    if (base && base.length >= 3) {
      const root = base.slice(0, 4);
      pwd += root[0].toUpperCase() + root.slice(1).toLowerCase();
      pwd += rand(nums) + rand(special);
      const unused = lower.split('').filter(c => !root.toLowerCase().includes(c));
      for (let j = 0; j < 4; j++) pwd += rand(unused.length ? unused : lower);
      pwd += rand(upper) + rand(nums);
    } else {
      pwd += rand(upper);
      for (let j = 0; j < 4; j++) pwd += rand(lower);
      pwd += rand(nums) + rand(nums) + rand(special);
      for (let j = 0; j < 3; j++) pwd += rand(lower);
      pwd += rand(upper) + rand(nums);
    }
    alts.push(pwd);
  }
  return alts;
}

// POST /api/analyze
router.post('/', (req, res) => {
  const { password } = req.body;

  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid input. "password" must be a string.' });
  }

  const analysis = scorePassword(password);
  const suggestions = getSuggestions(password);
  const alternatives = generateAlternatives(password);

  res.json({
    score: analysis.score,
    label: analysis.label,
    color: analysis.color,
    checks: analysis.checks,
    suggestions,
    alternatives,
  });
});

module.exports = router;
