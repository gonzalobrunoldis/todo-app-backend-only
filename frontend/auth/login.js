import { loginWithGoogle, getCurrentSession, loginWithEmail } from "./auth.js";

console.log("Current URL:", window.location.href);


// Si el usuario ya está logueado, lo mandamos a la app
async function checkIfLoggedIn() {
  const session = await getCurrentSession();

  if (session) {
    window.location.href = "../main/index.html";
  }
}

document.getElementById("login-btn")
  .addEventListener("click", loginWithGoogle);

  checkIfLoggedIn();

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await loginWithEmail(email, password);

  if (error) {
    alert("No pudimos iniciar sesión. Verificá tu email y contraseña. \n\n" +
        "Si alguna vez usaste Google con este email, probá el botón de Google.");
    return;
  }
  
  window.location.href =  "../main/index.html";
  
});