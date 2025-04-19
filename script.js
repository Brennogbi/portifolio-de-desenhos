const imagems = [
  { name: "Margot robbie arlequina", tipo: "REALISMO", src: "img/alerquina.jpg" },
  { name: "Tim Maia", tipo: "REALISMO", src: "img/timai lapis.jpg" },
  { name: "Sabotage", tipo: "REALISMO", src: "img/sabotageb lappis.jpg" },
  { name: "Chorão", tipo: "REALISMO", src: "img/chorao.jpg" },
  { name: "QUADRO DE CACHAÇA", tipo: "REALISMO", src: "img/cachasa lapis.jpg" },
  { name: "CARAMELO", tipo: "REALISMO", src: "img/cachorro lapis.jpg" },
  { name: "joaquin phoenix CORINGA", tipo: "REALISMO", src: "img/coringa 2.jpg" },
 
  { name: "Daenerys Targaryen", tipo: "REALISMO", src: "img/Daenerys Targaryen.jpg" },
  { name: "CORINGA", tipo: "REALISMO", src: "img/coringa.jpg" },
  { name: "Justiceiro", tipo: "REALISMO", src: "img/justiceiro.jpg" },
  { name: "kurt cobain ", tipo: "REALISMO", src: "img/kurt cobain.jpg" },
  { name: "Lázaro Ramos ", tipo: "REALISMO", src: "img/lazaro ramos.jpg" },
  { name: "Mano Brown ", tipo: "REALISMO", src: "img/manobrow digital.jpg" },
  { name: "Melancia ", tipo: "REALISMO", src: "img/melancia lapis.jpg" },


  { name: "BANANAS", tipo: "REALISMO", src: "img/banana.jpg" },
  { name: "Hajime no Ippo", tipo: "DIGITAL", src: "img/box digital.jpg" },
  { name: "Decoração Bulma", tipo: "ANIME", src: "img/bulma.jpg" },
  { name: "MARCA TEXTO", tipo: "DIGITAL", src: "img/ana digital.jpg" },


  { name: "Deadpool & Wolverine", tipo: "DIGITAL", src: "img/deadpooo digital.jpg" },
  { name: "JIRAIYA E NARUTO", tipo: "DIGITAL", src: "img/digital.jpg" },
  { name: "Fullmetal Alchemist", tipo: "DIGITAL", src: "img/fumetal digita 2.jpg" },
  { name: "Fullmetal Alchemist", tipo: "DIGITAL", src: "img/fumetal digital.jpg" },

  { name: "kuabara ", tipo: "ANIME", src: "img/kuabara lapis.jpg" },


  { name: "Menino maluquinho ", tipo: "DIGITAL", src: "img/menino maluquinho digital.jpg" },
  { name: "NARUTO ", tipo: "ANIME", src: "img/naruto lapis.jpg" },
  { name: "Roronoa Zoro ", tipo: "ANIME", src: "img/one peas lapis.jpg" },
  { name: "POKEMON ", tipo: "DIGITAL", src: "img/pokemon.jpg" },
  { name: "Yusuke Urameshi ", tipo: "ANIME", src: "img/uramechi lapis.jpg" },



];

const itensPorPagina = 4;
let paginaAtual = 1;
let tipoSelecionado = "TODOS";

const listadeimagens = document.getElementById("lista-de-imagens");
const paginacao = document.getElementById("paginacao");

function filtrarImagens() {
  return tipoSelecionado === "TODOS"
    ? imagems
    : imagems.filter(imagem => imagem.tipo.toUpperCase() === tipoSelecionado);
}

function mostrarimagens() {
  const imagensFiltradas = filtrarImagens();
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  listadeimagens.innerHTML = imagensFiltradas.slice(inicio, fim).map(imagem => {
    return `
        <div class="card">
          <img class="imagem" src="${imagem.src}" alt="${imagem.name}">
          <h2 class="name">${imagem.name}</h2>
          <p>Estilo: ${imagem.tipo}</p>
        </div>
      `;
  }).join("");

  gerarPaginacao(imagensFiltradas.length);
}

function gerarPaginacao(total) {
  const totalPaginas = Math.ceil(total / itensPorPagina);
  paginacao.innerHTML = "";

  for (let i = 1; i <= totalPaginas; i++) {
    const botao = document.createElement("button");
    botao.innerText = `Página ${i}`;
    botao.onclick = () => {
      paginaAtual = i;
      mostrarimagens();
    };
    paginacao.appendChild(botao);
  }
}

// Botões de filtro
document.querySelectorAll(".filtros button").forEach(btn => {
  btn.addEventListener("click", () => {
    const tipo = btn.getAttribute("data-tipo");
    tipoSelecionado = tipo.toUpperCase();
    paginaAtual = 1;
    mostrarimagens();
  });
});

// Mostrar ao carregar
window.onload = mostrarimagens;
window.onload = function () {
  mostrarimagens();

  // Tocar música de fundo com volume baixo
  const musica = document.getElementById("musicaFundo");
  musica.volume = 0.6; // Volume bem baixinho (vai de 0 a 1)

  // Tentar iniciar após um leve atraso (evita bloqueios)
  setTimeout(() => {
    musica.play().catch(() => {
      console.log("Autoplay bloqueado até o usuário interagir.");
    });
  }, 500);
};

// === MENU MOBILE ===
const menuBtn = document.getElementById("menu-toggle");
const menuMobile = document.getElementById("menu-mobile");
const menuClose = document.getElementById("menu-close");

menuBtn.addEventListener("click", () => {
  menuMobile.classList.add("ativo");
});

menuClose.addEventListener("click", () => {
  menuMobile.classList.remove("ativo");
});

document.querySelectorAll(".menu-mobile button").forEach(btn => {
  btn.addEventListener("click", () => {
    const tipo = btn.getAttribute("data-tipo");
    tipoSelecionado = tipo.toUpperCase();
    paginaAtual = 1;
    mostrarimagens();
    menuMobile.classList.remove("ativo");
  });
});

// === ZOOM COM OVERLAY ===
const overlay = document.getElementById('zoomOverlay');
const zoomedImg = document.getElementById('zoomedImage');

document.addEventListener('mouseover', function (event) {
  if (event.target.classList.contains('imagem')) {
    zoomedImg.src = event.target.src;
    overlay.classList.add('active');
  }
});

overlay.addEventListener('mouseleave', () => {
  overlay.classList.remove('active');
  zoomedImg.src = '';
});
