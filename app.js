// ... seu código existente ...

document.getElementById('event-date').addEventListener('change', function () {
  const dateValue = this.value;
  if (dateValue) {
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const data = new Date(dateValue);
    const diaSemana = diasSemana[data.getDay()];
    document.getElementById('weekday-output').textContent = `Dia da semana: ${diaSemana}`;
  } else {
    document.getElementById('weekday-output').textContent = '';
  }
});

// Para salvar e exibir horário e local, basta capturar os valores dos inputs event-time e event-location
// Exemplo ao criar/mostrar o evento:
function obterDadosEvento() {
  const nome = document.getElementById('event-name').value;
  const data = document.getElementById('event-date').value;
  const horario = document.getElementById('event-time').value;
  const local = document.getElementById('event-location').value;
  const descricao = document.getElementById('event-desc').value;

  // Você pode armazenar ou exibir esses dados conforme sua lógica
  return { nome, data, horario, local, descricao };
}