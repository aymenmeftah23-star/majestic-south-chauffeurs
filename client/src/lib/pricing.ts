// ─── Moteur de tarification Majestic South Chauffeurs ─────────────────────
// Usage INTERNE uniquement — ne jamais afficher les calculs détaillés au client

export type VehicleCategory = 'berline' | 'vito' | 'classe_v' | 'classe_s' | 'minibus';

export interface PricingResult {
  priceHT: number;       // Prix HT arrondi
  priceTTC: number;      // Prix TTC arrondi
  vatRate: number;       // 10 ou 20
  vatAmount: number;     // Montant TVA
  distanceKm: number;    // Distance en km
  ratePerKm: number;     // Tarif appliqué au km
  isForfait: boolean;    // Vrai si forfait courte distance
  breakdown: string;     // Détail du calcul (interne)
}

// ─── Forfaits courte distance (≤ 15 km) ───────────────────────────────────
const FORFAITS: Record<VehicleCategory, number> = {
  berline:  55,
  vito:     65,
  classe_v: 80,
  classe_s: 90,
  minibus:  120,
};

// ─── Tarifs kilométriques de base ──────────────────────────────────────────
const RATE_PER_KM: Record<VehicleCategory, number> = {
  berline:  2.50,
  vito:     3.00,
  classe_v: 3.00,
  classe_s: 3.50,
  minibus:  3.50,
};

// ─── Dégressivité selon la distance ───────────────────────────────────────
function getDiscount(distanceKm: number): number {
  if (distanceKm <= 50)  return 0;
  if (distanceKm <= 150) return 0.10; // −10%
  if (distanceKm <= 300) return 0.15; // −15%
  return 0.20;                         // −20%
}

// ─── Calcul principal ──────────────────────────────────────────────────────
export function calculatePrice(
  distanceKm: number,
  vehicleCategory: VehicleCategory,
  serviceType: 'transfert' | 'mise_a_disposition' = 'transfert'
): PricingResult {
  const vatRate = serviceType === 'mise_a_disposition' ? 20 : 10;
  const forfait = FORFAITS[vehicleCategory];
  const baseRate = RATE_PER_KM[vehicleCategory];
  const FORFAIT_DISTANCE = 15; // km

  let priceTTC: number;
  let isForfait: boolean;
  let ratePerKm: number;
  let breakdown: string;

  if (distanceKm <= FORFAIT_DISTANCE) {
    // Forfait courte distance
    priceTTC = forfait;
    isForfait = true;
    ratePerKm = 0;
    breakdown = `Forfait ${vehicleCategory} (≤${FORFAIT_DISTANCE}km) = ${forfait}€ TTC`;
  } else {
    // Tarif kilométrique avec dégressivité
    const discount = getDiscount(distanceKm);
    ratePerKm = parseFloat((baseRate * (1 - discount)).toFixed(3));
    const rawPrice = distanceKm * ratePerKm;
    // Appliquer le forfait comme minimum
    priceTTC = Math.max(rawPrice, forfait);
    isForfait = false;
    breakdown = `${distanceKm}km × ${ratePerKm}€/km${discount > 0 ? ` (−${discount * 100}%)` : ''} = ${rawPrice.toFixed(2)}€ TTC`;
  }

  // Arrondir au 0.50€ supérieur
  priceTTC = Math.ceil(priceTTC * 2) / 2;

  const priceHT = parseFloat((priceTTC / (1 + vatRate / 100)).toFixed(2));
  const vatAmount = parseFloat((priceTTC - priceHT).toFixed(2));

  return {
    priceHT,
    priceTTC,
    vatRate,
    vatAmount,
    distanceKm,
    ratePerKm,
    isForfait,
    breakdown,
  };
}

// ─── Prix indicatif minimum (affiché au client) ────────────────────────────
export function getMinimumPriceLabel(vehicleCategory: VehicleCategory): string {
  return `À partir de ${FORFAITS[vehicleCategory]} €`;
}

// ─── Mapping nom de véhicule → catégorie ──────────────────────────────────
export function vehicleNameToCategory(name: string): VehicleCategory {
  const n = name.toLowerCase();
  if (n.includes('classe s') || n.includes('class s') || n.includes('s500') || n.includes('s350')) return 'classe_s';
  if (n.includes('classe v') || n.includes('class v') || n.includes('v-class') || n.includes('v class')) return 'classe_v';
  if (n.includes('vito') || n.includes('sprinter') || n.includes('viano')) return 'vito';
  if (n.includes('minibus') || n.includes('bus')) return 'minibus';
  return 'berline'; // défaut : Classe E, BMW Série 5, etc.
}

// ─── Labels pour l'affichage ───────────────────────────────────────────────
export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  berline:  'Berline (Classe E / BMW Série 5)',
  vito:     'Van (Vito / Viano)',
  classe_v: 'Classe V (Grand Van)',
  classe_s: 'Classe S (Prestige)',
  minibus:  'Minibus',
};
