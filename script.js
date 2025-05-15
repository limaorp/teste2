const API_URL = 'http://localhost:3000/api';
let itensCasa = [];
let itensConstrucao = [];

async function carregarItens(tipo) {
  const res = await fetch(`${API_URL}/${tipo}`);
  return res.json();
}

async function renderTabelaCasa() {
  itensCasa = await carregarItens('casa');
  const tbody = document.querySelector("#tabela-casa tbody");
  tbody.innerHTML = "";
  itensCasa.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" ${item.comprado ? "checked" : ""} onchange="toggleComprado('casa', ${item.id}, this.checked)"></td>
      <td>${item.nome}</td>
      <td>${item.categoria}</td>
      <td>${item.descricao}</td>
      <td>R$ ${item.preco}</td>
      <td><button onclick="excluirItem('casa', ${item.id})">Excluir 📤</button></td>
    `;
    tbody.appendChild(tr);
  });
  atualizarTotais('casa', itensCasa);
  renderComprados('casa', itensCasa);
}

async function renderTabelaConstrucao() {
  itensConstrucao = await carregarItens('construcao');
  const tbody = document.querySelector("#tabela-construcao tbody");
  tbody.innerHTML = "";
  itensConstrucao.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" ${item.comprado ? "checked" : ""} onchange="toggleComprado('construcao', ${item.id}, this.checked)"></td>
      <td>${item.nome}</td>
      <td>${item.categoria}</td>
      <td>${item.descricao}</td>
      <td>R$ ${item.preco}</td>
      <td><button onclick="excluirItem('construcao', ${item.id})">Excluir 📤</button></td>
    `;
    tbody.appendChild(tr);
  });
  atualizarTotais('construcao', itensConstrucao);
  renderComprados('construcao', itensConstrucao);
}

async function adicionarItem(tipo) {
  const nome = document.getElementById(`item-${tipo}`).value.trim();
  const categoria = document.getElementById(`categoria-${tipo}`).value.trim();
  const descricao = document.getElementById(`descricao-${tipo}`).value.trim();
  const preco = parseFloat(document.getElementById(`preco-${tipo}`).value);

  if (!nome || !categoria || !descricao || isNaN(preco)) {
    return alert("Preencha todos os campos corretamente.");
  }

  await fetch(`${API_URL}/${tipo}`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ nome, categoria, descricao, preco })
  });
  document.getElementById(`item-${tipo}`).value = '';
  document.getElementById(`categoria-${tipo}`).value = '';
  document.getElementById(`descricao-${tipo}`).value = '';
  document.getElementById(`preco-${tipo}`).value = '';
  if (tipo === 'casa') renderTabelaCasa();
  else renderTabelaConstrucao();
}

async function toggleComprado(tipo, id, estado) {
  await fetch(`${API_URL}/${tipo}/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ comprado: estado })
  });
  if (tipo === 'casa') renderTabelaCasa();
  else renderTabelaConstrucao();
}

async function excluirItem(tipo, id) {
  if (!confirm("Deseja excluir este item?")) return;
  await fetch(`${API_URL}/${tipo}/${id}`, { method: 'DELETE' });
  if (tipo === 'casa') renderTabelaCasa();
  else renderTabelaConstrucao();
}

function atualizarTotais(tipo, itens) {
  const total = itens.length;
  const comprados = itens.filter(i => i.comprado).length;
  const gasto = itens.filter(i => i.comprado).reduce((s, i) => s + i.preco, 0);
  const previsto = itens.reduce((s, i) => s + i.preco, 0);

  document.getElementById(`quantidade-itens-${tipo}`).innerText = total;
  document.getElementById(`quantidade-comprados-${tipo}`).innerText = comprados;
  document.getElementById(`gasto-estimado-${tipo}`).innerText = previsto.toFixed(2);
  document.getElementById(`total-gasto-${tipo}`).innerText = gasto.toFixed(2);
  const prog = total ? (comprados/total)*100 : 0;
  document.getElementById(`progress-${tipo}`).value = prog;
  document.getElementById(`progress-text-${tipo}`).innerText = `${Math.round(prog)}% Completo`;
}

function renderComprados(tipo, itens) {
  const tbody = document.querySelector(`#tabela-comprados-${tipo} tbody`);
  tbody.innerHTML = "";
  itens.filter(i => i.comprado).forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nome}</td><td>${item.categoria}</td><td>${item.descricao}</td><td>R$ ${item.preco}</td>
    `;
    tbody.appendChild(tr);
  });
}

window.onload = () => {
  renderTabelaCasa();
  renderTabelaConstrucao();
};