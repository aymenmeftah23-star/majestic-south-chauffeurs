/**
 * Stripe Products Configuration
 * Define all products and prices for Majestic South Chauffeurs
 */

export const STRIPE_PRODUCTS = {
  // Standard ride - per km
  STANDARD_RIDE: {
    name: 'Standard Ride',
    description: 'Standard chauffeur service',
    pricePerKm: 2.50, // €2.50 per km
  },

  // Premium ride - per km
  PREMIUM_RIDE: {
    name: 'Premium Ride',
    description: 'Premium chauffeur service with luxury vehicle',
    pricePerKm: 4.50, // €4.50 per km
  },

  // Airport transfer - flat rate
  AIRPORT_TRANSFER: {
    name: 'Airport Transfer',
    description: 'Fixed rate airport transfer',
    price: 5000, // €50.00 in cents
  },

  // Event service - hourly
  EVENT_SERVICE: {
    name: 'Event Service',
    description: 'Hourly chauffeur service for events',
    pricePerHour: 6000, // €60.00 per hour in cents
  },

  // Corporate package - monthly subscription
  CORPORATE_PACKAGE: {
    name: 'Corporate Package',
    description: 'Monthly corporate chauffeur package',
    price: 299900, // €2,999.00 per month in cents
    interval: 'month',
  },

  // Premium membership - monthly
  PREMIUM_MEMBERSHIP: {
    name: 'Premium Membership',
    description: 'Premium member benefits and discounts',
    price: 9900, // €99.00 per month in cents
    interval: 'month',
  },
};

/**
 * Calculate ride price based on distance and type
 */
export function calculateRidePrice(
  type: 'standard' | 'premium',
  distanceKm: number
): number {
  const product = type === 'premium' ? STRIPE_PRODUCTS.PREMIUM_RIDE : STRIPE_PRODUCTS.STANDARD_RIDE;
  return Math.round(product.pricePerKm * distanceKm * 100); // Convert to cents
}

/**
 * Calculate event service price based on hours
 */
export function calculateEventPrice(hours: number): number {
  return STRIPE_PRODUCTS.EVENT_SERVICE.pricePerHour * hours;
}

/**
 * Format price for display (convert from cents to euros)
 */
export function formatPrice(priceCents: number): string {
  return `€${(priceCents / 100).toFixed(2)}`;
}
