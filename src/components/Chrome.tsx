import { useEffect, useRef, useState } from 'react';
import { CirclePlus, Compass, Package, RotateCcw } from 'lucide-react';
import { DEMO_USER } from '../data/seed';
import { useNav } from '../state/nav';
import { useStore, type Tab } from '../state/store';

/* ---------------- Bottom navigation ---------------- */
export function BottomNav() {
  const { tab, goTab } = useNav();
  const { claims } = useStore();
  const active = claims.filter((c) => c.status !== 'Complete').length;
  const items: { id: Tab; label: string; Icon: typeof Compass }[] = [
    { id: 'discover', label: 'Discover', Icon: Compass },
    { id: 'list', label: 'List an item', Icon: CirclePlus },
    { id: 'claims', label: 'My claims', Icon: Package },
  ];
  return (
    <nav
      aria-label="Primary"
      className="absolute inset-x-0 bottom-0 z-30 border-t border-line/80 bg-cream/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="grid grid-cols-3">
        {items.map(({ id, label, Icon }) => {
          const on = tab === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => goTab(id)}
                aria-current={on ? 'page' : undefined}
                aria-label={id === 'claims' && active > 0 ? `${label}, ${active} active` : label}
                className={`press relative flex h-[62px] w-full flex-col items-center justify-center gap-1 text-[11.5px] font-semibold ${
                  on ? 'text-navy' : 'text-muted hover:text-ink'
                }`}
              >
                <span className="relative">
                  <Icon size={22} strokeWidth={on ? 2.3 : 1.9} aria-hidden="true" />
                  {id === 'claims' && active > 0 && (
                    <span
                      key={active}
                      className="anim-pop absolute -right-2.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-orange px-1 text-[10px] font-bold text-white ring-2 ring-cream"
                      aria-hidden="true"
                    >
                      {active}
                    </span>
                  )}
                </span>
                {label}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 h-[3px] rounded-b-full bg-orange transition-all duration-200 ${on ? 'w-8 opacity-100' : 'w-0 opacity-0'}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------------- Profile avatar + demo menu ---------------- */
export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { resetDemo } = useNav();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Profile and demo options"
        onClick={() => setOpen((o) => !o)}
        className="press grid h-9 w-9 place-items-center rounded-full bg-navy font-display text-[13px] font-semibold text-cream ring-2 ring-cream ring-offset-1 ring-offset-line hover:bg-ink"
      >
        {DEMO_USER.initials}
      </button>
      {open && (
        <div
          role="menu"
          className="anim-toast absolute right-0 top-11 z-40 w-[232px] overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-[0_18px_40px_-16px_rgba(20,33,61,0.45)]"
        >
          <div className="px-3 pb-2.5 pt-2">
            <p className="text-[14px] font-semibold text-navy">{DEMO_USER.name}</p>
            <p className="text-[12px] text-muted">{DEMO_USER.note}</p>
          </div>
          <div className="h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              resetDemo();
            }}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-ink hover:bg-orange-light focus-visible:bg-orange-light"
          >
            <RotateCcw size={16} className="text-orange-deep" aria-hidden="true" />
            <span>
              Reset demo
              <span className="block text-[11.5px] font-normal text-muted">Restores listings, claims and filters</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
