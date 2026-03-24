import { useState, useCallback } from 'react';
import { useLocation } from "wouter";
import { MapPin, Users, CheckCircle, ChevronRight, ChevronLeft, Car, Calendar, Clock, Phone, Mail, User, Shield, Star, Plane, Briefcase, Sparkles, Timer, Compass, MoreHorizontal, Route, Plus, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AddressAutocomplete, { calculateRouteGoogle } from "@/components/AddressAutocomplete";

const GOLD = "#C9A84C";
const DARK = "#0a0a0a";

type Step = 1 | 2 | 3;

interface StopPoint {
  address: string;
  time: string;
  lat?: number;
  lng?: number;
}

interface BookingData {
  origin: string;
  originLat?: number;
  originLng?: number;
  destination: string;
  destLat?: number;
  destLng?: number;
  stops: StopPoint[];
  date: string;
  time: string;
  returnDate: string;
  returnTime: string;
  isRoundTrip: boolean;
  serviceType: string;
  passengers: number;
  luggage: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flightNumber: string;
  specialRequests: string;
  vehicleType: string;
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
  {
    value: "berline",
    label: "Berline Luxe",
    example: "Mercedes Classe E / BMW Série 5",
    capacity: "1–3 passagers",
    desc: "Confort premium pour vos déplacements professionnels et privés.",
  },
  {
    value: "van",
    label: "Van Premium",
    example: "Mercedes Vito / V-Class",
    capacity: "1–7 passagers",
    desc: "Idéal pour les groupes et les bagages volumineux.",
  },
  {
    value: "suv",
    label: "SUV Prestige",
    example: "BMW X5 / Mercedes GLE",
    capacity: "1–4 passagers",
    desc: "Allure sportive et habitacle spacieux.",
  },
  {
    value: "classe_s",
    label: "Classe S — Grand Luxe",
    example: "Mercedes Classe S",
    capacity: "1–3 passagers",
    desc: "L'excellence absolue pour vos occasions les plus importantes.",
  },
];

const SERVICE_LABELS: Record<string, string> = {
  airport: 'Transfert aéroport',
  business: "Voyage d'affaires",
  event: 'Événement privé',
  disposal: 'Mise à disposition',
  tourism: 'Tourisme & excursion',
  other: 'Autre demande',
};

const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm";

export default function BookingForm() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const [data, setData] = useState<BookingData>({
    origin: '', originLat: undefined, originLng: undefined,
    destination: '', destLat: undefined, destLng: undefined,
    stops: [],
    date: '', time: '', returnDate: '', returnTime: '',
    isRoundTrip: false, serviceType: 'airport',
    passengers: 1, luggage: 0,
    firstName: '', lastName: '', email: '', phone: '',
    flightNumber: '', specialRequests: '',
    vehicleType: 'berline',
  });

  const submitBooking = trpc.booking.submit.useMutation({
    onSuccess: (result) => { setRefNumber(result.refNumber); setSubmitted(true); },
    onError: (err) => alert('Erreur lors de l\'envoi : ' + err.message),
  });

  const update = (field: keyof BookingData, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const computeRoute = useCallback(async (origin: string, dest: string) => {
    if (!origin || !dest || origin.length < 5 || dest.length < 5) return;
    setIsCalculatingRoute(true);
    try {
      const result = await calculateRouteGoogle(origin, dest);
      if (result) setRouteInfo({ distanceText: result.distanceText, durationText: result.durationText });
    } finally { setIsCalculatingRoute(false); }
  }, []);

  const handleOriginChange = (value: string, lat?: number, lng?: number) => {
    setData(prev => ({ ...prev, origin: value, originLat: lat, originLng: lng }));
    if (lat && data.destination) computeRoute(value, data.destination);
  };

  const handleDestChange = (value: string, lat?: number, lng?: number) => {
    setData(prev => ({ ...prev, destination: value, destLat: lat, destLng: lng }));
    if (lat && data.origin) computeRoute(data.origin, value);
  };

  const addStop = () => setData(prev => ({ ...prev, stops: [...prev.stops, { address: '', time: '' }] }));
  const removeStop = (i: number) => setData(prev => ({ ...prev, stops: prev.stops.filter((_, idx) => idx !== i) }));
  const updateStop = (i: number, field: keyof StopPoint, value: string, lat?: number, lng?: number) => {
    setData(prev => {
      const stops = [...prev.stops];
      stops[i] = { ...stops[i], [field]: value, ...(lat ? { lat } : {}), ...(lng ? { lng } : {}) };
      return { ...prev, stops };
    });
  };

  const handleSubmit = () => {
    if (!data.email || !data.phone) { alert('Veuillez renseigner votre email et téléphone.'); return; }
    if (!data.origin || !data.destination) { alert('Veuillez renseigner les adresses de départ et d\'arrivée.'); return; }
    const stopsText = data.stops.length > 0
      ? '\n' + data.stops.map((s, i) => `Étape ${i + 1} : ${s.address}${s.time ? ' à ' + s.time : ''}`).join('\n')
      : '';
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
      specialRequests: (data.specialRequests || '') + stopsText || undefined,
      vehicleCategory: VEHICLE_TYPES.find(v => v.value === data.vehicleType)?.label,
    });
  };

  const STEPS = [
    { n: 1, label: "Trajet", icon: MapPin },
    { n: 2, label: "Passagers", icon: Users },
    { n: 3, label: "Confirmation", icon: CheckCircle },
  ];

  // ─── Page de succès ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: DARK }}>
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)` }}>
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Demande envoyée !</h1>
          {refNumber && <p className="text-sm font-semibold mb-3" style={{ color: GOLD }}>Référence n°{refNumber}</p>}
          <p className="text-gray-400 mb-2 text-sm">Votre demande a bien été reçue. Un email de confirmation vous a été envoyé à <strong className="text-white">{data.email}</strong>.</p>
          <p className="text-gray-400 mb-8 text-sm">Notre équipe vous contactera dans les <strong className="text-white">30 minutes</strong> avec votre devis personnalisé.</p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2.5">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Départ</span><span className="text-white font-medium text-right max-w-[60%]">{data.origin}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Arrivée</span><span className="text-white font-medium text-right max-w-[60%]">{data.destination}</span></div>
            {data.stops.length > 0 && <div className="flex justify-between text-sm"><span className="text-gray-400">Étapes</span><span className="text-white">{data.stops.length} arrêt(s)</span></div>}
            <div className="flex justify-between text-sm"><span className="text-gray-400">Date</span><span className="text-white">{data.date} à {data.time}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Passagers</span><span className="text-white">{data.passengers}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Véhicule souhaité</span><span className="text-white">{VEHICLE_TYPES.find(v => v.value === data.vehicleType)?.label}</span></div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setLocation("/")} className="flex-1 py-3 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all">
              Retour à l'accueil
            </button>
            <button onClick={() => { setSubmitted(false); setStep(1); setData({ origin: '', originLat: undefined, originLng: undefined, destination: '', destLat: undefined, destLng: undefined, stops: [], date: '', time: '', returnDate: '', returnTime: '', isRoundTrip: false, serviceType: 'airport', passengers: 1, luggage: 0, firstName: '', lastName: '', email: '', phone: '', flightNumber: '', specialRequests: '', vehicleType: 'berline' }); setRouteInfo(null); }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#1a1a2e] transition-all" style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)` }}>
              Nouvelle réservation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: DARK }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Majestic South" className="h-8 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div>
              <div className="font-bold text-xs tracking-widest" style={{ color: GOLD }}>MAJESTIC SOUTH</div>
              <div className="text-xs text-gray-500">Réservation en ligne</div>
            </div>
          </button>
          {/* Étapes */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${step >= s.n ? 'text-[#1a1a2e]' : 'text-gray-500 bg-white/5'}`}
                  style={step >= s.n ? { background: `linear-gradient(135deg, ${GOLD}, #a07830)` } : {}}>
                  <s.icon className="h-3 w-3" />
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-gray-600 mx-0.5" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── STEP 1 : Trajet ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Votre trajet</h1>
              <p className="text-gray-400 text-sm">Indiquez votre point de départ et d'arrivée</p>
            </div>

            {/* Type de service */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Type de service</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SERVICE_TYPES.map((st) => (
                  <button key={st.value} type="button" onClick={() => update("serviceType", st.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${data.serviceType === st.value ? 'border-[#C9A84C] bg-[#C9A84C]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                    <st.Icon className="h-5 w-5 mb-2" style={{ color: data.serviceType === st.value ? GOLD : '#9ca3af' }} />
                    <div className={`text-xs font-semibold ${data.serviceType === st.value ? 'text-[#C9A84C]' : 'text-white'}`}>{st.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Adresses avec Google Maps */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Adresse de départ *
                </label>
                <AddressAutocomplete
                  value={data.origin}
                  onChange={handleOriginChange}
                  placeholder="Ex: Aéroport Nice Côte d'Azur, Terminal 1"
                  darkMode={true}
                  clearable={true}
                  id="origin"
                />
              </div>

              {/* Étapes intermédiaires */}
              {data.stops.map((stop, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                      Étape {i + 1}
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <AddressAutocomplete
                          value={stop.address}
                          onChange={(v, lat, lng) => updateStop(i, 'address', v, lat, lng)}
                          placeholder={`Adresse de l'étape ${i + 1}`}
                          darkMode={true}
                          clearable={true}
                        />
                      </div>
                      <input
                        type="time"
                        value={stop.time}
                        onChange={e => updateStop(i, 'time', e.target.value)}
                        className="w-28 px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                        placeholder="Heure"
                      />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeStop(i)} className="mt-6 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button type="button" onClick={addStop}
                className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-all w-full justify-center">
                <Plus className="h-3.5 w-3.5" /> Ajouter une étape intermédiaire
              </button>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Adresse d'arrivée *
                </label>
                <AddressAutocomplete
                  value={data.destination}
                  onChange={handleDestChange}
                  placeholder="Ex: Hôtel Martinez, Cannes"
                  darkMode={true}
                  clearable={true}
                  id="destination"
                />
              </div>
            </div>

            {/* Affichage distance/durée estimée */}
            {isCalculatingRoute && (
              <div className="flex items-center gap-2 text-sm text-gray-400 p-3 bg-white/5 rounded-xl">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: GOLD }} />
                Calcul de l'itinéraire...
              </div>
            )}
            {routeInfo && !isCalculatingRoute && (
              <div className="flex items-center gap-4 p-3 bg-white/5 border border-[#C9A84C]/20 rounded-xl">
                <Route className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                <div className="text-sm text-white">
                  <span className="font-semibold">{routeInfo.distanceText}</span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className="text-gray-300">{routeInfo.durationText} environ</span>
                </div>
                <span className="ml-auto text-xs text-gray-500">Devis personnalisé sous 30 min</span>
              </div>
            )}

            {/* Date & Heure */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" style={{ color: GOLD }} /> Date *
                </label>
                <input type="date" value={data.date} onChange={e => update("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" style={{ color: GOLD }} /> Heure *
                </label>
                <input type="time" value={data.time} onChange={e => update("time", e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Aller-retour */}
            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer" onClick={() => update("isRoundTrip", !data.isRoundTrip)}>
              <input type="checkbox" checked={data.isRoundTrip} onChange={() => {}} className="w-4 h-4 accent-[#C9A84C]" />
              <div>
                <div className="text-sm text-white font-medium">Aller-retour</div>
                <div className="text-xs text-gray-500">Ajouter un trajet retour</div>
              </div>
            </div>
            {data.isRoundTrip && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Date de retour</label>
                  <input type="date" value={data.returnDate} onChange={e => update("returnDate", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Heure de retour</label>
                  <input type="time" value={data.returnTime} onChange={e => update("returnTime", e.target.value)} className={inputCls} />
                </div>
              </div>
            )}

            {/* Message devis */}
            <div className="flex items-start gap-3 p-4 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
              <div className="text-xs text-gray-300 leading-relaxed">
                <strong className="text-white">Devis gratuit et personnalisé</strong> — Notre équipe vous contactera dans les <strong className="text-[#C9A84C]">30 minutes</strong> avec le tarif exact pour votre trajet. Aucun engagement.
              </div>
            </div>

            <button type="button" onClick={() => setStep(2)}
              disabled={!data.origin || !data.destination || !data.date}
              className="w-full py-4 rounded-xl text-sm font-semibold text-[#1a1a2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)` }}>
              Continuer <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2 : Passagers & Contact ────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Vos informations</h1>
              <p className="text-gray-400 text-sm">Renseignez vos coordonnées et préférences</p>
            </div>

            {/* Récap trajet */}
            <div className="p-4 bg-white/5 border border-[#C9A84C]/20 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: GOLD }}>
                <Route className="h-3.5 w-3.5" /> Votre trajet
              </div>
              <div className="text-sm text-white font-medium">{data.origin}</div>
              {data.stops.map((s, i) => (
                <div key={i} className="text-xs text-gray-400 pl-2">↓ Étape {i + 1} : {s.address}{s.time ? ` à ${s.time}` : ''}</div>
              ))}
              <div className="text-sm text-white font-medium">{data.destination}</div>
              <div className="text-xs text-gray-400 mt-1">{data.date} à {data.time}{data.isRoundTrip ? ` · Retour le ${data.returnDate}` : ''}</div>
            </div>

            {/* Passagers & Bagages */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" style={{ color: GOLD }} /> Passagers
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => update("passengers", Math.max(1, data.passengers - 1))} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-lg">−</button>
                  <span className="text-xl font-bold text-white w-8 text-center">{data.passengers}</span>
                  <button type="button" onClick={() => update("passengers", Math.min(16, data.passengers + 1))} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-lg">+</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Bagages</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => update("luggage", Math.max(0, data.luggage - 1))} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-lg">−</button>
                  <span className="text-xl font-bold text-white w-8 text-center">{data.luggage}</span>
                  <button type="button" onClick={() => update("luggage", Math.min(20, data.luggage + 1))} className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-lg">+</button>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" style={{ color: GOLD }} /> Prénom *
                </label>
                <input type="text" value={data.firstName} onChange={e => update("firstName", e.target.value)} placeholder="Jean" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Nom</label>
                <input type="text" value={data.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Dupont" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" style={{ color: GOLD }} /> Email *
                </label>
                <input type="email" value={data.email} onChange={e => update("email", e.target.value)} placeholder="jean@email.com" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" style={{ color: GOLD }} /> Téléphone *
                </label>
                <input type="tel" value={data.phone} onChange={e => update("phone", e.target.value)} placeholder="+33 6 00 00 00 00" className={inputCls} />
              </div>
            </div>
            {data.serviceType === "airport" && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Plane className="h-3.5 w-3.5" style={{ color: GOLD }} /> Numéro de vol (optionnel)
                </label>
                <input type="text" value={data.flightNumber} onChange={e => update("flightNumber", e.target.value)} placeholder="Ex: AF1234" className={inputCls} />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Demandes spéciales (optionnel)</label>
              <textarea value={data.specialRequests} onChange={e => update("specialRequests", e.target.value)}
                placeholder="Siège enfant, eau minérale, musique d'ambiance, accueil avec panneau..." rows={3}
                className={`${inputCls} resize-none`} />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Retour
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!data.firstName || !data.phone || !data.email}
                className="flex-1 py-4 rounded-xl text-sm font-semibold text-[#1a1a2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)` }}>
                Continuer <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 : Véhicule & Confirmation ────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Votre véhicule</h1>
              <p className="text-gray-400 text-sm">Choisissez votre catégorie de véhicule</p>
            </div>

            {/* Sélection véhicule */}
            <div className="space-y-2">
              {VEHICLE_TYPES.map((vt) => (
                <button key={vt.value} type="button" onClick={() => update("vehicleType", vt.value)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${data.vehicleType === vt.value ? 'border-[#C9A84C] bg-[#C9A84C]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <Car className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: data.vehicleType === vt.value ? GOLD : '#9ca3af' }} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${data.vehicleType === vt.value ? 'text-[#C9A84C]' : 'text-white'}`}>{vt.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{vt.example} · {vt.capacity}</div>
                    <div className="text-xs text-gray-500 mt-1">{vt.desc}</div>
                  </div>
                  {data.vehicleType === vt.value && <CheckCircle className="h-5 w-5 text-[#C9A84C] flex-shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>

            {/* Récapitulatif complet */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-2.5">
              <h3 className="text-sm font-semibold text-white mb-3">Récapitulatif de votre demande</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2"><span className="text-gray-400 flex-shrink-0">Départ</span><span className="text-white text-right">{data.origin}</span></div>
                {data.stops.map((s, i) => (
                  <div key={i} className="flex justify-between gap-2"><span className="text-gray-400 flex-shrink-0">Étape {i + 1}</span><span className="text-white text-right">{s.address}{s.time ? ` à ${s.time}` : ''}</span></div>
                ))}
                <div className="flex justify-between gap-2"><span className="text-gray-400 flex-shrink-0">Arrivée</span><span className="text-white text-right">{data.destination}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Date & heure</span><span className="text-white">{data.date} à {data.time}</span></div>
                {data.isRoundTrip && <div className="flex justify-between"><span className="text-gray-400">Retour</span><span className="text-white">{data.returnDate} à {data.returnTime}</span></div>}
                <div className="flex justify-between"><span className="text-gray-400">Passagers</span><span className="text-white">{data.passengers}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bagages</span><span className="text-white">{data.luggage}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Véhicule</span><span className="text-white">{VEHICLE_TYPES.find(v => v.value === data.vehicleType)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Contact</span><span className="text-white">{data.firstName} {data.lastName}</span></div>
                {data.flightNumber && <div className="flex justify-between"><span className="text-gray-400">Vol</span><span className="text-white">{data.flightNumber}</span></div>}
              </div>
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20">
                  <Shield className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                  <div className="text-xs text-gray-300">
                    <strong className="text-white">Devis personnalisé sous 30 minutes</strong> — Notre équipe vous contactera par email et téléphone avec le tarif exact pour votre trajet.
                  </div>
                </div>
              </div>
            </div>

            {/* Garanties */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Devis gratuit", sub: "Sans engagement" },
                { icon: Star, label: "Service 5★", sub: "Chauffeurs certifiés" },
                { icon: CheckCircle, label: "Réponse rapide", sub: "Sous 30 minutes" },
              ].map((g) => (
                <div key={g.label} className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                  <g.icon className="h-5 w-5 mx-auto mb-1" style={{ color: GOLD }} />
                  <div className="text-xs font-medium text-white">{g.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{g.sub}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Retour
              </button>
              <button type="button" onClick={handleSubmit} disabled={submitBooking.isPending}
                className="flex-1 py-4 rounded-xl text-sm font-semibold text-[#1a1a2e] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)` }}>
                {submitBooking.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</> : <><CheckCircle className="h-4 w-4" /> Envoyer ma demande</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
