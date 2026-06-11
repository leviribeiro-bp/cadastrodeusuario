import { useState } from "react";
import { Search, Edit2, Trash2, Shield, Calendar, Mail, Phone, ChevronDown, Check, AlertCircle } from "lucide-react";
import { User, UserRole, UserStatus } from "../types";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [sortField, setSortField] = useState<"name" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // State for delete confirmation alert per user so they don't accidentally delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter & Search Logic
  const filteredUsers = users
    .filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm));
      
      const matchRole = selectedRole === "todos" || user.role === selectedRole;
      const matchStatus = selectedStatus === "todos" || user.status === selectedStatus;

      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

  const toggleSort = (field: "name" | "created_at") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Human-readable date helpers
  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return "Não informada";
    try {
      const portions = dateString.split("-");
      if (portions.length === 3) {
        return `${portions[2]}/${portions[1]}/${portions[0]}`;
      }
      return dateString;
    } catch {
      return dateString || "";
    }
  };

  // Status badges colors config
  const getStatusBadge = (statusValue: UserStatus) => {
    if (statusValue === "ativo") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-150">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Ativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-500 rounded-full border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Inativo
      </span>
    );
  };

  // Role pill colors config
  const getRoleBadge = (roleValue: UserRole) => {
    switch (roleValue) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-100 uppercase tracking-wider text-[10px]">
            Admin
          </span>
        );
      case "editor":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-100 uppercase tracking-wider text-[10px]">
            Editor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full border border-slate-200 uppercase tracking-wider text-[10px]">
            Membro
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Table Filter Top Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-slate-50/50">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="table-search"
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-2xs"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Cargo:</span>
            <select
              id="filter-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-700 shadow-2xs"
            >
              <option value="todos">Todos os Cargos</option>
              <option value="membro">Membro</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Status:</span>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-700 shadow-2xs"
            >
              <option value="todos">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          {/* Sorter Toggle */}
          <button
            id="btn-toggle-sort"
            onClick={() => toggleSort(sortField === "name" ? "created_at" : "name")}
            className="text-xs inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-lg border border-indigo-100 transition-colors"
          >
            Ordenado por: {sortField === "name" ? "Nome" : "Registro"} ({sortOrder === "asc" ? "Crescente" : "Decrescente"})
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredUsers.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-100 select-none">
                <th
                  onClick={() => toggleSort("name")}
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 hover:text-slate-950 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Nome Completo
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortField === "name" && sortOrder === "asc" ? "rotate-180" : ""}`} />
                  </div>
                </th>
                <th className="px-6 py-3.5">Contato / E-mail</th>
                <th className="px-6 py-3.5">Nascimento</th>
                <th className="px-6 py-3.5 text-center">Nível / Cargo</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th
                  onClick={() => toggleSort("created_at")}
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 hover:text-slate-950 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    Cadastrado Em
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortField === "created_at" && sortOrder === "asc" ? "rotate-180" : ""}`} />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 divide-solid text-slate-700 text-sm">
              {filteredUsers.map((user) => (
                <tr id={`user-row-${user.id}`} key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Name column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center pointer-events-none">
                        {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">{user.name}</span>
                        <span className="text-xs text-slate-400 font-mono">ID: {user.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </td>

                  {/* contact / email column */}
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <span className="text-slate-700 flex items-center gap-1.5 break-all">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400 font-normal" />
                        {user.email}
                      </span>
                      {user.phone ? (
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 focus:outline-hidden">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          {user.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic block">WhatsApp Não Informado</span>
                      )}
                    </div>
                  </td>

                  {/* Date born column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatBirthDate(user.birth_date)}
                    </span>
                  </td>

                  {/* level / cargo */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex justify-center select-none">
                      {getRoleBadge(user.role)}
                    </div>
                  </td>

                  {/* active status */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex justify-center select-none">
                      {getStatusBadge(user.status)}
                    </div>
                  </td>

                  {/* created_at column */}
                  <td className="px-6 py-4 text-right whitespace-nowrap font-medium text-slate-600">
                    {formatDate(user.created_at)}
                  </td>

                  {/* edit action column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {confirmDeleteId === user.id ? (
                        // Double Confirmation Flow
                        <div className="bg-rose-50 border border-rose-100 rounded-lg p-1 flex items-center gap-1 animate-fadeIn shrink-0">
                          <span className="text-xs font-bold text-rose-700 px-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-500 animate-bounce" /> Excluir?
                          </span>
                          <button
                            id={`btn-confirm-delete-${user.id}`}
                            onClick={() => {
                              onDelete(user.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Sim
                          </button>
                          <button
                            id={`btn-cancel-delete-${user.id}`}
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Normal Actions */}
                          <button
                            id={`btn-edit-user-${user.id}`}
                            onClick={() => onEdit(user)}
                            className="bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 p-2 rounded-lg transition-all"
                            title="Editar Dados do Usuário"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-user-trigger-${user.id}`}
                            onClick={() => setConfirmDeleteId(user.id)}
                            className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 p-2 rounded-lg transition-all"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div id="table-empty-state" className="p-12 text-center text-slate-500 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200 pointer-events-none">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Nenhum Usuário Encontrado</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tente redefinir seu termo de pesquisa ou os filtros de cargos e status para encontrar outros registros.
            </p>
          </div>
        )}
      </div>

      {/* Footer information showing counts */}
      <div className="px-6 py-4 bg-slate-50 text-slate-500 text-xs font-medium border-t border-slate-100 flex items-center justify-between">
        <span>Mostrando {filteredUsers.length} de {users.length} usuários cadastrados</span>
        <span className="font-mono text-[11px] text-slate-400">Total: {users.length} registros</span>
      </div>
    </div>
  );
}
