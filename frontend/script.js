const abrirChatBtn = document.getElementById('abrirChatBtn');
const destinatarioInput = document.getElementById('destinatarioInput');
const chatContainer = document.getElementById('chatContainer');
const mensagensContainer = document.getElementById('chatMensagens');
const mensagemInput = document.getElementById('mensagemInput');
const enviarBtn = document.getElementById('enviarBtn');
const chatHeader = document.getElementById('chatHeader');

let usuarioAtual = localStorage.getItem('username');
let socket;
let usuarioDestino = null;

// --- Inicialização ---
// window.addEventListener('DOMContentLoaded', () => {
//   if (!usuarioAtual) {
//     window.location.href = 'login.html';
//     return;
//   }

  socket = io('http://localhost:3000');

  socket.emit('user_connected', { nome: usuarioAtual });
  socket.on('chat_message', exibirMensagem);
  socket.on('novaMensagem', exibirMensagem);

  
// });

// --- Abrir Chat ---
abrirChatBtn.addEventListener('click', async () => {
  const nomeDestino = destinatarioInput.value.trim();
  if (!nomeDestino) {
    alert('Digite o nome de um usuário.');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/usuarios/${nomeDestino}`);
    if (!res.ok) {
      alert('Usuário não encontrado.');
      return;
    }

    const user = await res.json();
    usuarioDestino = user.username;

    abrirJanelaDeChat(user.username);
    destinatarioInput.value = ''; // limpa o campo após abrir
  } catch (err) {
    console.error('Erro ao abrir chat:', err);
    alert('Erro de conexão com o servidor.');
  }
});

// --- Enviar Mensagem ---
enviarBtn.addEventListener('click', () => {
  const texto = mensagemInput.value.trim();
  if (!texto || !usuarioDestino) return;

  const msg = {
    de: usuarioAtual,
    para: usuarioDestino,
    texto,
    time: new Date().toLocaleTimeString(),
  };



console.log("mensagens", {obj: msg})

  socket.emit('enviarMensagem', msg);
  exibirMensagem(msg); // mostra localmente
  mensagemInput.value = '';
});

// --- Exibir Mensagens ---
function exibirMensagem(msg) {
  const div = document.createElement('div');
  div.classList.add('mensagem');

  if (msg.de === usuarioAtual) div.classList.add('minha');
  else div.classList.add('deles');

  div.innerHTML = `
    <strong>${msg.de}</strong>:
    <span>${msg.texto}</span>
    <small>${msg.time}</small>
  `;
  mensagensContainer.appendChild(div);
  mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
}

// --- Abrir Janela de Chat ---
function abrirJanelaDeChat(username) {
  chatHeader.textContent = `💬 Conversando com ${username}`;
  mensagensContainer.innerHTML = ''; // limpa mensagens antigas
}