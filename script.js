const periodoRecarregar = 2;
const periodoAvisoOnline = 5;

const URL_MENSAGENS = "https://mock-api.driven.com.br/api/v6/uol/messages";

//carregar mensagens
function carregaMensagens() {
  axios.get(URL_MENSAGENS).then(function respostaChegou(response) {
    const mensagens = response.data;
    const chatArea = document.querySelector(".chat-area");
    chatArea.innerHTML = mensagens
      .map((msg) =>
        msg.type === "status"
          ? `<div class="message-box status">
        <span class="time">(${msg.time})</span>
        <span class="username">${msg.from} </span>${msg.text}
        </div>
        `
          : msg.type === "private_message"
          ? `<div class="message-box">
          <span class="time">(${msg.time})</span>
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
  });
}

//avisa ao servidor que o usuario esta online
function avisaStatusOnline() {
  console.log("estou online!");
}

setInterval(carregaMensagens, 1000 * periodoRecarregar);
setInterval(avisaStatusOnline, 1000 * periodoAvisoOnline);
