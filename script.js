const repo = "SixtineRPG/hsr";
const filePath = "data/board.json";

let fileSha = null;
let token = null;  // à récupérer via auth.js (ex : sessionStorage ou global)

async function fetchBoard() {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    headers: { Authorization: `token ${token}` }
  });
  if (!res.ok) throw new Error("Erreur chargement JSON");
  const data = await res.json();
  fileSha = data.sha;
  const content = atob(data.content);
  return JSON.parse(content);
}

function createCardElement(card) {
  const cardEl = document.createElement("div");
  cardEl.className = "card";
  cardEl.setAttribute("data-id", card.id);
  cardEl.contentEditable = "true";
  cardEl.textContent = card.content;

  // Sauvegarde à la sortie de focus (blur)
  cardEl.addEventListener("blur", async () => {
    await updateCardContent(card.id, cardEl.textContent);
  });

  return cardEl;
}

function createColumnElement(column) {
  const colEl = document.createElement("div");
  colEl.className = "column";

  const titleEl = document.createElement("h2");
  titleEl.contentEditable = "true";
  titleEl.textContent = column.title;

  titleEl.addEventListener("blur", async () => {
    await updateColumnTitle(column.id, titleEl.textContent);
  });

  colEl.appendChild(titleEl);

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "cards-container";

  column.cards.forEach(card => {
    cardsContainer.appendChild(createCardElement(card));
  });

  colEl.appendChild(cardsContainer);

  return colEl;
}

let boardData = null;

async function renderBoard() {
  boardData = await fetchBoard();
  const boardContainer = document.getElementById("board");
  boardContainer.innerHTML = "";
  boardData.columns.forEach(col => {
    boardContainer.appendChild(createColumnElement(col));
  });
}

async function updateCardContent(cardId, newContent) {
  const col = boardData.columns.find(c =>
    c.cards.some(card => card.id === cardId)
  );
  if (!col) return;

  const card = col.cards.find(c => c.id === cardId);
  if (!card) return;

  card.content = newContent;
  await saveBoard();
}

async function updateColumnTitle(colId, newTitle) {
  const col = boardData.columns.find(c => c.id === colId);
  if (!col) return;

  col.title = newTitle;
  await saveBoard();
}

async function saveBoard() {
  const contentStr = JSON.stringify(boardData, null, 2);
  const contentEncoded = btoa(unescape(encodeURIComponent(contentStr)));

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Mise à jour Kanban depuis la page",
      content: contentEncoded,
      sha: fileSha
    })
  });

  if (!res.ok) {
    alert("Erreur sauvegarde");
  } else {
    const data = await res.json();
    fileSha = data.content.sha;
  }
}

// Chargement et affichage au démarrage
window.addEventListener("DOMContentLoaded", async () => {
  // Récupérer token déchiffré, par exemple depuis sessionStorage
  token = sessionStorage.getItem("kanban_token_decrypted");
  if (!token) {
    alert("Erreur : token manquant, reconnecte-toi");
    return;
  }
  await renderBoard();
});
