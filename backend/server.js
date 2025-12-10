const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "data.json");

// --- Funções auxiliares ---
function lerUsuarios() {
  if (!fs.existsSync(dataPath)) return { usuarios: [] };
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

function salvarUsuarios(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// --- Rotas ---
app.get("/", (req, res) => {
  res.send("💬 Chat interno rodando...");
});

// Cadastro de usuário
app.post("/usuarios", (req, res) => {
  const { username, senha, email, imagem } = req.body;

  if (!username || !senha || !email) {
    return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
  }

  const data = lerUsuarios();
  const existe = data.usuarios.find(
    (u) => u.username === username || u.email === email
  );

  if (existe) {
    return res.status(400).json({ erro: "Usuário ou email já cadastrado." });
  }

  const novoUsuario = { username, senha, email, imagem };
  data.usuarios.push(novoUsuario);
  salvarUsuarios(data);

  console.log(`✅ Novo usuário cadastrado: ${username}`);
  return res.status(201).json(novoUsuario);
});

// Buscar usuário pelo username
app.get("/usuarios/:username", (req, res) => {
  const { username } = req.params;
  const data = lerUsuarios();
  const usuario = data.usuarios.find((u) => u.username === username);

  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado." });
  }

  return res.json(usuario);
});

// --- Socket.io ---
let connectedUsers = new Map();

// Função para pegar IP real do usuário
function getClientIP(socket) {
  const forwarded = socket.handshake.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0] : socket.handshake.address;
  return ip.replace(/^.*:/, "");
}

io.on("connection", (socket) => {
  const ip = getClientIP(socket);
  console.log(`🟢 Nova conexão: ${socket.id} (${ip})`);

  // Usuário conectado
  socket.on("user_connected", (userData) => {
    connectedUsers.set(socket.id, { ...userData, ip });
    console.log(`👤 Usuário conectado:`, userData);
    io.emit("users_online", Array.from(connectedUsers.values()));
  });

  // Enviar mensagem privada
  socket.on("enviarMensagem", (msg) => {
    console.log("📩 Nova mensagem recebida:", msg);

    const mensagemCompleta = {
      de: msg.de || "Desconhecido",
      para: msg.para || null,
      texto: msg.texto || "",
      time: msg.time || new Date().toLocaleTimeString(),
      imagem: msg.imagem || "frontend/img/default-avatar.png",
    };

    io.emit("novaMensagem", mensagemCompleta);
  });

  // Desconexão
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    console.log(`🔴 Desconectado: ${user?.nome || "desconhecido"}`);
    connectedUsers.delete(socket.id);
    io.emit("users_online", Array.from(connectedUsers.values()));
  });
});

// --- Inicia o servidor ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://192.168.1.75:3554`);
});
