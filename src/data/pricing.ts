import type { Category, Condition, Listing } from './types';

/**
 * Prototype price-suggestion engine.
 * Combines a typical used-market base price per category, a condition
 * multiplier, keyword signals from the seller's title/description, and
 * comparable live listings on Relay. All numbers are illustrative.
 */

/** Typical used price (USD) for a "Good" item in each category. */
const BASE: Record<Category, number> = {
  Fridge: 40,
  Microwave: 25,
  Fan: 14,
  Lamp: 10,
  Storage: 15,
};

const CONDITION_MULT: Record<Condition, number> = {
  'Like new': 1.25,
  'Very good': 1.1,
  Good: 1,
  'Well loved': 0.7,
};

interface Signal {
  re: RegExp;
  mult: number;
  reason: string;
}

const SIGNALS: Signal[] = [
  { re: /freezer|two[- ]door|2[- ]door/i, mult: 1.3, reason: 'Has a freezer compartment' },
  { re: /\b(4|4\.\d|5|3\.\d)\s*(cu|cubic)/i, mult: 1.15, reason: 'Larger capacity' },
  { re: /energy star|inverter|quiet|silent/i, mult: 1.08, reason: 'Quiet / efficient' },
  { re: /usb|dimmable|remote|timer|oscillat/i, mult: 1.08, reason: 'Extra features' },
  { re: /new in box|unopened|barely used|used once/i, mult: 1.12, reason: 'Barely used' },
  { re: /scratch|dent|scuff|stain|crack|chip/i, mult: 0.88, reason: 'Cosmetic wear mentioned' },
  { re: /broken|doesn.?t work|missing|needs repair/i, mult: 0.5, reason: 'Functional issue mentioned' },
  { re: /\b(4|5|6)\+?\s*(years?|yrs?)\b/i, mult: 0.85, reason: 'Older item' },
];

export interface PriceSuggestion {
  suggested: number;
  low: number;
  high: number;
  /** Price likely to be claimed within the first day of move-in. */
  quickSale: number;
  reasons: string[];
  comps: Listing[];
}

const round = (n: number) => Math.max(1, Math.round(n));

export function suggestPrice(input: {
  category: Category;
  condition: Condition;
  title: string;
  description: string;
  listings: Listing[];
}): PriceSuggestion {
  const { category, condition, title, description, listings } = input;
  const text = `${title} ${description}`;
  const reasons: string[] = [`${condition} condition`];

  let model = BASE[category] * CONDITION_MULT[condition];
  for (const s of SIGNALS) {
    if (s.re.test(text)) {
      model *= s.mult;
      reasons.push(s.reason);
    }
  }

  // Comparable paid listings in the same category, closest condition first.
  const order: Condition[] = ['Like new', 'Very good', 'Good', 'Well loved'];
  const comps = listings
    .filter((l) => l.category === category && l.price > 0 && !l.isOwn)
    .sort((a, b) => Math.abs(order.indexOf(a.condition) - order.indexOf(condition)) - Math.abs(order.indexOf(b.condition) - order.indexOf(condition)))
    .slice(0, 3);

  let suggested = model;
  if (comps.length) {
    // Normalise each comp to the seller's condition, then blend 60/40 with the model.
    const compAvg =
      comps.reduce((sum, c) => sum + c.price * (CONDITION_MULT[condition] / CONDITION_MULT[c.condition]), 0) / comps.length;
    suggested = model * 0.6 + compAvg * 0.4;
    reasons.push(`${comps.length} similar ${comps.length === 1 ? 'listing' : 'listings'} on Relay`);
  }

  return {
    suggested: round(suggested),
    low: round(suggested * 0.8),
    high: round(suggested * 1.2),
    quickSale: round(suggested * 0.85),
    reasons,
    comps,
  };
}

/* ---------------- bargaining ---------------- */

export type OfferReply =
  | { kind: 'accept'; price: number; text: string }
  | { kind: 'counter'; price: number; text: string }
  | { kind: 'decline'; text: string };

/**
 * Simulated seller response. The seller's hidden floor is ~70% of list price;
 * they meet buyers part-way and soften a little each round.
 */
export function sellerReply(listPrice: number, offer: number, round: number, lastCounter?: number): OfferReply {
  const floor = Math.ceil(listPrice * 0.7);
  const ceiling = lastCounter ?? listPrice;
  if (offer >= ceiling || offer >= listPrice * 0.92) return { kind: 'accept', price: Math.min(offer, ceiling), text: 'Deal! It’s yours at that price.' };
  if (offer < listPrice * 0.5) return { kind: 'decline', text: `That’s a bit low for me. I could go down to around $${Math.ceil(listPrice * 0.8)}.` };
  if (round >= 3) {
    return offer >= floor
      ? { kind: 'accept', price: offer, text: 'Okay, you drive a hard bargain. Deal.' }
      : { kind: 'counter', price: floor, text: `$${floor} is my lowest. Final offer.` };
  }
  // Meet in the middle, never below the floor, and always below the last counter.
  const counter = Math.min(ceiling - 1, Math.max(floor, Math.round((offer + ceiling) / 2)));
  if (counter <= offer) return { kind: 'accept', price: offer, text: 'Sure, that works.' };
  return { kind: 'counter', price: counter, text: `How about $${counter}? It’s ${round === 1 ? 'been well looked after' : 'cleaned and ready to go'}.` };
}
