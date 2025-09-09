// Utilitário para pegar o dia da semana em português, considerando o fuso corretamente
function getDiaSemanaLocal(dateValue) {
  if (!dateValue) return "";
  const [ano, mes, dia] = dateValue.split('-').map(Number);
  // mês em JS começa do zero!
  const data = new Date(ano, mes - 1, dia);
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return diasSemana[data.getDay()];
}

// Atualiza o campo do dia da semana ao escolher a data
document.getElementById('event-date').addEventListener('change', function () {
  const diaSemana = getDiaSemanaLocal(this.value);
  document.getElementById('weekday-output').textContent = diaSemana ? `Dia da semana: ${diaSemana}` : '';
});

// Dados do evento
let evento = {
  nome: '',
  data: '',
  horario: '',
  local: '',
  descricao: ''
};

// Participantes e despesas
let participantes = [];
let despesas = [];

// Salvar informações do evento
document.getElementById('save-event').onclick = function () {
  evento.nome = document.getElementById('event-name').value;
  evento.data = document.getElementById('event-date').value;
  evento.horario = document.getElementById('event-time').value;
  evento.local = document.getElementById('event-location').value;
  evento.descricao = document.getElementById('event-desc').value;

  alert(`Evento salvo!\n\n${evento.nome}\n${evento.data} (${getDiaSemanaLocal(evento.data)})\n${evento.horario}\n${evento.local}\n${evento.descricao}`);
};

// Adicionar participante
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
    btn.onclick = () => {
      participantes.splice(idx, 1);
      atualizarListaParticipantes();
      atualizarSelectParticipantes();
      atualizarResumo();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

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

// Adicionar despesa
document.getElementById('add-expense').onclick = function () {
  if (participantes.length === 0) {
    alert('Adicione ao menos um participante antes de lançar despesas!');
    return;
  }
  const desc = document.getElementById('expense-desc').value.trim();
  const valor = parseFloat(document.getElementById('expense-value').value);
  const pagante = document.getElementById('expense-participant').value;
  if (!desc || isNaN(valor) || valor <= 0 || !pagante) return;

  despesas.push({ desc, valor, pagante });
  atualizarListaDespesas();
  atualizarResumo();

  document.getElementById('expense-desc').value = '';
  document.getElementById('expense-value').value = '';
};

function atualizarListaDespesas() {
  const ul = document.getElementById('expenses-list');
  ul.innerHTML = '';
  despesas.forEach((d, idx) => {
    const li = document.createElement('li');
    li.textContent = `${d.desc} - R$ ${d.valor.toFixed(2)} (Pagou: ${d.pagante}) `;
    const btn = document.createElement('button');
    btn.textContent = 'Remover';
    btn.onclick = () => {
      despesas.splice(idx, 1);
      atualizarListaDespesas();
      atualizarResumo();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// Resumo de quanto cada um deve
function atualizarResumo() {
  const div = document.getElementById('summary-output');
  if (participantes.length === 0 || despesas.length === 0) {
    div.textContent = '';
    return;
  }

  // Total gasto e quanto cada um deveria pagar
  const total = despesas.reduce((soma, d) => soma + d.valor, 0);
  const porPessoa = total / participantes.length;

  // Quanto cada um já pagou
  const pagos = {};
  participantes.forEach(nome => pagos[nome] = 0);
  despesas.forEach(d => pagos[d.pagante] += d.valor);

  let html = `<p>Total gasto: <strong>R$ ${total.toFixed(2)}</strong> &mdash; Cada um paga: <strong>R$ ${porPessoa.toFixed(2)}</strong></p><ul>`;
  participantes.forEach(nome => {
    const saldo = pagos[nome] - porPessoa;
    let status = '';
    if (saldo > 0.01) status = `deve receber <strong>R$ ${saldo.toFixed(2)}</strong>`;
    else if (saldo < -0.01) status = `deve pagar <strong>R$ ${(-saldo).toFixed(2)}</strong>`;
    else status = `<strong>acertado</strong>`;
    html += `<li>${nome}: ${status}</li>`;
  });
  html += '</ul>';
  div.innerHTML = html;
}

// Tema escuro/claro (opcional)
document.getElementById('toggle-theme').onclick = function () {
  document.body.classList.toggle('dark');
};