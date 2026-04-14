const CATEGORIES = ['Food', 'Transport', 'Housing', 'Healthcare', 'Entertainment', 'Shopping', 'Other'];

let state = loadState();

function loadState() {
  const saved = localStorage.getItem('pf_state');
  if (saved) {
    return JSON.parse(saved);
  }
  return { budgets: {}, expenses: [] };
}

function saveState() {
  localStorage.setItem('pf_state', JSON.stringify(state));
}


function initSelects() {
  const options = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById('b-cat').innerHTML = options;
  document.getElementById('e-cat').innerHTML = options;
}


function setBudget() {
  const cat = document.getElementById('b-cat').value;
  const amt = parseFloat(document.getElementById('b-amt').value);

  if (!amt || amt <= 0) {
    document.getElementById('b-err').textContent = 'Enter a valid amount greater than zero.';
    return;
  }

  document.getElementById('b-err').textContent = '';
  state.budgets[cat] = amt;
  document.getElementById('b-amt').value = '';
  saveState();
  render();
}

function addExpense() {
  const amt  = parseFloat(document.getElementById('e-amt').value);
  const cat  = document.getElementById('e-cat').value;
  const note = document.getElementById('e-note').value.trim();

  if (!amt || amt <= 0) {
    document.getElementById('e-err').textContent = 'Enter a valid amount greater than zero.';
    return;
  }

  document.getElementById('e-err').textContent = '';

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

function render() {
  // ── Summary numbers at the top ──
  const totalBudget = Object.values(state.budgets).reduce((sum, v) => sum + v, 0);
  const totalSpent  = state.expenses.reduce((sum, e) => sum + e.amt, 0);
  const remaining   = totalBudget - totalSpent;

  document.getElementById('m-budget').textContent    = '$' + totalBudget.toFixed(2);
  document.getElementById('m-spent').textContent     = '$' + totalSpent.toFixed(2);
  document.getElementById('m-remaining').textContent = '$' + remaining.toFixed(2);

  const remEl = document.getElementById('m-remaining');
  if (remaining < 0) {
    remEl.className = 'metric-val danger';
  } else if (totalBudget > 0) {
    remEl.className = 'metric-val ok';
  } else {
    remEl.className = 'metric-val';
  }

  const catList = document.getElementById('cat-list');

  const activeCats = CATEGORIES.filter(cat =>
    state.budgets[cat] || state.expenses.some(e => e.cat === cat)
  );

  if (activeCats.length === 0) {
    catList.innerHTML = '<p class="empty">Set a budget to get started.</p>';
  } else {
    catList.innerHTML = activeCats.map(cat => {
      const budget = state.budgets[cat] || 0;
      const spent  = state.expenses
        .filter(e => e.cat === cat)
        .reduce((sum, e) => sum + e.amt, 0);
      const pct    = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0;
      const over   = budget > 0 && spent > budget;

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
                <div class="progress-fill" style="width: ${pct}%; background: ${over ? '#a32d2d' : '#1a1a18'};"></div>
              </div>` : ''}
          </div>
          <span class="cat-amounts">$${spent.toFixed(2)} / ${budget > 0 ? '$' + budget.toFixed(2) : '—'}</span>
        </div>`;
    }).join('');
  }

  const expList = document.getElementById('exp-list');

  if (state.expenses.length === 0) {
    expList.innerHTML = '<p class="empty">No expenses yet.</p>';
  } else {
    expList.innerHTML = [...state.expenses].reverse().map(e => `
      <div class="exp-row">
        <span class="exp-cat-badge cat-${e.cat.toLowerCase()}">${e.cat}</span>
        <span class="exp-note">${e.note || '—'}</span>
        <span class="exp-date">${e.date}</span>
        <span class="exp-amt">$${e.amt.toFixed(2)}</span>
        <button class="btn-delete" onclick="deleteExpense(${e.id})">delete</button>
      </div>`).join('');
  }
}


document.getElementById('set-budget-btn').addEventListener('click', setBudget);
document.getElementById('add-expense-btn').addEventListener('click', addExpense);
document.getElementById('reset-btn').addEventListener('click', resetAll);

initSelects();
render();