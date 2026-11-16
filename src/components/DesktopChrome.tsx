import { MapPin, Monitor, Smartphone } from 'lucide-react';
import { useNav } from '../state/nav';
import { NAV_ITEMS, ProfileMenu, useActiveClaims } from './Chrome';
import { Logo } from './Logo';

export type View = 'phone' | 'desktop';

/* ---------------- Phone / desktop view switch ---------------- */
export function ViewSwitch({ view, onChange, size = 'md' }: { view: View; onChange: (v: View) => void; size?: 'sm' | 'md' }) {
  const opts: { id: View; label: string; Icon: typeof Monitor }[] = [
    { id: 'phone', label: 'Phone', Icon: Smartphone },
    { id: 'desktop', label: 'Desktop', Icon: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label="App view" className="inline-flex rounded-full border border-line bg-sand/70 p-1">
      {opts.map(({ id, label, Icon }) => {
        const on = view === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(id)}
            className={`press inline-flex items-center gap-1.5 rounded-full font-semibold ${size === 'sm' ? 'h-8 px-3 text-[12.5px]' : 'h-9 px-3.5 text-[13px]'} ${
              on ? 'bg-card text-navy shadow-[0_2px_8px_-3px_rgba(20,33,61,0.3)]' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Desktop top navigation ---------------- */
export function TopNav({ view, onView }: { view: View; onView: (v: View) => void }) {
  const { tab, goTab, closeDetail } = useNav();
  const active = useActiveClaims();
  const go = (t: typeof tab) => {
    closeDetail();
    goTab(t);
  };
  return (
    <header className="relative z-30 shrink-0 border-b border-line bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-5 px-10">
        <button type="button" onClick={() => go('discover')} aria-label="Relay home" className="press shrink-0 rounded-lg">
          <Logo size={28} />
        </button>
        <span className="hidden items-center gap-1 rounded-full border border-line bg-card px-2.5 py-1.5 text-[12px] font-medium text-ink xl:flex">
          <MapPin size={12} className="text-orange" aria-hidden="true" />
          UIUC · Urbana-Champaign
        </span>
        <nav aria-label="Primary" className="mx-auto">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-card p-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const on = tab === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    aria-current={on ? 'page' : undefined}
                    aria-label={id === 'claims' && active > 0 ? `${label}, ${active} active` : label}
                    className={`press inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold ${
                      on ? 'bg-navy text-cream' : 'text-muted hover:bg-sand/70 hover:text-ink'
                    }`}
                  >
                    <Icon size={17} strokeWidth={on ? 2.3 : 2} aria-hidden="true" className={on ? 'text-orange' : ''} />
                    {label}
                    {id === 'claims' && active > 0 && (
                      <span
                        key={active}
                        aria-hidden="true"
                        className="anim-pop grid h-[19px] min-w-[19px] place-items-center rounded-full bg-orange px-1 text-[10.5px] font-bold text-white"
                      >
                        {active}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <ViewSwitch view={view} onChange={onView} size="sm" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
