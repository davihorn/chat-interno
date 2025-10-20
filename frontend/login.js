const usernameInput = document.getElementById('username');
const senhaInput = document.getElementById('senha');
const emailInput = document.getElementById('email');
const imagemInput = document.getElementById('imagem');
const previewImg = document.getElementById('previewImg');
const loginBtn = document.getElementById('loginBtn');

imagemInput.addEventListener('change', () => {
  const file = imagemInput.files[0];
  if (!file) {
    previewImg.src = 'frontend/img/default-avatar.png';
    return;
  }

  const reader = new FileReader();
  reader.onload = e => previewImg.src = e.target.result;
  reader.readAsDataURL(file);
});

loginBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const senha = senhaInput.value.trim();
  const email = emailInput.value.trim();
  const imagem = previewImg.src || 'frontend/img/default-avatar.png';

  if (!username || !senha || !email) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, senha, email, imagem })
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = 'index.html';
    } else {
      alert(data.erro || 'Erro ao registrar usuário.');
    }
  } catch (err) {
    console.error('Erro no cadastro/login:', err);
    alert('Erro de conexão com o servidor.');
  }
});
