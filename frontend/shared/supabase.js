// Importa la librería de Supabase desde el CDN oficial
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Crea el cliente usando tu URL y tu clave pública
export const supabase = createClient(
  "https://rolzqxebsbuodrajseca.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbHpxeGVic2J1b2RyYWpzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTUwNjUsImV4cCI6MjA3OTQzMTA2NX0.haL0jKokLY9s9vYyJ3lycV-zMkvHOFeZbgK379i0Q-M"
);
