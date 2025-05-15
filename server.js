const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const db = new sqlite3.Database('./compras.db');

app.use(cors());
app.use(express.json());

// Criar tabelas
db.serialize(() => {
  db.run(\`CREATE TABLE IF NOT EXISTS itensCasa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    categoria TEXT,
    descricao TEXT,
    preco REAL,
    comprado INTEGER
  )\`);
  db.run(\`CREATE TABLE IF NOT EXISTS itensConstrucao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    categoria TEXT,
    descricao TEXT,
    preco REAL,
    comprado INTEGER
  )\`);
});

// Listar itens
app.get('/api/:tipo', (req, res) => {
  const tipo = req.params.tipo; // "casa" ou "construcao"
  const table = tipo === 'casa' ? 'itensCasa' : 'itensConstrucao';
  db.all(\`SELECT * FROM \${table}\`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Adicionar item
app.post('/api/:tipo', (req, res) => {
  const { nome, categoria, descricao, preco } = req.body;
  const table = req.params.tipo === 'casa' ? 'itensCasa' : 'itensConstrucao';
  db.run(
    \`INSERT INTO \${table} (nome, categoria, descricao, preco, comprado) VALUES (?, ?, ?, ?, 0)\`,
    [nome, categoria, descricao, preco],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Marcar comprado / desmarcar
app.patch('/api/:tipo/:id', (req, res) => {
  const { comprado } = req.body;
  const table = req.params.tipo === 'casa' ? 'itensCasa' : 'itensConstrucao';
  db.run(
    \`UPDATE \${table} SET comprado = ? WHERE id = ?\`,
    [comprado ? 1 : 0, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Excluir item
app.delete('/api/:tipo/:id', (req, res) => {
  const table = req.params.tipo === 'casa' ? 'itensCasa' : 'itensConstrucao';
  db.run(\`DELETE FROM \${table} WHERE id = ?\`, req.params.id, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`API rodando na porta \${PORT}\`));