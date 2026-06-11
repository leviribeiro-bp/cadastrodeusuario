import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase Client Lazily and Safely
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseKey !== "your-supabase-key"
);

let supabaseClient: any = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.log("Supabase keys are missing. Running with local persistent SQLite/JSON database file.");
}

// Local JSON Database configuration
const DB_FILE = path.join(process.cwd(), "database.json");

// Default initial database content
const defaultUsers = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@example.com",
    phone: "(11) 98765-4321",
    role: "admin",
    status: "ativo",
    birth_date: "1994-05-15",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    name: "Bruno Souza",
    email: "bruno.souza@example.com",
    phone: "(21) 99888-7766",
    role: "membro",
    status: "ativo",
    birth_date: "1988-11-23",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "3",
    name: "Carlos Eduardo",
    email: "carlos.edu@example.com",
    phone: "(31) 97777-6655",
    role: "editor",
    status: "inativo",
    birth_date: "1991-02-08",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "4",
    name: "Daniela Santos",
    email: "daniela.s@example.com",
    phone: "(41) 96666-5544",
    role: "membro",
    status: "ativo",
    birth_date: "1995-09-30",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to read users from persistent local database
const getStoredUsers = (): any[] => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
      return defaultUsers;
    }
    const rawData = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(rawData);
  } catch (err) {
    console.error("Erro lendo arquivo de banco de dados, utilizando fallback:", err);
    return defaultUsers;
  }
};

// Helper to save users to persistent local database
const saveUsersToDisk = (usersList: any[]) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(usersList, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro salvando arquivo de banco de dados no disco:", err);
  }
};

// Helper to generate IDs for local users
const generateId = () => Math.random().toString(36).substr(2, 9);

// API: Check Connections and Configuration Status
app.get("/api/supabase-status", async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.json({
      configured: false,
      mode: "demo",
      message: "Banco de dados LOCAL PERSISTENTE ativo com sucesso! Seus dados estão salvos localmente em database.json no servidor.",
      sql: `create table public.users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  phone text,
  role text not null default 'membro',
  status text not null default 'ativo',
  birth_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`
    });
  }

  try {
    // Ping/test query to see if table exists
    const { error } = await supabaseClient.from("users").select("id").limit(1);
    
    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
        return res.json({
          configured: true,
          mode: "table_missing",
          message: "O cliente Supabase está configurado, mas a tabela 'users' não existe no seu banco de dados. Execute a instrução SQL abaixo para criá-la.",
          sql: `create table public.users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  phone text,
  role text not null default 'membro',
  status text not null default 'ativo',
  birth_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`
        });
      }
      throw error;
    }

    return res.json({
      configured: true,
      mode: "production",
      message: "Conexão com o Supabase estabelecida com sucesso e tabela pronta!"
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      mode: "error",
      message: `Erro ao conectar com o Supabase: ${err.message || err}`
    });
  }
});

// API: Get App Environment Variables (without exposing actual sensitive secret values)
app.get("/api/env-info", (req, res) => {
  res.json({
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : null,
    hasKey: !!supabaseKey,
    isConfigured: isSupabaseConfigured
  });
});

// API: GET All Users
app.get("/api/users", async (req, res) => {
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (err: any) {
      console.error("Supabase GET users error, falling back to local persistent DB:", err.message);
      // Fallback if table doesn't exist yet
      const list = getStoredUsers();
      const sorted = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return res.json(sorted);
    }
  } else {
    const list = getStoredUsers();
    // Sort local users by created_at descending
    const sorted = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.json(sorted);
  }
});

// API: GET Single User
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Usuário não encontrado." });
      return res.json(data);
    } catch (err: any) {
      console.error("Supabase GET single user error:", err.message);
    }
  }

  // Fallback / Disk local database
  const list = getStoredUsers();
  const user = list.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }
  return res.json(user);
});

// API: CREATE User
app.post("/api/users", async (req, res) => {
  const { name, email, phone, role, status, birth_date } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Nome e Email são campos obrigatórios." });
  }

  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured && supabaseClient) {
    try {
      // First, check if email exists to return a friendly message
      const { data: existing } = await supabaseClient
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: "Já existe um usuário cadastrado com este e-mail." });
      }

      const { data, error } = await supabaseClient
        .from("users")
        .insert([
          {
            name,
            email,
            phone: phone || null,
            role: role || "membro",
            status: status || "ativo",
            birth_date: birth_date || null
          }
        ])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (err: any) {
      console.error("Supabase Insert User error, falling back to local storage:", err.message);
    }
  }

  // Fallback / disk persistence
  const list = getStoredUsers();
  const emailExists = list.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return res.status(400).json({ error: "Já existe um usuário cadastrado com este e-mail." });
  }

  const newUser = {
    id: generateId(),
    name,
    email,
    phone: phone || "",
    role: role || "membro",
    status: status || "ativo",
    birth_date: birth_date || "",
    created_at: timestamp
  };

  list.push(newUser);
  saveUsersToDisk(list);
  return res.status(201).json(newUser);
});

// API: UPDATE User
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, status, birth_date } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Nome e Email são obrigatórios." });
  }

  if (isSupabaseConfigured && supabaseClient) {
    try {
      // Check if email is taken by another user
      const { data: existing } = await supabaseClient
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: "Este e-mail já está sendo usado por outro usuário." });
      }

      const { data, error } = await supabaseClient
        .from("users")
        .update({
          name,
          email,
          phone: phone || null,
          role: role || "membro",
          status: status || "ativo",
          birth_date: birth_date || null
        })
        .eq("id", id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado para atualizar." });
      }
      return res.json(data[0]);
    } catch (err: any) {
      console.error("Supabase Update User error, falling back to local store:", err.message);
    }
  }

  // Fallback / disk persistence
  const list = getStoredUsers();
  const userIndex = list.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  const emailExists = list.some(
    (u) => u.id !== id && u.email.toLowerCase() === email.toLowerCase()
  );
  if (emailExists) {
    return res.status(400).json({ error: "Este e-mail já está sendo usado por outro usuário." });
  }

  const updatedUser = {
    ...list[userIndex],
    name,
    email,
    phone: phone || "",
    role: role || "membro",
    status: status || "ativo",
    birth_date: birth_date || ""
  };

  list[userIndex] = updatedUser;
  saveUsersToDisk(list);
  return res.json(updatedUser);
});

// API: DELETE User
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from("users")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return res.json({ success: true, id });
    } catch (err: any) {
      console.error("Supabase Delete User error, falling back to local store:", err.message);
    }
  }

  // Fallback / disk persistence
  const list = getStoredUsers();
  const userIndex = list.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  list.splice(userIndex, 1);
  saveUsersToDisk(list);
  return res.json({ success: true, id });
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
