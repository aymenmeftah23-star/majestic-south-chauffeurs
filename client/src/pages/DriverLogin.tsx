import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowLeft, Car } from "lucide-react";
import { trpc } from "@/lib/trpc";

const GOLD = "#C9A84C";

export default function DriverLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        const role = data.user?.role;
        if (role === "chauffeur") {
          // Stocker l'id chauffeur dans localStorage pour filtrer les missions
          if (data.user) {
            localStorage.setItem("driver_user_id", String(data.user.id));
            localStorage.setItem("driver_user_name", data.user.name);
            localStorage.setItem("driver_user_email", data.user.email);
          }
          window.location.href = "/driver";
        } else if (role === "admin" || role === "gestionnaire") {
          window.location.href = "/dashboard";
        } else {
          setError("Votre compte n'a pas accès à cet espace.");
          setLoading(false);
        }
      }
    },
    onError: (err) => {
      setError(err.message || "Email ou mot de passe incorrect");
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: "#0a0a0a" }}>
      {/* Fond décoratif */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `radial-gradient(ellipse at 30% 50%, ${GOLD} 0%, transparent 60%)` }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </button>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div
              className="h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)` }}
            >
              <Car className="h-7 w-7 text-black" />
            </div>
            <div className="text-xs font-bold tracking-widest mb-1" style={{ color: GOLD }}>
              MAJESTIC SOUTH
            </div>
            <h1 className="text-xl font-bold text-white">Espace Chauffeur</h1>
            <p className="text-gray-500 text-sm mt-1">Connectez-vous pour accéder à vos missions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chauffeur@mschauffeur.fr"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-amber-600/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-amber-600/50 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-black transition-all hover:opacity-90 disabled:opacity-50 text-sm"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)` }}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-gray-600 text-xs">
              Accès réservé aux chauffeurs Majestic South
            </p>
            <p className="text-gray-700 text-xs mt-1">
              Pour obtenir un accès, contactez votre responsable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
