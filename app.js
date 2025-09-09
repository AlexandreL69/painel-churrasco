// Utilitário para pegar o dia da semana em português, considerando o fuso corretamente
function getDiaSemanaLocal(dateValue) {
  if (!dateValue) return "";
  const [ano, mes, dia] = dateValue.split('-').map(Number);
  // mês em JS começa do zero!
  const data = new Date(ano, mes - 1, dia);
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return diasSemana[data.getDay()];
}

// Dados do evento (valores iniciais podem ser vazios)
let evento = {
  nome: '',
  data: '',
  horario: '',
  local: '',
  descricao: ''
};

// Participantes e despesas
let participantes = ['Alexandre', 'Bagé', 'Sandro'];
let despesas = [
  // Exemplo: {desc: 'Carne', valor: 40, pagante: 'Alexandre', envolvidos: ['Alexandre', 'Bagé', 'Sandro']}
];

// --- Atualizar "weekday-output" ao mudar data no formulário ---
document.getElementById('event-date').addEventListener('change', function () {
  const diaSemana = getDiaSemanaLocal(this.value);
  document.getElementById('weekday-output').textContent = diaSemana ? `Dia da semana: ${diaSemana}` : '';
});

// --- Salvar informações do evento (apenas armazena, não exibe no topo) ---
document.getElementById('save-event').onclick = function () {
  evento.nome = document.getElementById('event-name').value;
  evento.data = document.getElementById('event-date').value;
  evento.horario = document.getElementById('event-time').value;
  evento.local = document.getElementById('event-location').value;
  evento.descricao = document.getElementById('event-desc').value;

  alert(`Evento salvo!\n\n${evento.nome}\n${evento.data} (${getDiaSemanaLocal(evento.data)})\n${evento.horario}\n${evento.local}\n${evento.descricao}`);
};

// --- Participantes ---
document.getElementById('add-participant').onclick = function () {
  const nome = document.getElementById('participant-name').value.trim();
  if (!nome) return;
  if (participantes.includes(nome)) {
    alert('Participante já adicionado!');
    return;
  }
  participantes.push(nome);
  atualizarListaParticipantes();
  atualizarSelectParticipantes();
  atualizarQuemParticipou();
  atualizarResumo();
  document.getElementById('participant-name').value = '';
};

