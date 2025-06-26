const repo = "SixtineRPG/hsr";
const filePath = "kanban/data/board.json";

async function main() {
  const token = window.KANBAN_TOKEN;

  const board = await loadBoard(token);
  renderBoard(board);

  document.getElementById("addCard").addEventListener("click", async () => {
    const text = prompt("Texte de la carte :");
    if (!text) return;
    board.todo.push({ text });
    renderBoard(board);
    await saveBoard(board, token);
  });
}

async function loadBoard(token) {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    headers: { Authorization: `token ${token}` },
  });
  if (!res.ok) throw new Error("Erreur chargement board.json");
  const json = await res.json();
  const content = atob(json.content);
  const data = JSON.parse(content);
  data._sha = json.sha;
  return data;
}

async function saveBoard(data, token) {
  const { _sha, ...saveData } = data;
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(saveData, null, 2))));
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Mise à jour du Kanban",
      content,
      sha: _sha,
    }),
  });
  if (res.ok) alert("Sauvegarde réussie !");
  else alert("Erreur de sauvegarde.");
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
