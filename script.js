const PASSWORD = "makanban";
let token;
const repo = "TON-PSEUDO-GITHUB/kanban"; // ← à adapter
const filePath = "data/board.json";

async function main() {
  // Sécurité : mot de passe
  const pw = prompt("Mot de passe ?");
  if (pw !== PASSWORD) {
    alert("Mot de passe incorrect");
    document.body.innerHTML = "";
    return;
  }

  token = prompt("Entre ton token GitHub perso :");

  const board = await loadBoard();
  renderBoard(board);

  document.getElementById("addCard").addEventListener("click", async () => {
    const text = prompt("Texte de la carte :");
    if (!text) return;

    board.todo.push({ text });
    renderBoard(board);
    await saveBoard(board);
  });
}

async function loadBoard() {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    headers: { Authorization: `token ${token}` },
  });
  const json = await res.json();
  const content = atob(json.content);
  const data = JSON.parse(content);
  data._sha = json.sha;
  return data;
}

async function saveBoard(data) {
  const { _sha, ...saveData } = data;
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(saveData, null, 2))));
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "mise à jour du kanban",
      content: content,
      sha: _sha,
    }),
  });

  if (res.ok) {
    alert("Board sauvegardé !");
  } else {
    alert("Erreur lors de la sauvegarde");
  }
}

function renderBoard(board) {
  ["todo", "doing", "done"].forEach((status) => {
    const column = document.querySelector(`.column[data-status="${status}"] .cards`);
    column.innerHTML = "";
    board[status].forEach((card) => {
      const div = document.createElement("div");
      div.className = "card";
      div.textContent = card.text;
      column.appendChild(div);
    });
  });
}

main();
