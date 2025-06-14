require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar Multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelo de Imagem
const imagemSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tipo: { type: String, required: true },
  preco: { type: Number, required: true },
  descricao: { type: String, required: true },
  imagemUrl: { type: String, required: true },
});
const Imagem = mongoose.model('Imagem', imagemSchema);

// Modelo de Usuário
const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Criar usuário admin (execute uma vez)
async function criarAdmin() {
  const username = 'admin';
  const password = await bcrypt.hash('admin123', 10);
  const usuarioExistente = await Usuario.findOne({ username });
  if (!usuarioExistente) {
    await Usuario.create({ username, password });
    console.log('Usuário admin criado com username: admin, senha: admin123');
  }
}
criarAdmin();

// Rotas
// Listar todas as imagens
app.get('/api/imagens', async (req, res) => {
  try {
    const imagens = await Imagem.find();
    res.json(imagens);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar imagens' });
  }
});

// Buscar uma imagem por ID
app.get('/api/imagens/:id', async (req, res) => {
  try {
    const imagem = await Imagem.findById(req.params.id);
    if (!imagem) return res.status(404).json({ error: 'Imagem não encontrada' });
    res.json(imagem);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar imagem' });
  }
});

// Criar nova imagem
app.post('/api/imagens', upload.single('imagem'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const { nome, tipo, preco, descricao } = req.body;
    const novaImagem = new Imagem({
      nome,
      tipo: tipo.toUpperCase(),
      preco: parseFloat(preco),
      descricao,
      imagemUrl: result.secure_url,
    });
    await novaImagem.save();
    res.status(201).json(novaImagem);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar imagem' });
  }
});

// Atualizar imagem
app.put('/api/imagens/:id', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, tipo, preco, descricao } = req.body;
    const updateData = { nome, tipo: tipo.toUpperCase(), preco: parseFloat(preco), descricao };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.imagemUrl = result.secure_url;
    }
    const imagem = await Imagem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!imagem) return res.status(404).json({ error: 'Imagem não encontrada' });
    res.json(imagem);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar imagem' });
  }
});

// Deletar imagem
app.delete('/api/imagens/:id', async (req, res) => {
  try {
    const imagem = await Imagem.findByIdAndDelete(req.params.id);
    if (!imagem) return res.status(404).json({ error: 'Imagem não encontrada' });
    res.json({ message: 'Imagem deletada' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const usuario = await Usuario.findOne({ username });
  if (!usuario || !await bcrypt.compare(password, usuario.password)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  res.json({ message: 'Login bem-sucedido' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));