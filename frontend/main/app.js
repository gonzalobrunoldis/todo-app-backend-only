console.log("Frontend conectado.")

import { loginWithGoogle, getAccessToken, getCurrentSession, logout } from "../auth/auth.js";

async function protectPage() {
  const session = await getCurrentSession();

  if (!session) {
    window.location.href = "../auth/login.html";
  }
}

protectPage();


document.getElementById("logout-btn")
  .addEventListener("click", async () => {
    await logout();
    window.location.href = "../auth/login.html";
  });



const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const submitBtn = document.getElementById("submit-btn");

// Fetches the todos from the backend
export async function fetchTodos() {
    const token = await getAccessToken();

    const response = await fetch("http://localhost:8000/todos", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    renderTodos(data);
  }

function clearContainers() {
    const pendingContainer = document.getElementById("pending-todos");
    const completedContainer = document.getElementById("completed-todos");
  
    pendingContainer.innerHTML = "";
    completedContainer.innerHTML = "";
  }

function createCheckbox(todo) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
  
    checkbox.addEventListener("change", async () => {
      const token = await getAccessToken();
      await fetch(`http://localhost:8000/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        body: JSON.stringify({
          title: todo.title,
          done: checkbox.checked === true
        })
      });
  
      fetchTodos();
    });
  
    return checkbox;
  }
  
function createDeleteButton(todo) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.classList.add("delete-btn");
  
    deleteBtn.addEventListener("click", async () => {
      const token = await getAccessToken();
      await fetch(`http://localhost:8000/todos/${todo.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
      });
  
      fetchTodos();
    });
  
    return deleteBtn;
  }

function appendToCorrectContainer(todo, item) {
    const pendingContainer = document.getElementById("pending-todos");
    const completedContainer = document.getElementById("completed-todos");
  
    if (todo.done) {
      completedContainer.appendChild(item);
    } else {
      pendingContainer.appendChild(item);
    }
  }
  
  
  async function handleCreateTodo(event) {
    event.preventDefault();  // Evita que el formulario recargue la página
    const token = await getAccessToken();
  
    submitBtn.disabled = true;
    submitBtn.textContent = "Agregando...";
  
    const newTodo = {
      title: input.value,
      done: false,
    };
  
    await fetch("http://localhost:8000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
      body: JSON.stringify(newTodo),
    });
  
    input.value = "";
    await fetchTodos();
  
    submitBtn.disabled = false;
    submitBtn.textContent = "Agregar";
  }
  


  function renderTodos(todos) {
    clearContainers();
  
    todos.forEach((todo) => {
      // Card principal
      const item = document.createElement("div");
      item.classList.add("todo-item");
  
      // Checkbox
      const checkbox = createCheckbox(todo);
  
      // Título
      const titleSpan = document.createElement("span");
      titleSpan.textContent = todo.title;
      titleSpan.classList.add("todo-title");
  
      // Botón de eliminar
      const deleteBtn = createDeleteButton(todo);
  
      // Construir el card (COMPLETO antes de insertarlo)
      item.appendChild(checkbox);
      item.appendChild(titleSpan);
      item.appendChild(deleteBtn);
  
      // Agregar clases según si está completada
      if (todo.done) {
        item.classList.add("completed");
      }
  
      // SOLO AHORA lo insertamos en el contenedor correcto
      appendToCorrectContainer(todo, item);
    });
  }  
  
  
form.addEventListener("submit", handleCreateTodo);

fetchTodos();