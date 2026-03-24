import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Crown, ArrowLeft, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1200);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(ellipse at 50% 50%, #d4af37 0%, transparent 60%)"}} />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-[#111] border border-amber-900/30 rounded-3xl p-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: "linear-gradient(135deg, #d4af37, #b8960c)"}}>
              <CheckCircle className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Compte créé !</h2>
            <p className="text-gray-400 mb-6">
              Bienvenue chez Majestic South Chauffeurs. Votre compte a été créé avec succès.
            </p>
            <button
              onClick={() => setLocation("/login")}
              className="w-full py-3.5 rounded-xl font-semibold text-black"
              style={{background: "linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)"}}
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(ellipse at 70% 50%, #d4af37 0%, transparent 60%)"}} />
      <div className="relative z-10 w-full max-w-lg">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors mb-8 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </button>
        <div className="bg-[#111] border border-amber-900/30 rounded-3xl p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Majestic South" className="h-16 w-16 object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-1">Créer un compte</h1>
            <p className="text-gray-400 text-sm">Rejoignez Majestic South Chauffeurs</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Téléphone *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+33 6 00 00 00 00"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Société (optionnel)</label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Nom de votre société"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Mot de passe *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caractères"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Confirmer le mot de passe *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex items-start gap-3 pt-2">
              <input type="checkbox" required className="mt-1 rounded border-amber-900/30" />
              <p className="text-xs text-gray-400">
                J&apos;accepte les{" "}
                <span className="text-amber-400 cursor-pointer hover:underline">conditions d&apos;utilisation</span>
                {" "}et la{" "}
                <span className="text-amber-400 cursor-pointer hover:underline">politique de confidentialité</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{background: "linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)"}}
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Déjà un compte ?{" "}
              <button onClick={() => setLocation("/login")} className="text-amber-400 hover:text-amber-300 font-medium">
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
