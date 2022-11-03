/* 
  CONSTANTES
*/
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

/**** FIM DAS CONSTANTES ****/

/********************************
  Funcoes chamadas repetidamente
*********************************/

// carrega as mensagens do servidor
function carregaMensagens() {
  axios.get(URL_MENSAGENS).then(function respostaChegou(response) {
    const chatArea = document.querySelector(".chat-area");
    const mensagens = response.data;
    chatArea.innerHTML = mensagens
      .map((msg) =>
        msg.type === "status"
          ? `<div class="message-box status" data-test="message" >
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

// avisa que o usuario esta online
function avisaStatusOnline() {
  axios.post(URL_STATUS, { name: nome });
}

/**** FIM DAS FUNCOES RECORRENTES ****/

/********************************
  Envio de mensagem
*********************************/

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
        window.location.reload();
      });
  }
}

function enviarHandler() {
  enviaMensagem(nome_destinatario, envio_reservado);
}

/**** FIM DO ENVIO DE MENSAGENS ****/

/********************************
  Funcoes do painel lateral
*********************************/
const linha_status = document.querySelector("#linha-status");

// mostra o painel lateral, colocando um checkmark nas opcoes selecionadas (destinatario e modo de envio)

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

//carrega a lista de contatos e preenche o painel lateral

function carregaContatos() {
  const lista_contatos = document.querySelector(".lista-contatos");
  axios
    .get(URL_PARTICIPANTES)
    .then(function (response) {
      const contatos = response.data;
      const todos = `<li data-test="all" onclick="setDestinatario(this, 'Todos')" class="${
        nome_destinatario === "Todos" ? "selecionado" : ""
      }"><span><ion-icon name='people'> </ion-icon><span class='nome'>Todos</span><ion-icon class="check" name="checkmark-circle"></ion-icon></li>`;
      lista_contatos.innerHTML =
        todos +
        contatos
          .map(
            (c) =>
              `<li data-test="participant" onclick="setDestinatario(this, '${
                c.name
              }')" class="${
                nome_destinatario === c.name ? "selecionado" : ""
              }"> 
                <span><ion-icon name='person-circle'> </ion-icon><span class='nome'>${
                  c.name
                }</span><ion-icon class="check" name="checkmark-circle" data-test="check"></ion-icon></span>
              </li>`
          )
          .join("");
    })
    .catch(function (erro) {
      alert("Erro ao carregar a lista de contatos");
    });
}

// muda o destinatario das mensagens
function setDestinatario(elemento, nome_dest) {
  nome_destinatario = nome_dest;
  const destinatarios = document.querySelectorAll(".lista-contatos li");
  destinatarios.forEach((li) => {
    li.classList.remove("selecionado");
  });
  elemento.classList.add("selecionado");
  linha_status.innerHTML = `Enviando para: ${nome_destinatario} (${
    envio_reservado ? "Reservadamente" : "Público"
  })`;
}

//  Funcoes para alterar o modo de envio entre Reservado e Aberto (Publico)

const li_publico = document.querySelector("#li-publico");
const li_reservado = document.querySelector("#li-reservado");

function setEnvioReservado() {
  envio_reservado = true;
  li_reservado.classList.add("selecionado");
  li_publico.classList.remove("selecionado");
  linha_status.innerHTML = `Enviando para: ${nome_destinatario} (Reservadamente)`;
}

function setEnvioAberto() {
  envio_reservado = false;
  li_reservado.classList.remove("selecionado");
  li_publico.classList.add("selecionado");
  linha_status.innerHTML = `Enviando para: ${nome_destinatario} (Público)`;
}

/**** FIM DAS FUNCOES DO PAINEL LATERAL ****/

/********************************
  Funcao que permite o envio de mensagens com a tecla Enter
*********************************/

const caixaMensagem = document.querySelector(".message-input input");
caixaMensagem.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    enviarHandler();
  }
});

/*************************************
  Inicio da execucao: realiza o login
*************************************/
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

login();
