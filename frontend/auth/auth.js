import { supabase } from "../shared/supabase.js";

// User registration
export async function registerUser(email, password) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

export async function loginWithEmail(email, password) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

// Maneja el click del botón "Login con Google"
export async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://127.0.0.1:5500/frontend/auth/login.html"
      }
    });
  
    if (error) {
      console.error("Error al iniciar sesión:", error);
    }
  }
  
  // Obtiene la sesión actual (si el usuario ya está logueado)
  export async function getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
  
    if (error) {
      console.error("Error obteniendo la sesión:", error);
      return null;
    }
  
    return data.session;
  }
  
  export async function getAccessToken() {
    const session = await getCurrentSession();
  
    if (!session) {
      return null;
    }
  
    return session.access_token;
  }



  export async function logout() {
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }
  