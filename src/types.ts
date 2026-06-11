export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "editor" | "membro";
  status: "ativo" | "inativo";
  birth_date: string;
  created_at: string;
}

export type UserRole = "admin" | "editor" | "membro";
export type UserStatus = "ativo" | "inativo";

export interface SupabaseConfigStatus {
  configured: boolean;
  mode: "demo" | "production" | "table_missing" | "error";
  message: string;
  sql?: string;
  databaseUrl?: string;
}
