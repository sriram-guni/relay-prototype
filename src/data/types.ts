export type DormArea = 'ISR' | 'FAR' | 'PAR' | 'Ikenberry';
export type Category = 'Fridge' | 'Lamp' | 'Fan' | 'Storage' | 'Microwave';
export type Condition = 'Like new' | 'Very good' | 'Good' | 'Well loved';

/** Art variants map to hand-drawn product illustrations in src/art. */
export type ArtKind =
  | 'mini-fridge'
  | 'fridge-freezer'
  | 'desk-lamp'
  | 'clip-lamp'
  | 'desk-fan'
  | 'tower-fan'
  | 'drawer-tower'
  | 'rolling-cart'
  | 'desk-caddy'
  | 'under-desk-drawers'
  | 'microwave';

export interface Art {
  kind: ArtKind;
  /** Main body color of the object */
  body: string;
  /** Backdrop tint of the studio scene */
  backdrop: string;
}

export interface Seller {
  id: string;
  name: string;
  initials: string;
  rating: number;
  handoffs: number;
  dorm: DormArea;
  hall: string;
  /** Simulated — e.g. "Junior · Moving to an apartment" */
  note: string;
  avatarColor: string;
}

export interface Listing {
  id: string;
  title: string;
  category: Category;
  price: number; // 0 = Free
  dorm: DormArea;
  hall: string;
  condition: Condition;
  description: string;
  sellerId: string;
  relayChecked: boolean;
  art: Art;
  /** Local object URL when a student uploads their own photo. */
  photoUrl?: string;
  /** Cleaning steps the seller confirmed (all required steps for published items). */
  cleaning: string[];
  postedLabel: string;
  isOwn?: boolean;
}

export type ClaimStatus = 'Reserved' | 'Picked up' | 'Complete';

export interface Claim {
  id: string;
  listingId: string;
  moveInDate: string; // ISO yyyy-mm-dd, fixed in August 2027
  status: ClaimStatus;
  rating?: number;
}
