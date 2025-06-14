const itensPorPagina = 4;
let paginaAtual = 1;
let tipoSelecionado = "TODOS";

const listaDeImagens = document.getElementById("lista-de-imagens");
const paginacao = document.getElementById("paginacao");
const imagemForm = document.getElementById("imagem-form");
const adminSection = document.getElementById("admin");
const loginModal = document.getElementById("login");
const loginForm = document.getElementById("login-form");
const loginToggle = document.getElementById("login-toggle");
const loginClose = document.getElementById("login-close");

// Função para buscar imagens do backend
async function buscarImagens() {
  try {
    const response = await axios.get('http://localhost:3000/api/imagens');
    return response.data;
  } catch (err) {
    console.error('Erro ao buscar imagens:', err);
    return [];
  }
}

// Filtrar imagens
function filtrarImagens(imagens) {
  return tipoSelecionado === "TODOS"
    ? imagens
    : imagens.filter(imagem => imagem.tipo === tipoSelecionado);
}

// Mostrar imagens na galeria
async function mostrarImagens() {
  const imagens = await buscarImagens();
  const imagensFiltradas = filtrarImagens(imagens);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  listaDeImagens.innerHTML = imagensFiltradas.slice(inicio, fim).map(imagem => `
    <div class="card">
      <img class="imagem" src="${imagem.imagemUrl}" alt="Desenho ${imagem.nome}" loading="lazy">
      <h2 class="name">${imagem.nome}</h2>
      <p>Estilo: ${imagem.tipo}</p>
      <p>Preço: R$${imagem.preco.toFixed(2)}</p>
      <p>${imagem.descricao}</p>
      <a href="https://wa.me/5511999999999?text=Quero%20saber%20mais%20sobre%20${encodeURIComponent(imagem.nome)}" target="_blank" class="contato-btn">Entrar em Contato</a>
    </div>
  `).join("");

  gerarPaginacao(imagensFiltradas.length);
}

// Gerar paginação
function gerarPaginacao(total) {
  const totalPaginas = Math.ceil(total / itensPorPagina);
  paginacao.innerHTML = "";
  for (let i = 1; i <= totalPaginas; i++) {
    const botao = document.createElement("button");
    botao.innerText = `Página ${i}`;
    botao.onclick = () => {
      paginaAtual = i;
      mostrarImagens();
    };
    paginacao.appendChild(botao);
  }
}

// Botões de filtro
document.querySelectorAll(".filtros button, .mobile-filtros button").forEach(btn => {
  btn.addEventListener("click", () => {
    tipoSelecionado = btn.getAttribute("data-tipo").toUpperCase();
    paginaAtual = 1;
    mostrarImagens();
    document.getElementById("menu-mobile").classList.remove("ativo");
  });
});

// Menu mobile
document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("menu-mobile").classList.add("ativo");
});
document.getElementById("menu-close").addEventListener("click", () => {
  document.getElementById("menu-mobile").classList.remove("ativo");
});

// Zoom overlay
const overlay = document.getElementById('zoomOverlay');
const zoomedImg = document.getElementById('zoomedImage');
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('imagem')) {
    zoomedImg.src = event.target.src;
    overlay.classList.add('active');
  }
});
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    overlay.classList.remove('active');
    zoomedImg.src = '';
  }
});

// Login modal
loginToggle.addEventListener('click', () => {
  loginModal.classList.add('active');
});
loginClose.addEventListener('click', () => {
  loginModal.classList.remove('active');
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    await axios.post('http://localhost:3000/api/login', { username, password });
    loginModal.classList.remove('active');
    adminSection.style.display = 'block';
    mostrarAdminLista();
  } catch (err) {
    alert('Credenciais inválidas');
  }
});

// Mostrar lista de imagens na administração
async function mostrarAdminLista() {
  const imagens = await buscarImagens();
  const adminLista = document.getElementById("admin-lista");
  adminLista.innerHTML = imagens.map(imagem => `
    <div class="card">
      <img src="${imagem.imagemUrl}" alt="Desenho ${imagem.nome}">
      <h2>${imagem.nome}</h2>
      <p>Estilo: ${imagem.tipo}</p>
      <p>Preço: R$${imagem.preco.toFixed(2)}</p>
      <p>${imagem.descricao}</p>
      <button onclick="editarImagem('${imagem._id}')">Editar</button>
      <button onclick="deletarImagem('${imagem._id}')">Deletar</button>
    </div>
  `).join("");
}

// Salvar/editar imagem
imagemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('imagem-id').value;
  const formData = new FormData();
  formData.append('nome', document.getElementById('nome').value);
  formData.append('tipo', document.getElementById('tipo').value);
  formData.append('preco', document.getElementById('preco').value);
  formData.append('descricao', document.getElementById('descricao').value);
  if (document.getElementById('imagem').files[0]) {
    formData.append('imagem', document.getElementById('imagem').files[0]);
  }

  try {
    if (id) {
      await axios.put(`http://localhost:3000/api/imagens/${id}`, formData);
    } else {
      await axios.post('http://localhost:3000/api/imagens', formData);
    }
    imagemForm.reset();
    document.getElementById('imagem-id').value = '';
    mostrarAdminLista();
    mostrarImagens();
  } catch (err) {
    console.error('Erro ao salvar imagem:', err);
    alert('Erro ao salvar imagem');
  }
});

// Editar imagem
window.editarImagem = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/imagens/${id}`);
    const imagem = response.data;
    document.getElementById('imagem-id').value = imagem._id;
    document.getElementById('nome').value = imagem.nome;
    document.getElementById('tipo').value = imagem.tipo;
    document.getElementById('preco').value = imagem.preco;
    document.getElementById('descricao').value = imagem.descricao;
    adminSection.style.display = 'block';
    loginModal.classList.remove('active');
  } catch (err) {
    console.error('Erro ao carregar imagem para edição:', err);
  }
};

// Deletar imagem
window.deletarImagem = async (id) => {
  if (confirm('Tem certeza que deseja deletar?')) {
    try {
      await axios.delete(`http://localhost:3000/api/imagens/${id}`);
      mostrarAdminLista();
      mostrarImagens();
    } catch (err) {
      console.error('Erro ao deletar imagem:', err);
      alert('Erro ao deletar imagem');
    }
  }
};

// Música de fundo
window.onload = function () {
  mostrarImagens();
  const musica = document.getElementById("musicaFundo");
  musica.volume = 0.6;
  setTimeout(() => {
    musica.play().catch(() => console.log("Autoplay bloqueado."));
  }, 500);
};