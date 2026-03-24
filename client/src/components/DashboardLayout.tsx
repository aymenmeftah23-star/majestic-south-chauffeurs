import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard, MapPin, FileText, Users, Car, Truck,
  Bell, BarChart3, Settings, Search, ChevronDown, LogOut,
  Menu, X, Sun, Moon, Globe, Crown, Briefcase, Calendar,
  UserCheck, CreditCard, History, Shield, Wrench, MessageSquare,
  Star, Tag, Gift, Webhook, Code, ClipboardList
} from "lucide-react";

const GOLD = "#C9A84C";

const DEMO_USER = {
  name: "Aymen MEFTAH",
  email: "contact@mschauffeur.fr",
  role: "Président",
  avatar: null,
};

const navGroups = [
  {
    label: "Principal",
    items: [
      { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      { path: "/planning", label: "Planning", icon: Calendar },
    ]
  },
  {
    label: "Operations",
    items: [
      { path: "/missions", label: "Missions", icon: MapPin },
      { path: "/demands", label: "Demandes", icon: ClipboardList },
      { path: "/quotes", label: "Dossiers / Devis", icon: Briefcase },
    ]
  },
  {
    label: "Ressources",
    items: [
      { path: "/chauffeurs", label: "Chauffeurs", icon: UserCheck },
      { path: "/vehicles", label: "Vehicules", icon: Car },
      { path: "/clients", label: "Clients", icon: Users },
    ]
  },
  {
    label: "Finance",
    items: [
      { path: "/invoices", label: "Facturation", icon: CreditCard },
      { path: "/payments", label: "Paiements", icon: CreditCard },
      { path: "/reporting", label: "Statistiques", icon: BarChart3 },
    ]
  },
  {
    label: "Suivi & Communication",
    items: [
      { path: "/gps-tracking", label: "GPS Tracking", icon: MapPin },
      { path: "/chat", label: "Messagerie", icon: MessageSquare },
      { path: "/reviews", label: "Avis Clients", icon: Star },
    ]
  },
  {
    label: "Fidélisation",
    items: [
      { path: "/bonuses", label: "Primes Chauffeurs", icon: Gift },
      { path: "/promo-codes", label: "Codes Promo", icon: Tag },
      { path: "/client-portal", label: "Espace Client", icon: Users },
    ]
  },
  {
    label: "Systeme",
    items: [
      { path: "/alerts", label: "Alertes", icon: Bell },
      { path: "/history", label: "Historique", icon: History },
      { path: "/audit-trail", label: "Journal d'audit", icon: Shield },
      { path: "/support", label: "Support", icon: Wrench },
      { path: "/settings", label: "Parametres", icon: Settings },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { language, setLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = document.documentElement.classList.contains("dark");

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const isActive = (path: string) => location === path || (path !== "/dashboard" && location.startsWith(path));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f0f1a] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-60" : "w-16"} flex-shrink-0 flex flex-col bg-[#1a1a2e] border-r border-white/10 transition-all duration-300 overflow-hidden ${mobileOpen ? "fixed inset-y-0 left-0 z-50" : "hidden md:flex"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{background: "linear-gradient(135deg, #C9A84C, #a07830)"}}>
            <Crown className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-white leading-tight truncate">Majestic South</div>
              <div className="text-xs font-medium truncate" style={{color: GOLD}}>Chauffeurs</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              {sidebarOpen && (
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all mb-0.5 ${
                        active
                          ? "text-[#1a1a2e] font-semibold"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                      style={active ? { background: "linear-gradient(135deg, #C9A84C, #a07830)" } : {}}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#1a1a2e]" style={{background: "linear-gradient(135deg, #C9A84C, #a07830)"}}>
              {DEMO_USER.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{DEMO_USER.name}</div>
                <div className="text-xs text-gray-500 truncate">{DEMO_USER.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center gap-3 px-4 bg-white dark:bg-[#1a1a2e] border-b border-gray-200 dark:border-white/10 z-10">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <Link href="/search">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-white/15 transition-all">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Rechercher...</span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded">Ctrl K</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Lang */}
            <button
              onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/10 rounded-lg transition-all"
            >
              <Globe className="h-3.5 w-3.5" />
              {language.toUpperCase()}
            </button>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/10 rounded-lg transition-all"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <Link href="/alerts">
              <button className="relative p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/10 rounded-lg transition-all">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">1</span>
              </button>
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[#1a1a2e]" style={{background: "linear-gradient(135deg, #C9A84C, #a07830)"}}>
                  {DEMO_USER.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{DEMO_USER.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{DEMO_USER.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{DEMO_USER.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/settings">
                      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-all" onClick={() => setUserMenuOpen(false)}>
                        <Settings className="h-4 w-4" />
                        Parametres
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-all">
                      <LogOut className="h-4 w-4" />
                      Deconnexion
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
