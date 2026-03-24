import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Users, Plus, Trash2, Edit2, Shield, User, Car, Building,
  CheckCircle, XCircle, Eye, EyeOff, X, Save
} from "lucide-react";

type UserRole = "admin" | "gestionnaire" | "chauffeur" | "client";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  gestionnaire: "Gestionnaire",
  chauffeur: "Chauffeur",
  client: "Client",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-amber-100 text-amber-800 border-amber-200",
  gestionnaire: "bg-blue-100 text-blue-800 border-blue-200",
  chauffeur: "bg-green-100 text-green-800 border-green-200",
  client: "bg-purple-100 text-purple-800 border-purple-200",
};

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="h-3.5 w-3.5" />,
  gestionnaire: <Building className="h-3.5 w-3.5" />,
  chauffeur: <Car className="h-3.5 w-3.5" />,
  client: <User className="h-3.5 w-3.5" />,
};

interface MemberFormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
}

export default function Members() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "gestionnaire",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: members = [], refetch } = trpc.members.getAll.useQuery();

  const createMutation = trpc.members.create.useMutation({
    onSuccess: () => {
      setSuccess("Membre créé avec succès !");
      setShowForm(false);
      resetForm();
      refetch();
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = trpc.members.update.useMutation({
    onSuccess: () => {
      setSuccess("Membre mis à jour !");
      setEditingId(null);
      resetForm();
      refetch();
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = trpc.members.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSuccess("Membre supprimé.");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => setError(err.message),
  });

  const toggleActiveMutation = trpc.members.update.useMutation({
    onSuccess: () => refetch(),
  });

  function resetForm() {
    setFormData({ email: "", password: "", name: "", phone: "", role: "gestionnaire" });
    setError("");
    setShowPassword(false);
  }

  function handleEdit(member: any) {
    setEditingId(member.id);
    setFormData({
      email: member.email,
      password: "",
      name: member.name,
      phone: member.phone || "",
      role: member.role,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (editingId) {
      const updateData: any = {
        id: editingId,
        name: formData.name,
        phone: formData.phone || undefined,
        role: formData.role,
      };
      if (formData.password) updateData.password = formData.password;
      await updateMutation.mutateAsync(updateData);
    } else {
      if (!formData.password || formData.password.length < 8) {
        setError("Le mot de passe doit faire au moins 8 caractères");
        return;
      }
      await createMutation.mutateAsync(formData);
    }
  }

  const adminCount = members.filter(m => m.role === "admin").length;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-7 w-7 text-amber-600" />
              Gestion des membres
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {members.length} membre{members.length > 1 ? "s" : ""} dans l&apos;équipe
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-black font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)" }}
          >
            <Plus className="h-4 w-4" />
            Ajouter un membre
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Modifier le membre" : "Ajouter un nouveau membre"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Prénom Nom"
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@mschauffeur.fr"
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 XX XX XX XX"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="admin">Administrateur — accès total</option>
                  <option value="gestionnaire">Gestionnaire — gestion des missions</option>
                  <option value="chauffeur">Chauffeur — voir ses missions</option>
                  <option value="client">Client — portail client</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingId ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingId ? "Laisser vide pour ne pas modifier" : "Minimum 8 caractères"}
                    required={!editingId}
                    minLength={editingId ? undefined : 8}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="col-span-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="col-span-2 flex gap-3 justify-end">
                <button type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-black text-sm font-semibold disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #d4af37, #b8960c)" }}>
                  <Save className="h-4 w-4" />
                  {editingId ? "Enregistrer" : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des membres */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span className="col-span-2">Membre</span>
              <span>Rôle</span>
              <span>Statut</span>
              <span className="text-right">Actions</span>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun membre pour le moment</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {members.map((member: any) => (
                <div key={member.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    {/* Infos membre */}
                    <div className="col-span-2 flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #d4af37, #b8960c)" }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                        <p className="text-gray-400 text-xs">{member.email}</p>
                        {member.phone && (
                          <p className="text-gray-400 text-xs">{member.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Rôle */}
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS[member.role as UserRole] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {ROLE_ICONS[member.role as UserRole]}
                        {ROLE_LABELS[member.role as UserRole] || member.role}
                      </span>
                    </div>

                    {/* Statut */}
                    <div>
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500">
                          <XCircle className="h-3.5 w-3.5" />
                          Désactivé
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end">
                      {/* Activer/Désactiver */}
                      {member.id !== 1 && (
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: member.id, isActive: !member.isActive })}
                          title={member.isActive ? "Désactiver" : "Activer"}
                          className={`p-1.5 rounded-lg transition-colors ${member.isActive ? "text-gray-400 hover:text-orange-500 hover:bg-orange-50" : "text-gray-400 hover:text-green-500 hover:bg-green-50"}`}
                        >
                          {member.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                      )}

                      {/* Modifier */}
                      <button
                        onClick={() => handleEdit(member)}
                        title="Modifier"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Supprimer (pas le compte principal) */}
                      {member.id !== 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le compte de ${member.name} ?`)) {
                              deleteMutation.mutate({ id: member.id });
                            }
                          }}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Badge compte principal */}
                      {member.id === 1 && (
                        <span className="text-xs text-amber-600 font-medium px-2 py-1 bg-amber-50 rounded-lg border border-amber-200">
                          Principal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info rôles */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Description des rôles
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([role, label]) => (
              <div key={role} className="flex items-start gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 mt-0.5 ${ROLE_COLORS[role]}`}>
                  {ROLE_ICONS[role]}
                  {label}
                </span>
                <span className="text-xs text-amber-700">
                  {role === "admin" && "Accès complet à toutes les fonctionnalités et paramètres"}
                  {role === "gestionnaire" && "Gestion des missions, clients, chauffeurs et véhicules"}
                  {role === "chauffeur" && "Consultation de ses missions assignées uniquement"}
                  {role === "client" && "Accès au portail client pour suivre ses réservations"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
