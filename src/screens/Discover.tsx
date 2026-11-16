import { useMemo, useState, type ReactNode } from 'react';
import { Archive, ArrowUpDown, Fan, LampDesk, LayoutGrid, MapPin, Microwave, Refrigerator, Search, Sparkles, X } from 'lucide-react';
import { CATEGORIES, CATEGORY_PLURAL, DORM_AREAS } from '../data/campus';
import type { Category, DormArea, Listing } from '../data/types';
import { FeaturedCard, ListingCard } from '../components/ListingCard';
import { ProfileMenu } from '../components/Chrome';
import { Logo, RelayMark } from '../components/Logo';
import { Chip, EmptyState, GhostButton } from '../components/ui';
import { useDesktop } from '../state/layout';
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

/* ---------------- shared pieces ---------------- */

function HeroTitle({ desktop }: { desktop: boolean }) {
  return (
    <h1
      id="hero-title"
      className={`font-display font-semibold tracking-[-0.035em] text-navy ${desktop ? 'text-[46px] leading-[1.02]' : 'text-[31px] leading-[1.04]'}`}
    >
      Your next dorm find{' '}
      <span className="relative inline-block">
        is here.
        <svg className="absolute -bottom-1.5 left-0 w-full" height="9" viewBox="0 0 100 9" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 6.5 C 25 1.5, 55 1.5, 98 5" stroke="#F28C28" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </span>
    </h1>
  );
}

function MoveInStrip({ desktop }: { desktop: boolean }) {
  return (
    <div className={`relative flex items-center gap-3 overflow-hidden rounded-[20px] bg-navy text-cream ${desktop ? 'py-4 pl-5 pr-4' : 'py-2.5 pl-4 pr-3'}`}>
      <svg className="pointer-events-none absolute -right-6 -top-8 opacity-[0.16]" width="150" height="110" viewBox="0 0 150 110" aria-hidden="true">
        <path d="M10 100 C 40 10, 90 10, 140 60" stroke="#F28C28" strokeWidth="2" fill="none" />
        <circle cx="140" cy="60" r="4" fill="#F28C28" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange">Fall 2027 move-in</p>
        <p className={`mt-0.5 font-medium leading-snug ${desktop ? 'text-[15.5px]' : 'text-[14px]'}`}>Claim it now. Pick it up when you arrive.</p>
      </div>
      <div className="shrink-0 rounded-[14px] bg-cream px-3 py-1.5 text-center text-navy">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-orange-deep">Aug</p>
        <p className="font-display text-[17px] font-semibold leading-tight tracking-[-0.02em]">18–22</p>
      </div>
    </div>
  );
}

function SearchBox({ query, setQuery, large = false }: { query: string; setQuery: (q: string) => void; large?: boolean }) {
  return (
    <label className="relative block">
      <span className="sr-only">Search dorm essentials</span>
      <Search size={large ? 20 : 18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search dorm essentials..."
        className={`w-full rounded-2xl border border-line bg-card pr-11 text-ink shadow-[0_1px_0_rgba(20,33,61,0.03)] placeholder:text-[#9aa1ad] focus:border-navy focus:shadow-[0_0_0_3px_rgba(20,33,61,0.08)] focus:outline-none [&::-webkit-search-cancel-button]:hidden ${
          large ? 'h-14 pl-12 text-[16px]' : 'h-12 pl-11 text-[15px]'
        }`}
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
  );
}

function SortSelect({ sort, setSort, full = false }: { sort: Sort; setSort: (s: Sort) => void; full?: boolean }) {
  return (
    <label className={`relative flex items-center ${full ? 'w-full' : ''}`}>
      <span className="sr-only">Sort listings</span>
      <ArrowUpDown size={13} className="pointer-events-none absolute left-2.5 text-muted" aria-hidden="true" />
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as Sort)}
        className={`appearance-none rounded-full border border-line bg-card pl-7 pr-3 font-medium text-ink focus:border-navy focus:outline-none ${
          full ? 'h-10 w-full text-[13.5px]' : 'h-8 text-[12.5px]'
        }`}
      >
        <option value="featured">Featured</option>
        <option value="low">Price: low to high</option>
        <option value="high">Price: high to low</option>
      </select>
    </label>
  );
}

