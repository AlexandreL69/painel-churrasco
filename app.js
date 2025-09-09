// --- Estrutura de dados ---
let events = [];
let currentEventIndex = null;

// Carregar dados do LocalStorage ao iniciar
if (localStorage.getItem('churrasEvents')) {
  try {
    events = JSON.parse(localStorage.getItem('churrasEvents'));
  } catch(e) {
    events = [];
  }
}
renderEvents();

// --- Tema escuro ---
const htmlBody = document.body;
const toggleThemeBtn = document.getElementById('toggle-theme');
function setTheme(theme) {
  if (theme === "dark") {
    htmlBody.classList.add('dark');
    toggleThemeBtn.textContent = "☀️";
    localStorage.setItem("churrasTheme", "dark");
  } else {
    htmlBody.classList.remove('dark');
    toggleThemeBtn.textContent = "🌙";
    localStorage.setItem("churrasTheme", "light");
  }
}
toggleThemeBtn.onclick = () => {
  setTheme(htmlBody.classList.contains('dark') ? "light" : "dark");
};
setTheme(localStorage.getItem("churrasTheme") || "light");

// --- Funções principais ---
function saveEvents() {
  localStorage.setItem('churrasEvents', JSON.stringify(events));
}

function criarEvento() {
  const name = document.getElementById('event-name').value.trim();
  const date = document.getElementById('event-date').value;
  const desc = document.getElementById('event-desc').value.trim();
  if (!name) return;
  events.push({
    name,
    date,
    desc,
    participants: [],
    expenses: []
  });
  document.getElementById('event-name').value = '';
  document.getElementById('event-date').value = '';
  document.getElementById('event-desc').value = '';
  saveEvents();
  renderEvents();
}

function renderEvents() {
  const list = document.getElementById('event-list');
  list.innerHTML = '';
  events.forEach((event, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${event.name}</b> ${event.date ? '('+event.date+')' : ''} <br><small>${event.desc || ''}</small>`;
    li.style.cursor = 'pointer';
    li.onclick = () => openEvent(idx);
    list.appendChild(li);
  });
}

function openEvent(idx) {
  currentEventIndex = idx;
  document.getElementById('event-section').style.display = 'none';
  document.getElementById('main-panel').style.display = 'block';
  document.getElementById('current-event-name').textContent = events[idx].name;
  document.getElementById('current-event-date').textContent = events[idx].date || '';
  document.getElementById('current-event-desc').textContent = events[idx].desc || '';
  renderParticipants();
  renderExpenses();
  renderBalances();
  renderSettlement();
}

function backToEvents() {
  document.getElementById('main-panel').style.display = 'none';
  document.getElementById('event-section').style.display = 'block';
  currentEventIndex = null;
  renderEvents();
}

function addParticipant() {
  const name = document.getElementById('participant-name').value.trim();
  if (!name) return;
  const event = events[currentEventIndex];
  if (event.participants.includes(name)) return;
  event.participants.push(name);
  document.getElementById('participant-name').value = '';
  saveEvents();
  renderParticipants();
  renderExpenses();
  renderBalances();
  renderSettlement();
}

function renderParticipants() {
  const event = events[currentEventIndex];
  const list = document.getElementById('participant-list');
  list.innerHTML = '';
  event.participants.forEach((p, idx) => {
    const li = document.createElement('li');
    li.textContent = p + " ";
    const btn = document.createElement('button');
    btn.textContent = 'Remover';
    btn.onclick = () => {
      event.participants.splice(idx, 1);
      // Remove despesas pagas ou divididas por este participante
      event.expenses = event.expenses.filter(e => e.payer !== p && !e.sharers.includes(p));
      saveEvents();
      renderParticipants();
      renderExpenses();
      renderBalances();
      renderSettlement();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
  // Atualiza opções de pagador da despesa
  const payerSelect = document.getElementById('expense-payer');
  payerSelect.innerHTML = '';
  event.participants.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    payerSelect.appendChild(opt);
  });
  renderExpenseSharers();
}

// Divisão personalizada
function renderExpenseSharers() {
  const event = events[currentEventIndex];
  const container = document.getElementById('expense-sharers-container');
  container.innerHTML = '<span>Quem participou dessa despesa:</span><br>';
  event.participants.forEach(p => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" name="expense-sharers" value="${p}" checked> ${p}`;
    container.appendChild(label);
  });
}

