const abrirChatBtn = document.getElementById('abrirChatBtn');
const destinatarioInput = document.getElementById('destinatarioInput');
const mensagensContainer = document.getElementById('chatMensagens');
const mensagemInput = document.getElementById('mensagemInput');
const enviarBtn = document.getElementById('enviarBtn');
const chatHeader = document.getElementById('chatHeader');

let usuarioAtual = localStorage.getItem('username');
let imagemAtual = localStorage.getItem('imagem') || 'frontend/img/default-avatar.png';
let socket;
let usuarioDestino = null;

  const urlApi = 'http://192.168.1.75:3000';
  
  socket = io(urlApi);

  socket.emit('user_connected', { nome: usuarioAtual, imagem: imagemAtual });

  socket.removeAllListeners('novaMensagem');

  socket.on('novaMensagem', (msg) => {
    if (msg.para === usuarioAtual || msg.de === usuarioAtual) {
      exibirMensagem(msg);
    }
  });


abrirChatBtn.addEventListener('click', async () => {
  const nomeDestino = destinatarioInput.value.trim();
  if (!nomeDestino) {
    alert('Digite o nome de um usuário.');
    return;
  }

  try {
    const res = await fetch(urlApi+`/usuarios/${nomeDestino}`);
    if (!res.ok) {
      alert('Usuário não encontrado.');
      return;
    }

    const user = await res.json();
    usuarioDestino = user.username;

    abrirJanelaDeChat(user.username);
    destinatarioInput.value = '';
  } catch (err) {
    console.error('Erro ao abrir chat:', err);
    alert('Erro de conexão com o servidor.');
  }
});

enviarBtn.addEventListener('click', () => {
  const texto = mensagemInput.value.trim();
  if (!texto || !usuarioDestino) return;

  const msg = {
    de: usuarioAtual,
    para: usuarioDestino,
    texto,
    time: new Date().toLocaleTimeString(),
    imagem: imagemAtual,
  };

  console.log('💬 Enviando mensagem:', msg);

  socket.emit('enviarMensagem', msg);
  exibirMensagem(msg);
  mensagemInput.value = '';
});

function exibirMensagem(msg) {
  const div = document.createElement('div');
  div.classList.add('msg');

  const souEu = msg.de === usuarioAtual;
  div.classList.add(souEu ? 'enviada' : 'recebida');

  const imagem = msg.imagem || 'frontend/img/default-avatar.png';
  const nome = msg.de || 'Desconhecido';

  div.innerHTML = `
    <img src="${imagem}" alt="${nome}" class="avatar">
    <div class="msg-content">
      
      <span>${msg.texto}</span>
      <small>${msg.time}</small>
    </div>
  `;

  mensagensContainer.appendChild(div);
  mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
}

function abrirJanelaDeChat(username) {
  chatHeader.textContent = `💬 Conversando com ${username}`;
  mensagensContainer.innerHTML = '';
}
