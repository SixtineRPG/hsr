(async () => {
  const CORRECT_HASH = "6s0OjZ9+F0qNoqJOq9QGqr9G9NoX/cbJihd4dXbY5b4=";
  // SHA-256 base64 du mot de passe choisi : ex. "SixtineSuperSecure"

  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = form.password.value;
    const token = form.token.value;

    // Vérifier hash mot de passe
    const pwHash = await sha256(pw);
    if (pwHash !== CORRECT_HASH) {
      alert("Mot de passe incorrect");
      return;
    }

    // Chiffrer et stocker token
    const encryptedToken = await encrypt(token, pw);
    localStorage.setItem("kanban_token", encryptedToken);
    localStorage.setItem("kanban_authenticated", "true");

    // Stocker hash mot de passe dans sessionStorage pour déchiffrage en session
    sessionStorage.setItem("kanban_pw", pw);

    // Redirection vers le tableau
    window.location.href = "kanban.html";
  });
})();
