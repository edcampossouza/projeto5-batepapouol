const periodoRecarregar = 2;
const periodoAvisoOnline = 5;

const URL_LOGIN = "https://mock-api.driven.com.br/api/v6/uol/participants";
const URL_MENSAGENS = "https://mock-api.driven.com.br/api/v6/uol/messages";

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
          : msg.type === "private_message"
          ? `<div class="message-box private">
          <span class="time">(${msg.time}) </span>
          <span class="username">${msg.from} </span>
          reservadamente fala para <span class="username">${msg.to} </span>
          ${msg.text}
          </div>`
          : `<div class="message-box">
          <span class="time">(${msg.time})</span>
          <span class="username">${msg.from} </span>
          fala para <span class="username">${msg.to} </span>
          ${msg.text}
          </div>`
      )
      .join("");
    const elementosMensagem = document.querySelectorAll(".message-box");
    elementosMensagem[elementosMensagem.length - 1].scrollIntoView();
  });
}

//pergunta nome e entra na sala
function login() {
  let nome = null;
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
  console.log("estou online!");
}

login();