function getSelectedSharers() {
  return Array.from(document.querySelectorAll('input[name="expense-sharers"]:checked')).map(cb => cb.value);
}

function addExpense() {
  const desc = document.getElementById('expense-desc').value.trim();
  const value = parseFloat(document.getElementById('expense-value').value);
  const payer = document.getElementById('expense-payer').value;
  const sharers = getSelectedSharers();
  if (!desc || isNaN(value) || value <= 0 || !payer || !sharers.length) return;
  const event = events[currentEventIndex];
  event.expenses.push({ desc, value, payer, sharers });
  document.getElementById('expense-desc').value = '';
  document.getElementById('expense-value').value = '';
  saveEvents();
  renderExpenses();
  renderBalances();
  renderSettlement();
}

function renderExpenses() {
  const event = events[currentEventIndex];
  const list = document.getElementById('expense-list');
  list.innerHTML = '';
  event.expenses.forEach((e, idx) => {
    const sharersTxt = e.sharers.join(', ');
    const li = document.createElement('li');
    li.innerHTML = `<b>${e.payer}</b> pagou R$ ${e.value.toFixed(2)} (${e.desc})<br><small>Dividido entre: ${sharersTxt}</small> `;
    const btn = document.createElement('button');
    btn.textContent = 'Remover';
    btn.onclick = () => {
      event.expenses.splice(idx, 1);
      saveEvents();
      renderExpenses();
      renderBalances();
      renderSettlement();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderBalances() {
  const event = events[currentEventIndex];
  const balances = {};
  event.participants.forEach(p => balances[p] = 0);
  event.expenses.forEach(e => {
    const share = e.value / e.sharers.length;
    e.sharers.forEach(p => {
      if (p === e.payer) {
        balances[p] += e.value - share;
      } else {
        balances[p] -= share;
      }
    });
  });
  const list = document.getElementById('balance-list');
  list.innerHTML = '';
  event.participants.forEach(p => {
    const v = balances[p];
    const li = document.createElement('li');
    li.textContent = `${p}: R$ ${v.toFixed(2)}${v < 0 ? " deve" : v > 0 ? " tem a receber" : ""}`;
    list.appendChild(li);
  });
}

// Resumo de acertos (quem paga quem)
function renderSettlement() {
  const event = events[currentEventIndex];
  const balances = {};
  event.participants.forEach(p => balances[p] = 0);

  event.expenses.forEach(e => {
    const share = e.value / e.sharers.length;
    e.sharers.forEach(p => {
      if (p === e.payer) {
        balances[p] += e.value - share;
      } else {
        balances[p] -= share;
      }
    });
  });

  // Processamento dos acertos
  const debtors = [], creditors = [];
  for (const p of event.participants) {
    const v = +balances[p].toFixed(2);
    if (v < -0.01) debtors.push({ name: p, value: -v });
    if (v > 0.01) creditors.push({ name: p, value: v });
  }
  debtors.sort((a, b) => b.value - a.value);
  creditors.sort((a, b) => b.value - a.value);

  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i], c = creditors[j];
    const pay = Math.min(d.value, c.value);
    settlements.push(`${d.name} deve pagar R$ ${pay.toFixed(2)} para ${c.name}`);
    d.value -= pay; c.value -= pay;
    if (d.value < 0.01) i++;
    if (c.value < 0.01) j++;
  }

  const list = document.getElementById('settlement-list');
  list.innerHTML = '';
  settlements.forEach(txt => {
    const li = document.createElement('li');
    li.textContent = txt;
    list.appendChild(li);
  });
  if (!settlements.length) {
    list.innerHTML = '<li>Ninguém deve nada. Tudo acertado!</li>';
  }
}

// Exportação/Importação
function exportData() {
  const dataStr = JSON.stringify(events, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "churrasco-dados.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 100);
}

function importData() {
  document.getElementById("import-input").click();
}
document.getElementById("import-input").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data)) {
        events = data;
        saveEvents();
        renderEvents();
        backToEvents();
        alert("Dados importados com sucesso!");
      } else {
        alert("Arquivo inválido.");
      }
    } catch {
      alert("Arquivo inválido.");
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});
