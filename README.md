Trabalho-Final-BD2
Nomes - Marcos Cabral, Jhonatan Rotta Santana, Henrique Cavalcante Rodrigues
Agência de Eventos - Sistema de Gestão
Este é um sistema de gestão de eventos e clientes para uma agência de eventos. Ele permite o cadastro, gerenciamento e exibição de eventos e clientes. Além disso, oferece uma visão geral do status dos eventos e clientes ativos.

Funcionalidades
Login de usuário: Tela de login para autenticação e acesso ao sistema.
Cadastro de Eventos: Cadastro de eventos, incluindo dados como nome, data, cliente, local e tipo de evento.
Gerenciamento de Clientes: Cadastro, edição e exclusão de clientes. Exibe uma lista com todos os clientes cadastrados.
Dashboard: Exibe uma visão geral com contagens de eventos do dia, eventos pendentes e clientes ativos. Além disso, exibe uma lista dos próximos eventos.
Tecnologias Utilizadas
Frontend:

HTML: Estrutura das páginas.
CSS: Estilização do layout e componentes.
JavaScript: Lógica para interação com o backend e manipulação da interface.
Backend:

Node.js: Servidor backend para gerenciar a API de eventos e clientes.
Fastify: Framework para construção de APIs rápidas e eficientes.
Prisma: ORM para facilitar a interação com o banco de dados.
MySQL: Banco de dados NoSQL utilizado para armazenar os dados de eventos e clientes.
Instalação e Execução
Para Clonar o Repositório
git clone https://github.com/seu-usuario/agencia-de-eventos.git
Entre na pasta de "frontend" e também no "backend", abra o terminal e digite o comando para instalar todas as dependências:
npm install
Baixe o MySQL e crie um banco de dados para o projeto. Faça isso acessando o MySQL via terminal ou utilizando um cliente como o MySQL Workbench.
CREATE DATABASE agencia_eventos;
Configure a URL de conexão com o MySQL. Altere os valores da DATABASE_URL de acordo com suas credenciais de acesso, exemplo:
DATABASE_URL="mysql://usuario:senha@localhost:3000/agencia_eventos"
Após o servidor estar rodando, acesse o frontend pelo navegador:
http://localhost:3000 
Licença
Este projeto está licenciado sob a MIT License
