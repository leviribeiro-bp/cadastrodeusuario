import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { User } from "../types";

interface StatisticsCardsProps {
  users: User[];
}

export default function StatisticsCards({ users }: StatisticsCardsProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ativo").length;
  const inactiveUsers = totalUsers - activeUsers;
  
  const adminCount = users.filter((u) => u.role === "admin").length;
  const editorCount = users.filter((u) => u.role === "editor").length;
  const membroCount = users.filter((u) => u.role === "membro").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Card */}
      <div id="stat-total-users" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:border-slate-250">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Usuários</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalUsers}</h3>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Ativos Card */}
      <div id="stat-active-users" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:border-slate-250">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ativos</p>
          <h3 className="text-3xl font-bold text-emerald-600 mt-1">
            {activeUsers}
            {totalUsers > 0 && (
              <span className="text-xs font-normal text-slate-400 ml-2">
                ({Math.round((activeUsers / totalUsers) * 100)}%)
              </span>
            )}
          </h3>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
          <UserCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Inativos Card */}
      <div id="stat-inactive-users" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:border-slate-250">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inativos</p>
          <h3 className="text-3xl font-bold text-slate-700 mt-1">
            {inactiveUsers}
          </h3>
        </div>
        <div className="bg-rose-50 p-3 rounded-lg text-rose-600">
          <UserX className="w-6 h-6" />
        </div>
      </div>

      {/* Cargos Card */}
      <div id="stat-roles-distribution" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:border-slate-250">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Níveis / Cargos</p>
          <div className="flex gap-3 mt-2 text-xs text-slate-600">
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium" title="Administradores">
              Adm: {adminCount}
            </span>
            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium" title="Editores">
              Ed: {editorCount}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium" title="Membros">
              Memb: {membroCount}
            </span>
          </div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
          <Shield className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
