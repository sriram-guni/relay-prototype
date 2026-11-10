import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { SEED_LISTINGS } from '../data/seed';
import type { Claim, Listing } from '../data/types';

export type Tab = 'discover' | 'list' | 'claims';

interface DataState {
  listings: Listing[];
  claims: Claim[];
}

type Action =
  | { type: 'claim'; listingId: string; moveInDate: string }
  | { type: 'pickup'; claimId: string }
  | { type: 'rate'; claimId: string; rating: number }
  | { type: 'publish'; listing: Listing }
  | { type: 'reset' };

const initialData = (): DataState => ({ listings: SEED_LISTINGS.map((l) => ({ ...l })), claims: [] });

function reducer(state: DataState, action: Action): DataState {
  switch (action.type) {
    case 'claim': {
      // Guard against repeated or double claims.
      if (state.claims.some((c) => c.listingId === action.listingId)) return state;
      const claim: Claim = {
        id: `c-${action.listingId}`,
        listingId: action.listingId,
        moveInDate: action.moveInDate,
        status: 'Reserved',
      };
      return { ...state, claims: [claim, ...state.claims] };
    }
    case 'pickup':
      return {
        ...state,
        claims: state.claims.map((c) => (c.id === action.claimId && c.status === 'Reserved' ? { ...c, status: 'Picked up' } : c)),
      };
    case 'rate':
      return {
        ...state,
        claims: state.claims.map((c) =>
          // Only picked-up items can be rated, and only once.
          c.id === action.claimId && c.status === 'Picked up' && !c.rating
            ? { ...c, rating: Math.min(5, Math.max(1, action.rating)), status: 'Complete' }
            : c,
        ),
      };
    case 'publish':
      if (state.listings.some((l) => l.id === action.listing.id)) return state;
      return { ...state, listings: [action.listing, ...state.listings] };
    case 'reset':
      state.listings.forEach((l) => l.photoUrl?.startsWith('blob:') && URL.revokeObjectURL(l.photoUrl));
      return initialData();
  }
}

export interface ToastMsg {
  id: number;
  text: string;
  tone: 'default' | 'success' | 'warn';
}

interface Store extends DataState {
  available: Listing[];
  claimedIds: Set<string>;
  getListing: (id: string) => Listing | undefined;
  claim: (listingId: string, moveInDate: string) => void;
  confirmPickup: (claimId: string) => void;
  rate: (claimId: string, rating: number) => void;
  publish: (listing: Listing) => void;
  resetData: () => void;
  toast: ToastMsg | null;
  showToast: (text: string, tone?: ToastMsg['tone']) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, initialData);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const showToast = useCallback((text: string, tone: ToastMsg['tone'] = 'default') => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), text, tone });
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const store = useMemo<Store>(() => {
    const claimedIds = new Set(data.claims.map((c) => c.listingId));
    return {
      ...data,
      claimedIds,
      available: data.listings.filter((l) => !claimedIds.has(l.id)),
      getListing: (id) => data.listings.find((l) => l.id === id),
      claim: (listingId, moveInDate) => dispatch({ type: 'claim', listingId, moveInDate }),
      confirmPickup: (claimId) => dispatch({ type: 'pickup', claimId }),
      rate: (claimId, rating) => dispatch({ type: 'rate', claimId, rating }),
      publish: (listing) => dispatch({ type: 'publish', listing }),
      resetData: () => dispatch({ type: 'reset' }),
      toast,
      showToast,
    };
  }, [data, toast, showToast]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
