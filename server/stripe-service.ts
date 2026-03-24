/**
 * Stripe Service - Majestic South Chauffeurs
 * Gestion des paiements en ligne (acompte ou paiement complet)
 */
import Stripe from 'stripe';
import { ENV } from './_core/env';

// Initialiser Stripe uniquement si la clé est disponible
let stripe: Stripe | null = null;

if (ENV.STRIPE_SECRET_KEY) {
  stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
  console.log('[Stripe] Service initialise.');
} else {
  console.warn('[Stripe] STRIPE_SECRET_KEY non definie - paiements desactives.');
}

export function getStripe(): Stripe | null {
  return stripe;
}

export function isStripeEnabled(): boolean {
  return stripe !== null;
}

// Créer une session de paiement Stripe Checkout
export async function createCheckoutSession(params: {
  missionId: number;
  missionNumber: string;
  amount: number; // en centimes (EUR)
  clientEmail?: string;
  clientName?: string;
  origin: string;
  destination: string;
  date: Date | string;
  type: 'acompte' | 'total'; // 30% d'acompte ou paiement complet
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string } | null> {
  if (!stripe) return null;

  const depositAmount = params.type === 'acompte'
    ? Math.round(params.amount * 0.3) // 30% d'acompte
    : params.amount;

  const dateStr = new Date(params.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: params.clientEmail,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Mission ${params.missionNumber}`,
            description: `${params.origin} → ${params.destination} · ${dateStr}${params.type === 'acompte' ? ' (acompte 30%)' : ''}`,
          },
          unit_amount: depositAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      missionId: String(params.missionId),
      missionNumber: params.missionNumber,
      paymentType: params.type,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

// Vérifier le statut d'une session Stripe
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;
  return stripe.checkout.sessions.retrieve(sessionId);
}

// Construire un événement webhook Stripe
export function constructWebhookEvent(
  payload: Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  if (!stripe) return null;
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error('[Stripe] Erreur webhook:', err);
    return null;
  }
}
