// Configurações globais
const BASE_URL = 'http://localhost:3000';
let allClients = [];
let allEvents = [];

// Utilitários
const showMessage = (message, isError = false) => {
  const alert = document.createElement('div');
  alert.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
};

// Autenticação
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token && window.location.pathname.endsWith('index.html')) {
    window.location.href = 'dashboard.html';
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario: document.getElementById('usuario').value,
            senha: document.getElementById('senha').value
          })
        });
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          showMessage('Login realizado com sucesso!');
          setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
          showMessage(data.error || 'Credenciais inválidas', true);
        }
      } catch (error) {
        console.error('Login error:', error);
        showMessage('Erro ao conectar com o servidor', true);
      }
    });
  }

  // Carregar páginas específicas
  if (window.location.pathname.endsWith('dashboard.html')) loadDashboard();
  if (window.location.pathname.endsWith('clientes.html')) setupClientManagement();
  if (window.location.pathname.endsWith('eventos.html')) setupEventManagement();
});

// Dashboard
const loadDashboard = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'index.html';

    const [eventsRes, clientsRes] = await Promise.all([
      fetch(`${BASE_URL}/eventos`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${BASE_URL}/clientes`, { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    const eventos = await eventsRes.json();
    const clientes = await clientsRes.json();

    // Atualizar contagens
    document.getElementById('eventosHoje').textContent = 
      eventos.filter(e => new Date(e.data).toDateString() === new Date().toDateString()).length;
    
    document.getElementById('eventosPendentes').textContent = 
      eventos.filter(e => e.status === 'pendente').length;
    
    document.getElementById('clientesAtivos').textContent = clientes.length;

    // Preencher tabela
    const tbody = document.querySelector('#proximosEventos tbody');
    tbody.innerHTML = '';
    eventos.slice(0, 5).forEach(evento => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${evento.nome}</td>
        <td>${new Date(evento.data).toLocaleDateString('pt-BR')}</td>
        <td>${evento.local}</td>
        <td>${evento.cliente_nome || 'N/A'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    showMessage('Erro ao carregar dashboard', true);
  }
};

// Clientes
const setupClientManagement = async () => {
  await loadClients();
  setupClientForm();
};

const loadClients = async () => {
  try {
    const response = await fetch(`${BASE_URL}/clientes`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    allClients = await response.json();
    renderClients(allClients);
  } catch (error) {
    console.error('Error loading clients:', error);
    showMessage('Erro ao carregar clientes', true);
  }
};

const renderClients = (clients) => {
  const tbody = document.querySelector('#tabelaClientes tbody');
  tbody.innerHTML = '';
  clients.forEach(client => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${client.nome}</td>
      <td>${client.cpf || 'Não informado'}</td>
      <td>${client.telefone}</td>
      <td>${client.email || 'Não informado'}</td>
      <td class="actions">
        <button onclick="editClient('${client.id}')">Editar</button>
        <button onclick="deleteClient('${client.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};
