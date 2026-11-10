import { useMemo, useState } from 'react';
import { Archive, ArrowUpDown, Fan, LampDesk, LayoutGrid, MapPin, Microwave, Refrigerator, Search, X } from 'lucide-react';
import { CATEGORIES, CATEGORY_PLURAL, DORM_AREAS } from '../data/campus';
import type { Category, DormArea, Listing } from '../data/types';
import { FeaturedCard, ListingCard } from '../components/ListingCard';
import { ProfileMenu } from '../components/Chrome';
import { Logo, RelayMark } from '../components/Logo';
import { Chip, EmptyState, GhostButton } from '../components/ui';
import { useNav } from '../state/nav';
import { useStore } from '../state/store';

const FEATURED_ID = 'l-fridge-townsend';

export const CATEGORY_ICON: Record<Category, typeof Fan> = {
  Fridge: Refrigerator,
  Lamp: LampDesk,
  Fan: Fan,
  Storage: Archive,
  Microwave: Microwave,
};

type Sort = 'featured' | 'low' | 'high';

function matches(l: Listing, q: string) {
  if (!q) return true;
  const hay = [l.title, l.category, CATEGORY_PLURAL[l.category], l.dorm, l.hall, l.condition, l.price === 0 ? 'free' : '']
    .join(' ')
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((t) => (t === 'free' ? l.price === 0 : hay.includes(t)) || (t.length > 3 && t.endsWith('s') && hay.includes(t.slice(0, -1))));
}

export function Discover() {
  const { available } = useStore();
  const { openDetail } = useNav();
  const [query, setQuery] = useState('');
  const [dorm, setDorm] = useState<DormArea | 'All'>('All');
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [sort, setSort] = useState<Sort>('featured');

  const results = useMemo(() => {
    const r = available.filter((l) => (dorm === 'All' || l.dorm === dorm) && (cat === 'All' || l.category === cat) && matches(l, query.trim()));
    if (sort === 'low') return [...r].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [available, dorm, cat, query, sort]);

  const isDefaultView = dorm === 'All' && cat === 'All' && !query.trim() && sort === 'featured';
  const featured = isDefaultView ? results.find((l) => l.id === FEATURED_ID) : undefined;
  const grid = featured ? results.filter((l) => l !== featured) : results;
  const filtered = !(dorm === 'All' && cat === 'All' && !query.trim());

  const clearAll = () => {
    setQuery('');
    setDorm('All');
    setCat('All');
    setSort('featured');
  };

  return (
    <div className="pb-6">
      {/* header */}
      <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-[max(16px,env(safe-area-inset-top))]">
        <Logo size={26} />
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex min-w-0 items-center gap-1 rounded-full border border-line bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-ink">
            <MapPin size={12} className="shrink-0 text-orange" aria-hidden="true" />
            <span className="truncate">UIUC · Urbana-Champaign</span>
          </span>
          <ProfileMenu />
        </div>
      </header>

      {/* hero */}
      <section className="px-5 pt-3" aria-labelledby="hero-title">
        <h1 id="hero-title" className="font-display text-[31px] font-semibold leading-[1.04] tracking-[-0.035em] text-navy">
          Your next dorm find{' '}
          <span className="relative inline-block">
            is here.
            <svg className="absolute -bottom-1.5 left-0 w-full" height="9" viewBox="0 0 100 9" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 6.5 C 25 1.5, 55 1.5, 98 5" stroke="#F28C28" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="mt-2.5 text-[15px] text-muted">Secondhand essentials. First-class move-in.</p>

        {/* move-in strip: the campus-specific idea in one line */}
        <div className="relative mt-3.5 flex items-center gap-3 overflow-hidden rounded-[20px] bg-navy py-2.5 pl-4 pr-3 text-cream">
          <svg className="pointer-events-none absolute -right-6 -top-8 opacity-[0.16]" width="150" height="110" viewBox="0 0 150 110" aria-hidden="true">
            <path d="M10 100 C 40 10, 90 10, 140 60" stroke="#F28C28" strokeWidth="2" fill="none" />
            <circle cx="140" cy="60" r="4" fill="#F28C28" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange">Fall 2027 move-in</p>
            <p className="mt-0.5 text-[14px] font-medium leading-snug">Claim it now. Pick it up when you arrive.</p>
          </div>
          <div className="shrink-0 rounded-[14px] bg-cream px-3 py-1.5 text-center text-navy">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-orange-deep">Aug</p>
            <p className="font-display text-[17px] font-semibold leading-tight tracking-[-0.02em]">18–22</p>
          </div>
        </div>
      </section>

      {/* search */}
      <div className="px-5 pt-3">
        <label className="relative block">
          <span className="sr-only">Search dorm essentials</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dorm essentials..."
            className="h-12 w-full rounded-2xl border border-line bg-card pl-11 pr-11 text-[15px] text-ink shadow-[0_1px_0_rgba(20,33,61,0.03)] placeholder:text-[#9aa1ad] focus:border-navy focus:shadow-[0_0_0_3px_rgba(20,33,61,0.08)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="press absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-sand text-ink hover:bg-line"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </label>
      </div>

      {/* filters */}
      <div className="mt-3 space-y-2">
        <div role="group" aria-label="Filter by residence area" className="no-scrollbar flex gap-2 overflow-x-auto px-5">
          {(['All', ...DORM_AREAS.map((d) => d.id)] as const).map((d) => (
            <Chip key={d} active={dorm === d} onClick={() => setDorm(d)}>
              {d === 'All' ? 'All halls' : d}
            </Chip>
          ))}
        </div>
        <div role="group" aria-label="Filter by category" className="no-scrollbar flex gap-2 overflow-x-auto px-5">
          <Chip size="sm" active={cat === 'All'} onClick={() => setCat('All')} icon={<LayoutGrid size={14} aria-hidden="true" />}>
            All
          </Chip>
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICON[c];
            return (
              <Chip key={c} size="sm" active={cat === c} onClick={() => setCat(c)} icon={<Icon size={14} aria-hidden="true" />}>
                {CATEGORY_PLURAL[c]}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* results bar */}
      <div className="mt-3.5 flex items-center justify-between px-5">
        <p className="text-[13px] text-muted" aria-live="polite">
          <span className="font-semibold text-ink">{results.length}</span> {results.length === 1 ? 'essential' : 'essentials'} ready for move-in
        </p>
        <label className="relative flex items-center">
          <span className="sr-only">Sort listings</span>
          <ArrowUpDown size={13} className="pointer-events-none absolute left-2.5 text-muted" aria-hidden="true" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-8 appearance-none rounded-full border border-line bg-card pl-7 pr-3 text-[12.5px] font-medium text-ink focus:border-navy focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>

      {/* grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-5 pt-3">
          {featured && <FeaturedCard listing={featured} onOpen={() => openDetail(featured.id)} />}
          {grid.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} onOpen={() => openDetail(l.id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          art={
            <div className="grid h-20 w-20 place-items-center rounded-full bg-orange-light">
              <RelayMark size={40} />
            </div>
          }
          title={filtered ? 'Nothing here yet.' : 'Everything found a home.'}
          body={
            filtered
              ? 'No essentials match those filters. Try another hall or category.'
              : 'Every listing has been claimed. New ones appear as students move out.'
          }
          action={
            filtered && (
              <GhostButton type="button" onClick={clearAll}>
                Clear filters
              </GhostButton>
            )
          }
        />
      )}
    </div>
  );
}
