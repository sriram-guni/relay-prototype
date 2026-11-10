import { createContext, useContext } from 'react';
import type { Tab } from './store';

export interface Nav {
  tab: Tab;
  goTab: (t: Tab) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  resetDemo: () => void;
}

export const NavCtx = createContext<Nav | null>(null);

export function useNav() {
  const n = useContext(NavCtx);
  if (!n) throw new Error('useNav must be used inside NavCtx');
  return n;
}
