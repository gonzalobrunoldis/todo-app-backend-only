import { registerUser } from "./auth.js";

const form = document.getElementById("register-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { data, error } = await registerUser(email, password);

  if (error) {
    if (error.message.includes("User already registered")) {
      alert("Este email ya tiene una cuenta. Si alguna vez entraste con Google con este mail, probá el botón de Google en el login.");
    } else {
      alert("Error al registrarte: " + error.message);
    }
    return;
  }

  alert("Cuenta creada con éxito. Revisá tu email para confirmarla y luego iniciá sesión.");
  window.location.href = "../auth/login.html";
});
