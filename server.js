require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Configuração do Banco de Dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agencia_eventos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Teste de Conexão com o Banco
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conexão com o banco de dados estabelecida');
    conn.release();
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco:', err);
    process.exit(1);
  }
}

// Autenticação
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acesso não autorizado' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

// Rotas Públicas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(senha, user.senha);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, cargo: user.cargo },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        nome: user.nome, 
        cargo: user.cargo 
      } 
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


app.use('/api', authenticate);

app.get('/api/clientes', async (req, res) => {
  try {
    const [clientes] = await pool.query('SELECT * FROM clientes ORDER BY nome');
    res.json(clientes);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, cpf, telefone, email, endereco, observacoes } = req.body;
    const [result] = await pool.query(
      'INSERT INTO clientes (nome, cpf, telefone, email, endereco, observacoes) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cpf, telefone, email, endereco, observacoes]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

app.get('/api/eventos', async (req, res) => {
  try {
    const [eventos] = await pool.query(`
      SELECT e.*, c.nome AS cliente_nome 
      FROM eventos e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      ORDER BY e.data DESC
    `);
    res.json(eventos);
  } catch (err) {
    console.error('Erro ao buscar eventos:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

app.post('/api/eventos', async (req, res) => {
  try {
    const { nome, cliente_id, meio_agendamento, local, data, tipo, atendente, observacoes } = req.body;
    const [result] = await pool.query(
      `INSERT INTO eventos 
      (nome, cliente_id, meio_agendamento, local, data, tipo, atendente, observacoes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, cliente_id, meio_agendamento, local, data, tipo, atendente, observacoes]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const [eventos] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN DATE(data) = CURDATE() THEN 1 END) AS hoje,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) AS pendentes
      FROM eventos
    `);
    
    const [clientes] = await pool.query('SELECT COUNT(*) AS total FROM clientes');
    
    res.json({
      eventosHoje: eventos[0].hoje,
      eventosPendentes: eventos[0].pendentes,
      clientesAtivos: clientes[0].total
    });
  } catch (err) {
    console.error('Erro no dashboard:', err);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

async function startServer() {
  await testConnection();
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠ Porta ${PORT} em uso, tentando ${PORT + 1}...`);
      startServer(PORT + 1);
    } else {
      console.error('❌ Erro no servidor:', err);
      process.exit(1);
    }
  });
}

startServer();