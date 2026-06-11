import { useState } from "react";
import { Database, Copy, Check, Terminal, ExternalLink, Settings, AlertTriangle } from "lucide-react";
import { SupabaseConfigStatus } from "../types";

interface SupabaseInstallGuideProps {
  status: SupabaseConfigStatus;
}

export default function SupabaseInstallGuide({ status }: SupabaseInstallGuideProps) {
  const [copied, setCopied] = useState(false);

  const sqlCode = status.sql || `create table public.users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  phone text,
  role text not null default 'membro',
  status text not null default 'ativo',
  birth_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`;

  const copySqlCode = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="supabase-guide" className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-md border border-slate-800 mb-6">
      {/* Header Bar */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {status.mode === "demo" ? (
            <Database className="w-5 h-5 text-sky-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          )}
          <span className="font-semibold text-sm tracking-wide">
            {status.mode === "demo" 
              ? "⚡ Dica: Como configurar o Supabase Real para Produção" 
              : "⚠️ Atenção: Crie a Tabela no Supabase"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">
            {status.mode === "demo" ? "Modo Demo Ativo" : "Tabela Ausente"}
          </span>
        </div>
      </div>

      {/* Guide Content */}
      <div className="p-5">
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {status.mode === "demo" ? (
            <>
              O aplicativo está rodando atualmente usando um <strong>banco de dados simulado em memória</strong>. 
              As alterações serão salvas durante a sessão atual. Para conectar ao seu banco de dados 
              <strong> Supabase real</strong>, siga o passo a passo abaixo:
            </>
          ) : (
            <>
              Suas chaves do Supabase foram injetadas com sucesso! No entanto, a tabela <code>users</code> precisa ser 
              criada no seu painel para que a sincronização funcione. Siga os passos:
            </>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Steps */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instruções de Configuração</h4>
            
            <ol className="space-y-3 text-xs list-decimal pl-4 text-slate-300">
              <li>
                Acesse o dashboard do seu <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 font-semibold">Supabase Studio <ExternalLink className="w-3 h-3" /></a>.
              </li>
              <li>
                Clique em <strong>SQL Editor</strong> no menu lateral esquerdo do Supabase.
              </li>
              <li>
                Clique em <strong>New query</strong> (Nova consulta) e cole o script SQL ao lado.
              </li>
              <li>
                Clique em <strong>Run</strong> (Executar) para criar a tabela de usuários.
              </li>
              {status.mode === "demo" && (
                <li>
                  No menu lateral do Google AI Studio, vá nas configurações / secrets e adicione as seguintes chaves de ambiente:
                  <div className="mt-1 bg-slate-950 p-2 rounded font-mono text-[11px] text-sky-300 space-y-1 border border-slate-800">
                    <div>SUPABASE_URL = <span className="text-slate-400">"Sua URL de API"</span></div>
                    <div>SUPABASE_KEY = <span className="text-slate-400">"Sua Chave Anon/Service"</span></div>
                  </div>
                </li>
              )}
            </ol>
            <p className="text-xs text-sky-400 pt-2 italic">
              ✨ Com o Supabase conectado, o aplicativo se torna instantaneamente persistente em nuvem!
            </p>
          </div>

          {/* SQL Code Block */}
          <div className="flex flex-col bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" /> schema.sql
              </span>
              <button
                id="btn-copy-sql"
                onClick={copySqlCode}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded transition-colors"
                title="Copiar SQL para Área de Transferência"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copiado!" : "Copiar SQL"}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed text-emerald-300 max-h-[180px]">
              <code>{sqlCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
