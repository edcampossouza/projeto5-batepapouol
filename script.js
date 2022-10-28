const periodoRecarregar = 2;
const periodoAvisoOnline = 4.5;

const URL_LOGIN = "https://mock-api.driven.com.br/api/v6/uol/participants";
const URL_MENSAGENS = "https://mock-api.driven.com.br/api/v6/uol/messages";
const URL_STATUS = "https://mock-api.driven.com.br/api/v6/uol/status";
const URL_PARTICIPANTES =
  "https://mock-api.driven.com.br/api/v6/uol/participants";
let nome = null;
let nome_destinatario = "Todos";
let envio_reservado = false;

const li_publico = document.querySelector("#li-publico");
const li_reservado = document.querySelector("#li-reservado");

//carregar mensagens
function carregaMensagens() {
  axios.get(URL_MENSAGENS).then(function respostaChegou(response) {
    const chatArea = document.querySelector(".chat-area");
    const mensagens = response.data;
    chatArea.innerHTML = mensagens
      .map((msg) =>
        msg.type === "status"
          ? `<div class="message-box status">
        <span class="time">(${msg.time})</span>
        <span class="username">${msg.from} </span>${msg.text}
        </div>
        `
          : msg.type === "private_message" &&
            (msg.to === "Todos" || msg.to === nome || msg.from === nome)
          ? `<div class="message-box private">
          <span class="time">(${msg.time}) </span>
          <span class="username">${msg.from} </span>
          reservadamente fala para <span class="username">${msg.to} </span>
          ${msg.text}
          </div>`
          : msg.type === "message"
          ? `<div class="message-box">
          <span class="time">(${msg.time})</span>
          <span class="username">${msg.from} </span>
          fala para <span class="username">${msg.to} </span>
          ${msg.text}
          </div>`
          : ""
      )
      .join("");
    const elementosMensagem = document.querySelectorAll(".message-box");
    elementosMensagem[elementosMensagem.length - 1].scrollIntoView();
  });
}

//pergunta nome e entra na sala
function login() {
  nome = prompt("Digite seu nome...");
  //login
  axios
    .post(URL_LOGIN, { name: nome })
    .then(function response(resposta) {
      setInterval(avisaStatusOnline, 1000 * periodoAvisoOnline);
      setInterval(carregaMensagens, 1000 * periodoRecarregar);
      return;
    })
    .catch(function (erro) {
      alert("Nome indisponível");
      login();
    });
}
//avisa ao servidor que o usuario esta online
function avisaStatusOnline() {
  axios.post(URL_STATUS, { name: nome });
}

function enviaMensagemTodos() {
  enviaMensagem("Todos", false);
}

function enviaMensagem(participante, privada) {
  //pega mensagem no input
  const caixaMensagem = document.querySelector(".message-input input");
  const mensagem = caixaMensagem.value;
  if (mensagem && mensagem.length > 0) {
    const objetoMsg = {
      from: nome,
      to: participante,
      text: mensagem,
      type: privada ? "private_message" : "message",
    };
    axios
      .post(URL_MENSAGENS, objetoMsg)
      .then(function () {
        caixaMensagem.value = "";
        carregaMensagens();
      })
      .catch(function (err) {
        alert("Erro ao enviar a mensagem. Tente novamente mais tarde");
      });
  }
}

function mostraPainel() {
  const painel = document.querySelector(".painel-direita");
  const transparencia = document.querySelector(".transparencia");
  painel.classList.remove("escondido");
  transparencia.classList.remove("escondido");
  if (envio_reservado) {
    const res = document.querySelector("#li-reservado");
    res.classList.add("selecionado");
  } else {
    const res = document.querySelector("#li-publico");
    res.classList.add("selecionado");
  }
  carregaContatos();
}
function escondePainel() {
  const painel = document.querySelector(".painel-direita");
  const transparencia = document.querySelector(".transparencia");
  painel.classList.add("escondido");
  transparencia.classList.add("escondido");
}

function carregaContatos() {
  const lista_contatos = document.querySelector(".lista-contatos");
  axios
    .get(URL_PARTICIPANTES)
    .then(function (response) {
      const contatos = response.data;
      const todos = `<li onclick="setDestinatario(this, 'Todos')" class="${
        nome_destinatario === "Todos" ? "selecionado" : ""
      }"><span><ion-icon name='people'> </ion-icon>Todos</li></span>`;
      lista_contatos.innerHTML =
        todos +
        contatos
          .map(
            (c) =>
              `<li onclick="setDestinatario(this, '${c.name}')" class="${
                nome_destinatario === c.name ? "selecionado" : ""
              }"> 
                <span><ion-icon name='person-circle'> </ion-icon>${
                  c.name
                }</span>
              </li>`
          )
          .join("");
    })
    .catch(function (erro) {
      alert("Erro ao carregar a lista de contatos");
    });
}

function enviarHandler() {
  enviaMensagem(nome_destinatario, envio_reservado);
}

function setDestinatario(elemento, nome_dest) {
  nome_destinatario = nome_dest;
  const destinatarios = document.querySelectorAll(".lista-contatos li");
  destinatarios.forEach((li) => {
    li.classList.remove("selecionado");
  });
  elemento.classList.add("selecionado");
}

function setEnvioReservado() {
  envio_reservado = true;
  li_reservado.classList.add("selecionado");
  li_publico.classList.remove("selecionado");
}

function setEnvioAberto() {
  envio_reservado = false;
  li_reservado.classList.remove("selecionado");
  li_publico.classList.add("selecionado");
}

const caixaMensagem = document.querySelector(".message-input input");
caixaMensagem.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    enviarHandler();
  }
});

login();