function atualizarListaParticipantes() {
  const ul = document.getElementById('participants-list');
  ul.innerHTML = '';
  participantes.forEach((nome, idx) => {
    const li = document.createElement('li');
    li.textContent = nome + ' ';
    const btn = document.createElement('button');
    btn.textContent = 'Remover';
    btn.className = 'green-btn';
    btn.onclick = () => {
      participantes.splice(idx, 1);
      // Remover também das despesas os que não existem mais
      despesas.forEach(d => {
        d.envolvidos = d.envolvidos.filter(p => participantes.includes(p));
        if (!participantes.includes(d.pagante)) d.pagante = participantes[0] || '';
      });
      atualizarListaParticipantes();
      atualizarSelectParticipantes();
      atualizarQuemParticipou();
      atualizarListaDespesas();
      atualizarResumo();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}
atualizarListaParticipantes();

// --- Participantes no select do pagante ---
function atualizarSelectParticipantes() {
  const select = document.getElementById('expense-participant');
  select.innerHTML = '';
  participantes.forEach(nome => {
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });
}
atualizarSelectParticipantes();

// --- Checkboxes de quem participou da despesa ---
function atualizarQuemParticipou() {
  const div = document.getElementById('who-participated');
  div.innerHTML = 'Quem participou dessa despesa:<br>';
  participantes.forEach(nome => {
    const id = 'chk-' + nome;
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = id;
    chk.value = nome;
    chk.checked = true;
    div.appendChild(chk);
    const lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.textContent = ' ' + nome + ' ';
    div.appendChild(lbl);
  });
}
atualizarQuemParticipou();

// --- Adicionar despesa ---
document.getElementById('add-expense').onclick = function () {
  if (participantes.length === 0) {
    alert('Adicione ao menos um participante antes de lançar despesas!');
    return;
  }
  const desc = document.getElementById('expense-desc').value.trim();
  const valor = parseFloat(document.getElementById('expense-value').value);
  const pagante = document.getElementById('expense-participant').value;
  // Quem participou
  const env = [];
  document.querySelectorAll('#who-participated input[type="checkbox"]').forEach(chk => {
    if (chk.checked) env.push(chk.value);
  });

  if (!desc || isNaN(valor) || valor <= 0 || !pagante || env.length === 0) return;

  despesas.push({ desc, valor, pagante, envolvidos: env });
  atualizarListaDespesas();
  atualizarResumo();

  document.getElementById('expense-desc').value = '';
  document.getElementById('expense-value').value = '';
};
atualizarListaDespesas();

// --- Lista de despesas ---
function atualizarListaDespesas() {
  const ul = document.getElementById('expenses-list');
  ul.innerHTML = '';
  despesas.forEach((d, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${d.pagante}</strong> pagou R$ ${d.valor.toFixed(2)} (${d.desc})<br>` +
      `<span style="font-size:0.97em;color:#555;">Dividido entre: ${d.envolvidos.join(', ')}</span> `;
    const btn = document.createElement('button');
    btn.textContent = 'Remover';
    btn.className = 'green-btn';
    btn.onclick = () => {
      despesas.splice(idx, 1);
      atualizarListaDespesas();
      atualizarResumo();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// --- Resumo da divisão das despesas e acertos ---
function atualizarResumo() {
  // Divisão das despesas por participante
  const div = document.getElementById('summary-output');
  if (participantes.length === 0 || despesas.length === 0) {
    div.innerHTML = '';
    document.getElementById('settle-summary').innerHTML = '';
    return;
  }

  // Cálculo: quanto cada um pagou e quanto deveria pagar
  const pagos = {};
  const deve = {};
  participantes.forEach(nome => { pagos[nome] = 0; deve[nome] = 0; });

  despesas.forEach(d => {
    pagos[d.pagante] += d.valor;
    const valorPorPessoa = d.valor / d.envolvidos.length;
    d.envolvidos.forEach(nome => {
      deve[nome] += valorPorPessoa;
    });
  });

  let html = '';
  participantes.forEach(nome => {
    const saldo = pagos[nome] - deve[nome];
    let status = '';
    if (saldo > 0.01) status = `tem a receber`;
    else if (saldo < -0.01) status = `deve`;
    else status = `acertado`;
    html += `${nome}: R$ ${(saldo).toFixed(2)} ${status}<br>`;
  });
  div.innerHTML = html;

  // Resumo de acertos (quem paga quem)
  const settleDiv = document.getElementById('settle-summary');
  // Lista de saldos
  const saldos = participantes.map(nome => ({ nome, saldo: +(pagos[nome] - deve[nome]).toFixed(2) }));
  // Separar credores e devedores
  const credores = saldos.filter(s => s.saldo > 0.01).sort((a, b) => b.saldo - a.saldo);
  const devedores = saldos.filter(s => s.saldo < -0.01).sort((a, b) => a.saldo - b.saldo);
  let resumo = '';
  let i = 0, j = 0;
  while (i < devedores.length && j < credores.length) {
    let dev = devedores[i], cred = credores[j];
    const valor = Math.min(-dev.saldo, cred.saldo);
    if (valor > 0.009) {
      resumo += `${dev.nome} deve pagar R$ ${valor.toFixed(2)} para ${cred.nome}<br>`;
      dev.saldo += valor;
      cred.saldo -= valor;
      if (Math.abs(dev.saldo) < 0.01) i++;
      if (Math.abs(cred.saldo) < 0.01) j++;
    } else {
      i++;
    }
  }
  settleDiv.innerHTML = resumo;
}
atualizarResumo();

// Tema escuro/claro (opcional)
document.getElementById('toggle-theme').onclick = function () {
  document.body.classList.toggle('dark');
};