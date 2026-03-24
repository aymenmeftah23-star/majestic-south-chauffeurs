import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowLeft, Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Rediriger vers le dashboard après connexion
        window.location.href = "/dashboard";
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
      // Erreur gérée par onError
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative">
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, #d4af37 0%, transparent 60%)" }}
      />
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </button>

        <div className="bg-[#111] border border-amber-900/30 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div
              className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #d4af37, #b8960c)" }}
            >
              <Crown className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Connexion</h1>
            <p className="text-gray-400 text-sm">Accédez à votre espace Majestic South</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@mschauffeur.fr"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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

            {error && (
              <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)" }}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-amber-900/20 text-center">
            <p className="text-gray-500 text-xs">
              Majestic South Chauffeurs &mdash; Espace privé
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Pour obtenir un accès, contactez l&apos;administrateur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
