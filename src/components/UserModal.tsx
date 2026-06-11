import React, { useState, useEffect } from "react";
import { X, Save, User as UserIcon, Mail, Phone, Calendar, Shield, BadgeAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, UserRole, UserStatus } from "../types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => Promise<boolean>;
  userToEdit: User | null;
}

export default function UserModal({ isOpen, onClose, onSave, userToEdit }: UserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("membro");
  const [status, setStatus] = useState<UserStatus>("ativo");
  const [birthDate, setBirthDate] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Quick form phone mask helper (Brazilian formatting (XX) XXXXX-XXXX or standard)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      if (digits.length > 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length > 2) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      }
      return digits;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || "");
      setEmail(userToEdit.email || "");
      setPhone(userToEdit.phone || "");
      setRole(userToEdit.role || "membro");
      setStatus(userToEdit.status || "ativo");
      
      // Handle birth date display formatting (YYYY-MM-DD)
      if (userToEdit.birth_date) {
        // Strip time if any
        setBirthDate(userToEdit.birth_date.substring(0, 10));
      } else {
        setBirthDate("");
      }
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("membro");
      setStatus("ativo");
      setBirthDate("");
    }
    setValidationError("");
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError("O nome completo é obrigatório.");
      return;
    }

    if (!email.trim()) {
      setValidationError("O e-mail é obrigatório.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Por favor, digite um e-mail válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userPayload: Partial<User> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        status,
        birth_date: birthDate || undefined,
      };

      if (userToEdit) {
        userPayload.id = userToEdit.id;
      }

      const success = await onSave(userPayload);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setValidationError(err.message || "Erro inesperado ao salvar o usuário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop Animation */}
          <motion.div
            id="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Card Animation */}
          <motion.div
            id="modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden mx-4 z-10"
          >
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {userToEdit ? "Editar Cadastro de Usuário" : "Novo Cadastro de Usuário"}
                </h3>
              </div>
              <button
                id="btn-close-modal"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {validationError && (
                <div id="modal-validation-error" className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg flex items-start gap-2.5 text-xs text-rose-700">
                  <BadgeAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Erro no formulário:</span> {validationError}
                  </div>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Nome Completo *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="form-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="João da Silva Martins"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">E-mail *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="form-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao.silva@email.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              {/* Row: Phone and BirthDate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Telefone / WhatsApp</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      id="form-phone"
                      type="text"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Birth Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Data de Nascimento</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      id="form-birthdate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Row: Role and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role Select */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Cargo / Nível</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Shield className="w-4 h-4" />
                    </span>
                    <select
                      id="form-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 appearance-none"
                    >
                      <option value="membro">Membro</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                {/* Status Toggle buttons */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Status da Conta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-status-active"
                      type="button"
                      onClick={() => setStatus("ativo")}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        status === "ativo"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      Ativo
                    </button>
                    <button
                      id="btn-status-inactive"
                      type="button"
                      onClick={() => setStatus("inativo")}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        status === "inativo"
                          ? "bg-rose-50 border-rose-200 text-rose-700 shadow-xs"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      Inativo
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                <button
                  id="btn-form-cancel"
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent disabled:opacity-55"
                >
                  Cancelar
                </button>
                <button
                  id="btn-form-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-55"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Salvando..." : "Salvar Cadastro"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
