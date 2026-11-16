import { createContext, useContext, useEffect, useState } from 'react';

/** true when the standalone desktop app is rendered (vs. the phone-sized app). */
export const LayoutCtx = createContext(false);
export const useDesktop = () => useContext(LayoutCtx);

/** Tracks whether the window is wide enough for the desktop app. */
export function useWideScreen(min = 1024) {
  const query = `(min-width: ${min}px)`;
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return wide;
}
