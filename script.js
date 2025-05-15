async function carregar(tipo) {
  const snap = await db.collection(tipo).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function atualizaTotais(tipo, itens) {
  const total = itens.length;
  const comprados = itens.filter(i=>i.comprado).length;
  const gasto = itens.filter(i=>i.comprado).reduce((s,i)=>s+parseFloat(i.preco),0);
  const previsto = itens.reduce((s,i)=>s+parseFloat(i.preco),0);
  document.getElementById(`quantidade-itens-${tipo}`).innerText = total;
  document.getElementById(`quantidade-comprados-${tipo}`).innerText = comprados;
  document.getElementById(`gasto-estimado-${tipo}`).innerText = previsto.toFixed(2);
  document.getElementById(`total-gasto-${tipo}`).innerText = gasto.toFixed(2);
  const prog = total?comprados/total*100:0;
  document.getElementById(`progress-${tipo}`).value = prog;
  document.getElementById(`progress-text-${tipo}`).innerText = `${Math.round(prog)}%`;
}

function render(tipo, itens) {
  const tbody = document.querySelector(`#tabela-${tipo} tbody`);
  tbody.innerHTML = "";
  itens.forEach(i=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" ${i.comprado?"checked":""}
           onchange="toggle('${tipo}','${i.id}',this.checked)"></td>
      <td>${i.nome}</td><td>${i.categoria}</td>
      <td>${i.descricao}</td><td>${i.preco}</td>
      <td><button onclick="deleta('${tipo}','${i.id}')">❌</button></td>`;
    tbody.appendChild(tr);
  });
  atualizaTotais(tipo,itens);
}

async function atualizar(tipo) {
  const itens = await carregar(tipo);
  render(tipo,itens);
}

async function adicionar(tipo) {
  const nome = document.getElementById(`item-${tipo}`).value.trim();
  const categoria = document.getElementById(`categoria-${tipo}`).value.trim();
  const descricao = document.getElementById(`descricao-${tipo}`).value.trim();
  const preco = document.getElementById(`preco-${tipo}`).value;
  if(!nome||!categoria||!descricao||!preco) return alert("Preencha tudo");
  await db.collection(tipo).add({
    nome, categoria, descricao, preco, comprado:false
  });
  document.getElementById(`item-${tipo}`).value="";
  document.getElementById(`categoria-${tipo}`).value="";
  document.getElementById(`descricao-${tipo}`).value="";
  document.getElementById(`preco-${tipo}`).value="";
  atualizar(tipo);
}

async function toggle(tipo,id,estado) {
  await db.collection(tipo).doc(id).update({ comprado: estado });
  atualizar(tipo);
}

async function deleta(tipo,id) {
  if(!confirm("Excluir?"))return;
  await db.collection(tipo).doc(id).delete();
  atualizar(tipo);
}

window.onload = () => {
  atualizar('casa');
  atualizar('construcao');
};
