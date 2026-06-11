import { useState, useEffect } from "react";
import { UserPlus, Database, AlertCircle, CheckCircle, RefreshCw, Users, HelpCircle } from "lucide-react";
import { User, SupabaseConfigStatus } from "./types";
import StatisticsCards from "./components/StatisticsCards";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";
import SupabaseInstallGuide from "./components/SupabaseInstallGuide";

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<SupabaseConfigStatus>({
    configured: false,
    mode: "demo",
    message: "Verificando conexão..."
  });
  
  const [showGuide, setShowGuide] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Success and Error Notification alerts
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const triggerFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    // Auto clear after 4 seconds
    setTimeout(() => {
      setFeedback({ type: null, message: "" });
    }, 4500);
  };

  // Fetch Users from standard API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Não foi possível carregar os usuários.");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      triggerFeedback("error", err.message || "Erro de rede ao carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Configuration Status and Table Existence
  const fetchDbStatus = async () => {
    try {
      const response = await fetch("/api/supabase-status");
      if (response.ok) {
        const data = await response.json();
        setDbStatus(data);
        
        // Auto-show guide if table is missing or explicitly in demo mode to help development
        if (data.mode === "table_missing" || data.mode === "demo") {
          setShowGuide(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch database status:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDbStatus();
  }, []);

  // Save User (Create or Update)
  const handleSaveUser = async (userPayload: Partial<User>): Promise<boolean> => {
    try {
      const isEditing = !!userPayload.id;
      const url = isEditing ? `/api/users/${userPayload.id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ocorreu um erro ao salvar o usuário.");
      }

      // Success
      triggerFeedback(
        "success",
        isEditing 
          ? `Usuário "${userPayload.name}" editado com sucesso.` 
          : `Usuário "${userPayload.name}" cadastrado com sucesso.`
      );
      
      // Reload User List
      await fetchUsers();
      return true;
    } catch (err: any) {
      triggerFeedback("error", err.message || "Não foi possível cadastrar / alterar usuário.");
      return false;
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string) => {
    try {
      const userToDelete = users.find((u) => u.id === id);
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Não foi possível deletar o usuário.");
      }

      triggerFeedback("success", `Usuário "${userToDelete?.name || "removido"}" excluído com sucesso.`);
      await fetchUsers();
    } catch (err: any) {
      triggerFeedback("error", err.message || "Erro ao excluir o cadastro.");
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Retrive proper colors/icons for Database Status indicator
  const getDbStatusIndicator = () => {
    switch (dbStatus.mode) {
      case "production":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="w-3.5 h-3.5" />
            Supabase Ativo
          </div>
        );
      case "table_missing":
        return (
          <button
            onClick={() => setShowGuide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-full hover:bg-amber-100 transition-colors shadow-xs"
            title="Clique para ver instruções de SQL"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <AlertCircle className="w-3.5 h-3.5" />
            Criar Tabela (SQL pendente)
          </button>
        );
      case "error":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <AlertCircle className="w-3.5 h-3.5" />
            Instabilidade de Conexão
          </div>
        );
      default:
        return (
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold rounded-full hover:bg-sky-100 transition-colors shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <Database className="w-3.5 h-3.5" />
            Modo Local (In-Memory Demo)
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Toast / Notification Feedbacks */}
        {feedback.type && (
          <div
            id="toast-notification"
            className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedback.message}</span>
          </div>
        )}

        {/* Master Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 text-white rounded-xl pointer-events-none shadow-md shadow-indigo-600/15">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Cadastro de Usuários
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Painel Administrativo Independente &bull; Controle de Acesso
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Supabase connection indicator */}
            {getDbStatusIndicator()}

            <button
              id="btn-toggle-instructions"
              onClick={() => setShowGuide(!showGuide)}
              className="text-slate-600 hover:text-slate-800 p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs transition-all"
              title="Ajuda e Instruções"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Main Action Add */}
            <button
              id="btn-primary-add"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/25 transition-all flex items-center gap-1.5 shrink-0"
              title="Cadastrar Novo Usuário"
            >
              <UserPlus className="w-4 h-4" />
              Novo Cadastro
            </button>
          </div>
        </header>

        {/* Supabase Installation Guides */}
        {showGuide && (
          <SupabaseInstallGuide status={dbStatus} />
        )}

        {/* Dashboard Analytics */}
        <StatisticsCards users={users} />

        {/* CRUD Table Section */}
        <main>
          {loading ? (
            <div id="table-skeleton-loader" className="bg-white rounded-xl shadow-xs border border-slate-100 p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">Carregando lista de registros</h4>
              <p className="text-slate-400 text-xs mt-1">
                Buscando informações ativas do banco de dados ...
              </p>
            </div>
          ) : (
            <UserTable
              users={users}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteUser}
            />
          )}
        </main>
      </div>

      {/* Pop-up Modals */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={selectedUser}
      />
    </div>
  );
}
