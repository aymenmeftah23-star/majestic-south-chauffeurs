import { useState } from "react";
import { useLocation } from "wouter";
import { MapPin, Users, CheckCircle, ChevronRight, ChevronLeft, Car, Calendar, Clock, Phone, Mail, User, CreditCard, Shield, Star, Plane, Briefcase, Sparkles, Timer, Compass, MoreHorizontal } from "lucide-react";
import { trpc } from "@/lib/trpc";

const GOLD = "#C9A84C";
const DARK = "#0a0a0a";

type Step = 1 | 2 | 3;

interface BookingData {
  // Step 1 - Trajet
  origin: string;
  destination: string;
  date: string;
  time: string;
  returnDate: string;
  returnTime: string;
  isRoundTrip: boolean;
  serviceType: string;
  // Step 2 - Passagers
  passengers: number;
  luggage: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flightNumber: string;
  specialRequests: string;
  // Step 3 - Confirmation
  vehicleType: string;
  paymentMethod: string;
}

const SERVICE_TYPES = [
  { value: "airport", label: "Transfert Aéroport", Icon: Plane, desc: "CDG, Orly, Nice, Lyon..." },
  { value: "business", label: "Voyage d'Affaires", Icon: Briefcase, desc: "Réunions, conférences" },
  { value: "event", label: "Événement Privé", Icon: Sparkles, desc: "Mariage, gala, soirée" },
  { value: "disposal", label: "Mise à Disposition", Icon: Timer, desc: "À l'heure ou à la journée" },
  { value: "tourism", label: "Tourisme & Excursion", Icon: Compass, desc: "Visites, circuits" },
  { value: "other", label: "Autre", Icon: MoreHorizontal, desc: "Toute autre demande" },
];

const VEHICLE_TYPES = [
  { value: "berline", label: "Berline Luxe", Icon: Car, capacity: "1-3 passagers", example: "Mercedes Classe E / BMW Série 5", price: "À partir de 80€" },
  { value: "van", label: "Van Premium", Icon: Car, capacity: "1-7 passagers", example: "Mercedes Vito / V-Class", price: "À partir de 120€" },
  { value: "suv", label: "SUV Prestige", Icon: Car, capacity: "1-4 passagers", example: "BMW X5 / Mercedes GLE", price: "À partir de 100€" },
  { value: "minibus", label: "Minibus VIP", Icon: Users, capacity: "8-16 passagers", example: "Mercedes Sprinter", price: "À partir de 180€" },
];

