import { useLocation } from "wouter";
import { useState } from "react";
import {
  Crown, Star, Shield, Clock, Phone, Mail, MapPin,
  ChevronRight, Menu, X, Car, Users, Award, CheckCircle
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    { icon: Car, title: "Transferts Aéroport", desc: "Prise en charge et dépose dans tous les aéroports de la région. Suivi des vols en temps réel." },
    { icon: Users, title: "Événements Privés", desc: "Mariages, galas, soirées VIP. Nous assurons votre transport avec discrétion et élégance." },
    { icon: Award, title: "Voyages d'Affaires", desc: "Déplacements professionnels, roadshows, meetings. Ponctualité et confort garantis." },
    { icon: Crown, title: "Mise à Disposition", desc: "Chauffeur à votre disposition pour la journée ou la demi-journée selon vos besoins." },
  ];

  const stats = [
    { value: "500+", label: "Clients satisfaits" },
    { value: "15+", label: "Chauffeurs certifiés" },
    { value: "10", label: "Véhicules premium" },
    { value: "24/7", label: "Disponibilité" },
  ];

  const testimonials = [
    { name: "Jean-Pierre M.", role: "Directeur Général", text: "Service impeccable, chauffeur ponctuel et professionnel. Je recommande vivement Majestic South pour tous vos déplacements d'affaires." },
    { name: "Sophie D.", role: "Organisatrice d'événements", text: "Nous faisons appel à Majestic South pour tous nos événements. La qualité du service est irréprochable et les véhicules sont magnifiques." },
    { name: "Marc L.", role: "Entrepreneur", text: "La discrétion et le professionnalisme de leurs chauffeurs sont remarquables. Un service vraiment premium." },
  ];

  const vehicles = [
    { name: "Mercedes Classe V", category: "Van Premium", capacity: "7 passagers", img: "🚐" },
    { name: "Mercedes Classe E", category: "Berline Luxe", capacity: "3 passagers", img: "🚗" },
    { name: "Mercedes Classe S", category: "Berline Prestige", capacity: "3 passagers", img: "🚗" },
    { name: "Tesla Model Y", category: "SUV Électrique", capacity: "4 passagers", img: "🚙" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Majestic South" className="h-12 w-12 object-contain" />
              <div>
                <div className="font-bold text-base tracking-widest" style={{color: '#d4af37'}}>MAJESTIC SOUTH</div>
                <div className="text-xs text-gray-400 tracking-widest uppercase">Chauffeurs</div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm text-gray-300 hover:text-amber-400 transition-colors">Services</a>
              <a href="#fleet" className="text-sm text-gray-300 hover:text-amber-400 transition-colors">Flotte</a>
              <a href="#about" className="text-sm text-gray-300 hover:text-amber-400 transition-colors">À propos</a>
              <a href="#contact" className="text-sm text-gray-300 hover:text-amber-400 transition-colors">Contact</a>
              <button
                onClick={() => setLocation('/login')}
                className="text-sm text-gray-300 hover:text-amber-400 transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={() => setLocation('/register')}
                className="px-5 py-2.5 text-sm font-semibold rounded-full text-black transition-all hover:scale-105"
                style={{background: 'linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)'}}
              >
                Réserver
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-amber-400" /> : <Menu className="h-6 w-6 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-amber-900/30 px-4 py-6 space-y-4">
            <a href="#services" className="block text-gray-300 hover:text-amber-400 py-2">Services</a>
            <a href="#fleet" className="block text-gray-300 hover:text-amber-400 py-2">Flotte</a>
            <a href="#about" className="block text-gray-300 hover:text-amber-400 py-2">À propos</a>
            <a href="#contact" className="block text-gray-300 hover:text-amber-400 py-2">Contact</a>
            <button onClick={() => setLocation('/login')} className="block w-full text-left text-gray-300 hover:text-amber-400 py-2">Connexion</button>
            <button
              onClick={() => setLocation('/register')}
              className="w-full px-5 py-3 text-sm font-semibold rounded-full text-black"
              style={{background: 'linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)'}}
            >
              Réserver maintenant
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0d0b07] to-[#1a1200]" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, #d4af37 0%, transparent 70%)'
        }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-700/50 bg-amber-900/20 text-amber-400 text-sm mb-8">
            <Crown className="h-4 w-4" />
            <span>Service VTC Premium — Côte d'Azur</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Votre transport</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f5d56e 50%, #b8960c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>d'exception</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Chauffeurs privés certifiés, véhicules haut de gamme, service disponible 24h/24 et 7j/7.
            L'excellence au service de vos déplacements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation('/register')}
              className="px-8 py-4 text-base font-semibold rounded-full text-black transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)'
              }}
            >
              Réserver maintenant
              <ChevronRight className="inline ml-2 h-5 w-5" />
            </button>
            <a
              href="mailto:booking@mschauffeur.fr"
              className="px-8 py-4 text-base font-semibold rounded-full border border-amber-700/50 text-amber-400 hover:bg-amber-900/20 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="h-5 w-5" />
              Nous contacter
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-amber-900/30">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold mb-1" style={{color: '#d4af37'}}>{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-[#0d0b07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-amber-400 text-sm mb-4">
              <div className="h-px w-8 bg-amber-400" />
              <span>NOS SERVICES</span>
              <div className="h-px w-8 bg-amber-400" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Une offre complète</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Nous proposons une gamme complète de services de transport premium adaptés à tous vos besoins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="p-6 rounded-2xl border border-amber-900/30 bg-gradient-to-b from-[#1a1400] to-[#0d0b07] hover:border-amber-600/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{background: 'linear-gradient(135deg, #d4af37, #b8960c)'}}>
                  <service.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-amber-400 text-sm mb-4">
              <div className="h-px w-8 bg-amber-400" />
              <span>NOTRE FLOTTE</span>
              <div className="h-px w-8 bg-amber-400" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Véhicules d'exception</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Une flotte de véhicules haut de gamme, régulièrement entretenus pour votre confort.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <div key={v.name} className="rounded-2xl border border-amber-900/30 bg-gradient-to-b from-[#1a1400] to-[#0d0b07] overflow-hidden hover:border-amber-600/50 transition-all">
                <div className="h-40 flex items-center justify-center text-7xl bg-gradient-to-b from-[#1a1400] to-[#0d0b07]">
                  {v.img}
                </div>
                <div className="p-4">
                  <div className="text-xs text-amber-400 mb-1">{v.category}</div>
                  <div className="font-semibold text-white">{v.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{v.capacity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="about" className="py-24 bg-[#0d0b07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-400 text-sm mb-4">
                <div className="h-px w-8 bg-amber-400" />
                <span>POURQUOI NOUS</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">L'excellence à chaque trajet</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Majestic South Chauffeurs est une société de transport VTC premium basée sur la Côte d'Azur.
                Nous mettons à votre disposition des chauffeurs professionnels et des véhicules haut de gamme
                pour tous vos déplacements.
              </p>
              <div className="space-y-4">
                {[
                  "Chauffeurs certifiés et formés aux standards premium",
                  "Véhicules récents, propres et régulièrement entretenus",
                  "Suivi GPS en temps réel et ponctualité garantie",
                  "Discrétion absolue et service personnalisé",
                  "Facturation claire et transparente",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Assurance Premium", desc: "Couverture complète pour tous nos trajets" },
                { icon: Clock, title: "24h/24 - 7j/7", desc: "Disponible à toute heure, tous les jours" },
                { icon: Star, title: "5 étoiles", desc: "Note moyenne de nos clients satisfaits" },
                { icon: Award, title: "Certifié VTC", desc: "Tous nos chauffeurs sont certifiés" },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-2xl border border-amber-900/30 bg-gradient-to-b from-[#1a1400] to-[#0d0b07]">
                  <item.icon className="h-8 w-8 mb-3" style={{color: '#d4af37'}} />
                  <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-amber-400 text-sm mb-4">
              <div className="h-px w-8 bg-amber-400" />
              <span>TÉMOIGNAGES</span>
              <div className="h-px w-8 bg-amber-400" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-amber-900/30 bg-gradient-to-b from-[#1a1400] to-[#0d0b07]">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-amber-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1a1200, #0d0b07)'}}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, #d4af37 0%, transparent 60%)'
        }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <Crown className="h-12 w-12 mx-auto mb-6" style={{color: '#d4af37'}} />
          <h2 className="text-4xl font-bold text-white mb-4">Prêt à voyager en classe ?</h2>
          <p className="text-gray-400 mb-8">Créez votre compte client et réservez votre premier trajet en quelques minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation('/register')}
              className="px-8 py-4 text-base font-semibold rounded-full text-black transition-all hover:scale-105"
              style={{background: 'linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)'}}
            >
              Créer mon compte
            </button>
            <button
              onClick={() => setLocation('/login')}
              className="px-8 py-4 text-base font-semibold rounded-full border border-amber-700/50 text-amber-400 hover:bg-amber-900/20 transition-all"
            >
              J'ai déjà un compte
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#0d0b07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-amber-400 text-sm mb-4">
              <div className="h-px w-8 bg-amber-400" />
              <span>CONTACT</span>
              <div className="h-px w-8 bg-amber-400" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Nous contacter</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6 rounded-2xl border border-amber-900/30">
              <Phone className="h-8 w-8 mx-auto mb-3" style={{color: '#d4af37'}} />
              <div className="text-white font-semibold mb-1">Téléphone</div>
              <a href="tel:+33695618998" className="text-gray-400 text-sm hover:text-amber-400">+33 6 95 61 89 98</a>
            </div>
            <div className="text-center p-6 rounded-2xl border border-amber-900/30">
              <Mail className="h-8 w-8 mx-auto mb-3" style={{color: '#d4af37'}} />
              <div className="text-white font-semibold mb-1">Email</div>
              <a href="mailto:contact@mschauffeur.fr" className="text-gray-400 text-sm hover:text-amber-400">contact@mschauffeur.fr</a>
            </div>
            <div className="text-center p-6 rounded-2xl border border-amber-900/30">
              <MapPin className="h-8 w-8 mx-auto mb-3" style={{color: '#d4af37'}} />
              <div className="text-white font-semibold mb-1">Zone</div>
              <div className="text-gray-400 text-sm">Côte d'Azur & PACA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-amber-900/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Majestic South" className="h-10 w-10 object-contain" />
              <div>
                <div className="font-bold text-sm tracking-widest" style={{color: '#d4af37'}}>MAJESTIC SOUTH</div>
                <div className="text-xs text-gray-500 tracking-widest uppercase">Chauffeurs</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 Majestic South Chauffeurs. Tous droits réservés.
            </div>
            <div className="flex gap-6">
              <button onClick={() => setLocation('/login')} className="text-sm text-gray-400 hover:text-amber-400">Connexion</button>
              <button onClick={() => setLocation('/register')} className="text-sm text-gray-400 hover:text-amber-400">Inscription</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
