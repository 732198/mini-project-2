const CATEGORIES = ['Food', 'Transport', 'Housing', 'Healthcare', 'Entertainment', 'Shopping', 'Other'];

// ── State ──────────────────────────────────────────────────
let state = loadState();

function loadState() {
  try {
    return JSON.parse(localStorage.getItem('pf_state')) || { budgets: {}, expenses: [] };
  } catch (e) {
    return { budgets: {}, expenses: [] };
  }
}

function saveState() {
  localStorage.setItem('pf_state', JSON.stringify(state));
}

// ── Helpers ────────────────────────────────────────────────
function fmt(n) {
  return '$' + parseFloat(n).toFixed(2);
}

function catClass(cat) {
  return 'cat-' + cat.toLowerCase();
}

function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearError(id) {
  document.getElementById(id).textContent = '';
}

// ── Init selects ───────────────────────────────────────────
function initSelects() {
  const options = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById('b-cat').innerHTML = options;
  document.getElementById('e-cat').innerHTML = options;
}

// ── Actions ────────────────────────────────────────────────
function setBudget() {
  const cat = document.getElementById('b-cat').value;
  const amt = parseFloat(document.getElementById('b-amt').value);

  if (isNaN(amt) || amt <= 0) {
    showError('b-err', 'Enter a valid amount greater than zero.');
    return;
  }

  clearError('b-err');
  state.budgets[cat] = amt;
  document.getElementById('b-amt').value = '';
  saveState();
  render();
}

function addExpense() {
  const amt  = parseFloat(document.getElementById('e-amt').value);
  const cat  = document.getElementById('e-cat').value;
  const note = document.getElementById('e-note').value.trim();

  if (isNaN(amt) || amt <= 0) {
    showError('e-err', 'Enter a valid amount greater than zero.');
    return;
  }

  clearError('e-err');
  state.expenses.push({
    id:   Date.now(),
    amt,
    cat,
    note,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  });

  document.getElementById('e-amt').value  = '';
  document.getElementById('e-note').value = '';
  saveState();
  render();
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveState();
  render();
}

function resetAll() {
  if (!confirm('Clear all expenses and budgets for a fresh month?')) return;
  state = { budgets: {}, expenses: [] };
  saveState();
  render();
}

// ── Render ─────────────────────────────────────────────────
function render() {
  renderMetrics();
  renderBreakdown();
  renderExpenses();
}

function renderMetrics() {
  const totalBudget  = Object.values(state.budgets).reduce((sum, v) => sum + v, 0);
  const totalSpent   = state.expenses.reduce((sum, e) => sum + e.amt, 0);
  const remaining    = totalBudget - totalSpent;

  document.getElementById('m-budget').textContent    = fmt(totalBudget);
  document.getElementById('m-spent').textContent     = fmt(totalSpent);

  const remEl = document.getElementById('m-remaining');
  remEl.textContent = fmt(remaining);
  remEl.className   = 'metric-val' + (remaining < 0 ? ' danger' : totalBudget > 0 ? ' ok' : '');
}

function renderBreakdown() {
  const container = document.getElementById('cat-list');

  const activeCats = CATEGORIES.filter(c =>
    state.budgets[c] || state.expenses.some(e => e.cat === c)
  );

  if (activeCats.length === 0) {
    container.innerHTML = '<p class="empty">Set a budget to get started.</p>';
    return;
  }

  container.innerHTML = activeCats.map(cat => {
    const budget = state.budgets[cat] || 0;
    const spent  = state.expenses.filter(e => e.cat === cat).reduce((sum, e) => sum + e.amt, 0);
    const pct    = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0;
    const over   = budget > 0 && spent > budget;
    const barColor = over ? '#a32d2d' : getBarColor(cat);

    return `
      <div class="cat-row">
        <span class="cat-name">${cat}</span>
        <div class="cat-bar-wrap">
          <div class="cat-bar-meta">
            <span>${budget > 0 ? pct + '% used' : 'no budget set'}</span>
            ${over ? '<span class="cat-over-badge">over budget</span>' : ''}
          </div>
          ${budget > 0 ? `
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background: ${barColor};"></div>
            </div>` : ''}
        </div>
        <span class="cat-amounts">${fmt(spent)} / ${budget > 0 ? fmt(budget) : '—'}</span>
      </div>`;
  }).join('');
}

function renderExpenses() {
  const container = document.getElementById('exp-list');

  if (state.expenses.length === 0) {
    container.innerHTML = '<p class="empty">No expenses yet.</p>';
    return;
  }

  container.innerHTML = [...state.expenses].reverse().map(e => `
    <div class="exp-row">
      <span class="exp-cat-badge ${catClass(e.cat)}">${e.cat}</span>
      <span class="exp-note">${e.note || '—'}</span>
      <span class="exp-date">${e.date}</span>
      <span class="exp-amt">${fmt(e.amt)}</span>
      <button class="btn-delete" onclick="deleteExpense(${e.id})">delete</button>
    </div>`).join('');
}

// ── Bar colors per category ────────────────────────────────
function getBarColor(cat) {
  const colors = {
    Food:          '#1D9E75',
    Transport:     '#378ADD',
    Housing:       '#7F77DD',
    Healthcare:    '#D4537E',
    Entertainment: '#BA7517',
    Shopping:      '#639922',
    Other:         '#888780'
  };
  return colors[cat] || '#888780';
}

// ── Event listeners ────────────────────────────────────────
document.getElementById('set-budget-btn').addEventListener('click', setBudget);
document.getElementById('add-expense-btn').addEventListener('click', addExpense);
document.getElementById('reset-btn').addEventListener('click', resetAll);

// ── Boot ───────────────────────────────────────────────────
initSelects();
render();