/** Sidebar filter row (desktop). */
function FilterRow({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon?: ReactNode; label: string; count: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[14px] font-medium ${
        active ? 'bg-navy text-cream' : 'text-ink hover:bg-sand/70'
      }`}
    >
      {icon && <span className={active ? 'text-orange' : 'text-muted'}>{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      <span className={`text-[12px] font-semibold tabular-nums ${active ? 'text-cream/70' : 'text-muted'}`}>{count}</span>
    </button>
  );
}

/* ---------------- screen ---------------- */

export function Discover() {
  const { available } = useStore();
  const { openDetail } = useNav();
  const desktop = useDesktop();
  const [query, setQuery] = useState('');
  const [dorm, setDorm] = useState<DormArea | 'All'>('All');
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [sort, setSort] = useState<Sort>('featured');

  const q = query.trim();
  const results = useMemo(() => {
    const r = available.filter((l) => (dorm === 'All' || l.dorm === dorm) && (cat === 'All' || l.category === cat) && matches(l, q));
    if (sort === 'low') return [...r].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [available, dorm, cat, q, sort]);

  const isDefaultView = dorm === 'All' && cat === 'All' && !q && sort === 'featured';
  const featured = isDefaultView ? results.find((l) => l.id === FEATURED_ID) : undefined;
  const grid = featured ? results.filter((l) => l !== featured) : results;
  const filtered = !(dorm === 'All' && cat === 'All' && !q);

  const clearAll = () => {
    setQuery('');
    setDorm('All');
    setCat('All');
    setSort('featured');
  };

  const countText = (
    <p className={`text-muted ${desktop ? 'text-[14px]' : 'text-[13px]'}`} aria-live="polite">
      <span className="font-semibold text-ink">{results.length}</span> {results.length === 1 ? 'essential' : 'essentials'} ready for move-in
    </p>
  );

  const body =
    results.length > 0 ? (
      <div
        className={
          desktop ? 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 pt-4' : 'grid grid-cols-2 gap-3 px-5 pt-3'
        }
      >
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
          filtered ? 'No essentials match those filters. Try another hall or category.' : 'Every listing has been claimed. New ones appear as students move out.'
        }
        action={
          filtered && (
            <GhostButton type="button" onClick={clearAll}>
              Clear filters
            </GhostButton>
          )
        }
      />
    );

  /* ---------- desktop layout ---------- */
  if (desktop) {
    const inDorm = (d: DormArea | 'All') =>
      available.filter((l) => (d === 'All' || l.dorm === d) && (cat === 'All' || l.category === cat) && matches(l, q)).length;
    const inCat = (c: Category | 'All') =>
      available.filter((l) => (dorm === 'All' || l.dorm === dorm) && (c === 'All' || l.category === c) && matches(l, q)).length;

    return (
      <div className="mx-auto max-w-[1240px] px-10 pb-16">
        <section className="grid grid-cols-[minmax(0,1fr)_minmax(360px,420px)] items-end gap-12 pt-10" aria-labelledby="hero-title">
          <div>
            <HeroTitle desktop />
            <p className="mt-4 text-[17px] text-muted">Secondhand essentials. First-class move-in.</p>
          </div>
          <MoveInStrip desktop />
        </section>

        <div className="mt-8">
          <SearchBox query={query} setQuery={setQuery} large />
        </div>

        <div className="mt-8 grid grid-cols-[236px_minmax(0,1fr)] gap-10">
          <aside className="no-scrollbar sticky top-6 max-h-[calc(100dvh-120px)] space-y-6 self-start overflow-y-auto pb-2" aria-label="Filters">
            <div role="group" aria-label="Filter by residence area">
              <h2 className="mb-2 px-3 text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">Residence area</h2>
              <div className="space-y-0.5">
                <FilterRow active={dorm === 'All'} onClick={() => setDorm('All')} label="All halls" count={inDorm('All')} />
                {DORM_AREAS.map((d) => (
                  <FilterRow key={d.id} active={dorm === d.id} onClick={() => setDorm(d.id)} label={d.id} count={inDorm(d.id)} />
                ))}
              </div>
            </div>
            <div role="group" aria-label="Filter by category">
              <h2 className="mb-2 px-3 text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">Category</h2>
              <div className="space-y-0.5">
                <FilterRow active={cat === 'All'} onClick={() => setCat('All')} icon={<LayoutGrid size={16} aria-hidden="true" />} label="All" count={inCat('All')} />
                {CATEGORIES.map((c) => {
                  const Icon = CATEGORY_ICON[c];
                  return (
                    <FilterRow
                      key={c}
                      active={cat === c}
                      onClick={() => setCat(c)}
                      icon={<Icon size={16} aria-hidden="true" />}
                      label={CATEGORY_PLURAL[c]}
                      count={inCat(c)}
                    />
                  );
                })}
              </div>
            </div>
            <div className="px-3">
              <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">Sort</h2>
              <SortSelect sort={sort} setSort={setSort} full />
            </div>
            <div className="rounded-[20px] border border-green/15 bg-green-light p-4">
              <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-green">
                <Sparkles size={14} aria-hidden="true" /> Cleaned. Checked. Ready.
              </p>
              <p className="mt-1 text-[12.5px] leading-snug text-[#47685a]">Every listing includes a seller-confirmed cleaning checklist.</p>
            </div>
          </aside>

          <section aria-label="Listings" className="min-w-0">
            <div className="flex h-10 items-center justify-between gap-4">
              {countText}
              {filtered && (
                <button type="button" onClick={clearAll} className="press rounded-full px-3 py-1.5 text-[13px] font-semibold text-orange-deep hover:bg-orange-light">
                  Reset filters
                </button>
              )}
            </div>
            {body}
          </section>
        </div>
      </div>
    );
  }

  /* ---------- phone layout ---------- */
  return (
    <div className="pb-6">
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

      <section className="px-5 pt-3" aria-labelledby="hero-title">
        <HeroTitle desktop={false} />
        <p className="mt-2.5 text-[15px] text-muted">Secondhand essentials. First-class move-in.</p>
        <div className="mt-3.5">
          <MoveInStrip desktop={false} />
        </div>
      </section>

      <div className="px-5 pt-3">
        <SearchBox query={query} setQuery={setQuery} />
      </div>

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

      <div className="mt-3.5 flex items-center justify-between px-5">
        {countText}
        <SortSelect sort={sort} setSort={setSort} />
      </div>

      {body}
    </div>
  );
}