export default function BookingForm() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<BookingData>({
    origin: "", destination: "", date: "", time: "", returnDate: "", returnTime: "",
    isRoundTrip: false, serviceType: "airport",
    passengers: 1, luggage: 0, firstName: "", lastName: "", email: "", phone: "",
    flightNumber: "", specialRequests: "",
    vehicleType: "berline", paymentMethod: "card",
  });

  const [refNumber, setRefNumber] = useState<string>('');
  const submitBooking = trpc.booking.submit.useMutation({
    onSuccess: (result) => {
      setRefNumber(result.refNumber);
      setSubmitted(true);
    },
  });

  const update = (field: keyof BookingData, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const SERVICE_LABELS: Record<string, string> = {
    airport: 'Transfert aéroport',
    business: 'Voyage d\'affaires',
    event: 'Événement privé',
    disposal: 'Mise à disposition',
    tourism: 'Tourisme & excursion',
    other: 'Autre demande',
  };

  const handleSubmit = () => {
    if (!data.email || !data.phone) {
      alert('Veuillez renseigner votre email et téléphone.');
      return;
    }
    submitBooking.mutate({
      clientName: `${data.firstName} ${data.lastName}`.trim() || 'Client',
      clientEmail: data.email,
      clientPhone: data.phone,
      serviceType: SERVICE_LABELS[data.serviceType] || data.serviceType,
      origin: data.origin,
      destination: data.destination,
      date: data.date,
      time: data.time || '12:00',
      passengers: data.passengers,
      luggage: data.luggage,
      flightNumber: data.flightNumber || undefined,
      specialRequests: data.specialRequests || undefined,
      vehicleCategory: VEHICLE_TYPES.find(v => v.value === data.vehicleType)?.label,
    });
  };

  const STEPS = [
    { n: 1, label: "Trajet", icon: MapPin },
    { n: 2, label: "Passagers", icon: Users },
    { n: 3, label: "Confirmation", icon: CheckCircle },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: DARK }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}>
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Demande envoyée !</h1>
          {refNumber && <p className="text-sm font-semibold mb-2" style={{ color: GOLD }}>Référence n°{refNumber}</p>}
          <p className="text-gray-400 mb-2">Votre demande de réservation a bien été reçue. Un email de confirmation vous a été envoyé.</p>
          <p className="text-gray-400 mb-8">Nous vous contacterons dans les plus brefs délais pour confirmer votre trajet.</p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Trajet</span><span className="text-white font-medium">{data.origin} → {data.destination}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Date</span><span className="text-white font-medium">{data.date} à {data.time}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Passagers</span><span className="text-white font-medium">{data.passengers}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Véhicule</span><span className="text-white font-medium">{VEHICLE_TYPES.find(v => v.value === data.vehicleType)?.label}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setLocation("/client-portal")} className="flex-1 py-3 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all">Mon espace</button>
            <button onClick={() => { setSubmitted(false); setStep(1); setData({ origin: "", destination: "", date: "", time: "", returnDate: "", returnTime: "", isRoundTrip: false, serviceType: "airport", passengers: 1, luggage: 0, firstName: "", lastName: "", email: "", phone: "", flightNumber: "", specialRequests: "", vehicleType: "berline", paymentMethod: "card" }); }} className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#1a1a2e] transition-all" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}>Nouvelle réservation</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: DARK }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2">
            <img src="/logo.png" alt="Majestic South" className="h-8 w-8 object-contain" />
            <div>
              <div className="font-bold text-xs tracking-widest" style={{ color: GOLD }}>MAJESTIC SOUTH</div>
              <div className="text-xs text-gray-500">Réservation</div>
            </div>
          </button>
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className={"flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all " + (step >= s.n ? "text-[#1a1a2e]" : "text-gray-500 bg-white/5")} style={step >= s.n ? { background: "linear-gradient(135deg, #C9A84C, #a07830)" } : {}}>
                  <s.icon className="h-3 w-3" />
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-gray-600 mx-0.5" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step 1 - Trajet */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Votre trajet</h1>
              <p className="text-gray-400 text-sm">Indiquez votre point de départ et d'arrivée</p>
            </div>

            {/* Service Type */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Type de service</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SERVICE_TYPES.map((st) => (
                  <button key={st.value} onClick={() => update("serviceType", st.value)}
                    className={"p-3 rounded-xl border text-left transition-all " + (data.serviceType === st.value ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-white/10 bg-white/5 hover:border-white/20")}>
                    <st.Icon className="h-5 w-5 mb-2" style={{ color: data.serviceType === st.value ? GOLD : "#9ca3af" }} />
                    <div className={"text-xs font-semibold " + (data.serviceType === st.value ? "text-[#C9A84C]" : "text-white")}>{st.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Adresse de départ</label>
                <input type="text" value={data.origin} onChange={e => update("origin", e.target.value)} placeholder="Ex: Aéroport Nice Côte d'Azur, Terminal 1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Adresse d'arrivée</label>
                <input type="text" value={data.destination} onChange={e => update("destination", e.target.value)} placeholder="Ex: Hôtel Martinez, Cannes"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" style={{ color: GOLD }} />Date</label>
                <input type="date" value={data.date} onChange={e => update("date", e.target.value)} min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" style={{ color: GOLD }} />Heure</label>
                <input type="time" value={data.time} onChange={e => update("time", e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
            </div>

            {/* Round trip */}
            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
              <input type="checkbox" id="roundtrip" checked={data.isRoundTrip} onChange={e => update("isRoundTrip", e.target.checked)} className="w-4 h-4 accent-[#C9A84C]" />
              <label htmlFor="roundtrip" className="text-sm text-gray-300 cursor-pointer">Aller-retour</label>
            </div>
            {data.isRoundTrip && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Date de retour</label>
                  <input type="date" value={data.returnDate} onChange={e => update("returnDate", e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Heure de retour</label>
                  <input type="time" value={data.returnTime} onChange={e => update("returnTime", e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
                </div>
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!data.origin || !data.destination || !data.date}
              className="w-full py-4 rounded-xl text-sm font-semibold text-[#1a1a2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}>
              Continuer <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2 - Passagers */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Vos informations</h1>
              <p className="text-gray-400 text-sm">Renseignez vos coordonnées et préférences</p>
            </div>

            {/* Recap trajet */}
            <div className="p-4 bg-white/5 border border-[#C9A84C]/30 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-[#C9A84C] font-medium mb-2"><MapPin className="h-3.5 w-3.5" />Votre trajet</div>
              <div className="text-sm text-white">{data.origin} → {data.destination}</div>
              <div className="text-xs text-gray-400 mt-1">{data.date} à {data.time}</div>
            </div>

            {/* Passengers & Luggage */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block flex items-center gap-1.5"><Users className="h-3.5 w-3.5" style={{ color: GOLD }} />Passagers</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => update("passengers", Math.max(1, data.passengers - 1))} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-lg">−</button>
                  <span className="text-xl font-bold text-white w-8 text-center">{data.passengers}</span>
                  <button onClick={() => update("passengers", Math.min(16, data.passengers + 1))} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-lg">+</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Bagages</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => update("luggage", Math.max(0, data.luggage - 1))} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-lg">−</button>
                  <span className="text-xl font-bold text-white w-8 text-center">{data.luggage}</span>
                  <button onClick={() => update("luggage", Math.min(20, data.luggage + 1))} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-lg">+</button>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Prénom</label>
                <input type="text" value={data.firstName} onChange={e => update("firstName", e.target.value)} placeholder="Jean"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Nom</label>
                <input type="text" value={data.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Dupont"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" style={{ color: GOLD }} />Email</label>
                <input type="email" value={data.email} onChange={e => update("email", e.target.value)} placeholder="jean@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" style={{ color: GOLD }} />Téléphone</label>
                <input type="tel" value={data.phone} onChange={e => update("phone", e.target.value)} placeholder="+33 6 00 00 00 00"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
            </div>
            {data.serviceType === "airport" && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Numéro de vol (optionnel)</label>
                <input type="text" value={data.flightNumber} onChange={e => update("flightNumber", e.target.value)} placeholder="Ex: AF1234"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Demandes spéciales (optionnel)</label>
              <textarea value={data.specialRequests} onChange={e => update("specialRequests", e.target.value)} placeholder="Siège enfant, eau minérale, musique..." rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Retour
              </button>
              <button onClick={() => setStep(3)} disabled={!data.firstName || !data.phone}
                className="flex-1 py-4 rounded-xl text-sm font-semibold text-[#1a1a2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}>
                Continuer <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Confirmation</h1>
              <p className="text-gray-400 text-sm">Choisissez votre véhicule et confirmez</p>
            </div>

            {/* Vehicle selection */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Véhicule souhaité</label>
              <div className="space-y-2">
                {VEHICLE_TYPES.map((vt) => (
                  <button key={vt.value} onClick={() => update("vehicleType", vt.value)}
                    className={"w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 " + (data.vehicleType === vt.value ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-white/10 bg-white/5 hover:border-white/20")}>
                    <vt.Icon className="h-6 w-6 flex-shrink-0" style={{ color: data.vehicleType === vt.value ? GOLD : "#9ca3af" }} />
                    <div className="flex-1">
                      <div className={"font-semibold text-sm " + (data.vehicleType === vt.value ? "text-[#C9A84C]" : "text-white")}>{vt.label}</div>
                      <div className="text-xs text-gray-400">{vt.example} · {vt.capacity}</div>
                    </div>
                    <div className={"text-sm font-medium " + (data.vehicleType === vt.value ? "text-[#C9A84C]" : "text-gray-400")}>{vt.price}</div>
                    {data.vehicleType === vt.value && <CheckCircle className="h-5 w-5 text-[#C9A84C] flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-white mb-3">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Trajet</span><span className="text-white font-medium text-right max-w-[60%]">{data.origin} → {data.destination}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Date & heure</span><span className="text-white">{data.date} à {data.time}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Passagers</span><span className="text-white">{data.passengers}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bagages</span><span className="text-white">{data.luggage}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Véhicule</span><span className="text-white">{VEHICLE_TYPES.find(v => v.value === data.vehicleType)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Contact</span><span className="text-white">{data.firstName} {data.lastName}</span></div>
                {data.flightNumber && <div className="flex justify-between"><span className="text-gray-400">Vol</span><span className="text-white">{data.flightNumber}</span></div>}
              </div>
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="h-3.5 w-3.5 text-green-400" />
                  Devis gratuit · Annulation flexible · Paiement sécurisé
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Paiement sécurisé" },
                { icon: Star, label: "Service 5 étoiles" },
                { icon: CheckCircle, label: "Confirmation rapide" },
              ].map((g) => (
                <div key={g.label} className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                  <g.icon className="h-5 w-5 mx-auto mb-1.5" style={{ color: GOLD }} />
                  <div className="text-xs text-gray-400">{g.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Retour
              </button>
              <button onClick={handleSubmit} disabled={submitBooking.isPending}
                className="flex-1 py-4 rounded-xl text-sm font-semibold text-[#1a1a2e] transition-all disabled:opacity-70 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}>
                {submitBooking.isPending ? "Envoi en cours..." : "Confirmer la réservation"} <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
