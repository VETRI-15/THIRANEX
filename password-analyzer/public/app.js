const input = document.getElementById('pwd-input');
const toggleBtn = document.getElementById('toggle-btn');
const results = document.getElementById('results');
const emptyState = document.getElementById('empty-state');
const meter = document.getElementById('meter');
const scoreLabel = document.getElementById('score-label');
const scoreNum = document.getElementById('score-num');
const checksGrid = document.getElementById('checks-grid');
const suggestionsSection = document.getElementById('suggestions-section');
const suggestionsList = document.getElementById('suggestions-list');
const altsContainer = document.getElementById('alts');

let visible = false;
let debounceTimer = null;

const CHECK_LABELS = {
  len8:       'At least 8 chars',
  len12:      'At least 12 chars',
  uppercase:  'Uppercase letter',
  lowercase:  'Lowercase letter',
  number:     'Number',
  special:    'Special character',
  noRepeats:  'No repeated chars (3+)',
  notCommon:  'Not a common password',
};

toggleBtn.addEventListener('click', () => {
  visible = !visible;
  input.type = visible ? 'text' : 'password';
  toggleBtn.textContent = visible ? '🙈' : '👁';
});

input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => analyze(input.value), 200);
});

async function analyze(password) {
  if (!password) {
    results.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    render(data);
  } catch (err) {
    console.error('Failed to analyze:', err);
  }
}

function render(data) {
  results.classList.remove('hidden');
  emptyState.classList.add('hidden');

  meter.style.width = data.score + '%';
  meter.style.background = data.color;
  scoreLabel.textContent = data.label;
  scoreLabel.style.color = data.color;
  scoreNum.textContent = data.score + ' / 100';

  checksGrid.innerHTML = Object.entries(CHECK_LABELS).map(([key, label]) => {
    const pass = data.checks[key];
    return `<div class="check-item ${pass ? 'pass' : 'fail'}">
      <span class="check-icon">${pass ? '✅' : '❌'}</span>${label}
    </div>`;
  }).join('');

  if (data.suggestions.length) {
    suggestionsSection.classList.remove('hidden');
    suggestionsList.innerHTML = data.suggestions.map(s => `<li>${s}</li>`).join('');
  } else {
    suggestionsSection.classList.add('hidden');
  }

  altsContainer.innerHTML = data.alternatives.map(alt => `
    <div class="alt-item">
      <span class="alt-pwd">${alt}</span>
      <button class="copy-btn" data-pwd="${alt}">Copy</button>
    </div>
  `).join('');

  altsContainer.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.pwd).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
      });
    });
  });
}
