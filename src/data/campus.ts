import type { Category, Condition, DormArea } from './types';

export const DORM_AREAS: { id: DormArea; label: string; full: string; halls: string[]; pickup: string }[] = [
  {
    id: 'ISR',
    label: 'ISR',
    full: 'Illinois Street Residence Halls',
    halls: ['Townsend', 'Wardall'],
    pickup: 'ISR designated meeting area',
  },
  {
    id: 'FAR',
    label: 'FAR',
    full: 'Florida Avenue Residence Halls',
    halls: ['Oglesby', 'Trelease'],
    pickup: 'FAR designated meeting area',
  },
  {
    id: 'PAR',
    label: 'PAR',
    full: 'Pennsylvania Avenue Residence Halls',
    halls: ['Babcock', 'Blaisdell', 'Carr', 'Saunders'],
    pickup: 'PAR designated meeting area',
  },
  {
    id: 'Ikenberry',
    label: 'Ikenberry',
    full: 'Ikenberry Commons',
    halls: ['Bousfield', 'Hopkins', 'Nugent', 'Scott', 'Snyder', 'Taft-Van Doren', 'Wassaja', 'Weston'],
    pickup: 'Ikenberry Commons meeting area',
  },
];

export const dormInfo = (id: DormArea) => DORM_AREAS.find((d) => d.id === id)!;

export const CATEGORIES: Category[] = ['Fridge', 'Lamp', 'Fan', 'Storage', 'Microwave'];

export const CATEGORY_PLURAL: Record<Category, string> = {
  Fridge: 'Fridges',
  Lamp: 'Lamps',
  Fan: 'Fans',
  Storage: 'Storage',
  Microwave: 'Microwaves',
};

export const CONDITIONS: Condition[] = ['Like new', 'Very good', 'Good', 'Well loved'];

/** Category-specific cleaning steps a seller must confirm before publishing. */
export const CLEANING_STEPS: Record<Category, string[]> = {
  Fridge: ['Fully defrosted', 'Interior wiped clean', 'Shelves sanitized', 'No lingering odors', 'Cooling tested'],
  Microwave: ['Interior degreased', 'Turntable washed', 'Door seal wiped', 'No lingering odors', 'Heating tested'],
  Lamp: ['Dusted, shade included', 'Cord checked for damage', 'Bulb working', 'Switch tested'],
  Fan: ['Blades dusted', 'Grille wiped clean', 'Cord checked for damage', 'All speeds tested'],
  Storage: ['Wiped inside and out', 'Drawers emptied', 'Wheels and slides checked', 'No stickers or residue'],
};

/**
 * Hard-surface essentials only. Soft goods are excluded for hygiene reasons.
 * Matched as whole words against listing titles.
 */
export const RESTRICTED_WORDS = [
  'pillow',
  'pillows',
  'blanket',
  'blankets',
  'mattress',
  'mattresses',
  'topper',
  'comforter',
  'duvet',
  'bedding',
  'sheet',
  'sheets',
  'quilt',
  'towel',
  'towels',
  'rug',
  'cushion',
  'cushions',
  'plush',
  'futon',
  'beanbag',
  'clothes',
  'clothing',
];

export function findRestrictedWord(text: string): string | null {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return words.find((w) => RESTRICTED_WORDS.includes(w)) ?? null;
}

/** Fixed fictional Fall 2027 move-in window (never depends on today's date). */
export const MOVE_IN_DATES: { iso: string; weekday: string; day: number; tag?: string }[] = [
  { iso: '2027-08-18', weekday: 'Wed', day: 18, tag: 'Early' },
  { iso: '2027-08-19', weekday: 'Thu', day: 19 },
  { iso: '2027-08-20', weekday: 'Fri', day: 20 },
  { iso: '2027-08-21', weekday: 'Sat', day: 21 },
  { iso: '2027-08-22', weekday: 'Sun', day: 22 },
];

export function formatMoveIn(iso: string, long = false) {
  const d = MOVE_IN_DATES.find((m) => m.iso === iso);
  if (!d) return 'August 2027';
  const full: Record<string, string> = {
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
  };
  return long ? `${full[d.weekday]}, Aug ${d.day}, 2027` : `${d.weekday}, Aug ${d.day}`;
}

export const formatPrice = (p: number) => (p === 0 ? 'Free' : `$${p}`);
