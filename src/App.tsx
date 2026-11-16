import { useCallback, useMemo, useState } from 'react';
import { BottomNav } from './components/Chrome';
import { TopNav, ViewSwitch, type View } from './components/DesktopChrome';
import { Logo } from './components/Logo';
import { ProcessSteps } from './components/ProcessSteps';
import { Toast } from './components/ui';
import { Discover } from './screens/Discover';
import { ItemDetail } from './screens/ItemDetail';
import { ListItem } from './screens/ListItem';
import { MyClaims } from './screens/MyClaims';
import { LayoutCtx, useWideScreen } from './state/layout';
import { NavCtx, type Nav } from './state/nav';
import { StoreProvider, useStore, type Tab } from './state/store';

interface ViewProps {
  view: View;
  onView: (v: View) => void;
}

function AppScreens({ onReset, desktop, view, onView }: { onReset: () => void; desktop: boolean } & ViewProps) {
  const [tab, setTab] = useState<Tab>('discover');
  const [detailId, setDetailId] = useState<string | null>(null);

  const goTab = useCallback((t: Tab) => {
    setTab(t);
    if (t !== 'discover') {
      // Fresh view when arriving on List or Claims; Discover keeps its scroll position.
      window.requestAnimationFrame(() => document.getElementById(`screen-${t}`)?.scrollTo({ top: 0 }));
    }
  }, []);

  const nav = useMemo<Nav>(
    () => ({
      tab,
      goTab,
      openDetail: (id) => setDetailId(id),
      closeDetail: () => setDetailId(null),
      resetDemo: onReset,
    }),
    [tab, goTab, onReset],
  );

  const screens: { id: Tab; el: JSX.Element; label: string }[] = [
    { id: 'discover', el: <Discover />, label: 'Discover' },
    { id: 'list', el: <ListItem />, label: 'List an item' },
    { id: 'claims', el: <MyClaims />, label: 'My claims' },
  ];

  const content = (
    <>
      {screens.map((s) => (
        <main
          key={s.id}
          id={`screen-${s.id}`}
          data-scroll
          aria-label={s.label}
          hidden={tab !== s.id}
          className={`anim-fade-in thin-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden ${
            desktop ? '' : 'pb-[calc(76px+env(safe-area-inset-bottom))]'
          }`}
        >
          {s.el}
        </main>
      ))}
      {detailId && <ItemDetail key={detailId} listingId={detailId} />}
    </>
  );

  return (
    <NavCtx.Provider value={nav}>
      {desktop ? (
        <div className="flex h-full flex-col">
          <TopNav view={view} onView={onView} />
          <div className="relative min-h-0 flex-1">{content}</div>
        </div>
      ) : (
        <>
          {content}
          <BottomNav />
        </>
      )}
    </NavCtx.Provider>
  );
}

function AppFrame({ desktop, view, onView }: { desktop: boolean } & ViewProps) {
  const { resetData, showToast } = useStore();
  const [nonce, setNonce] = useState(0);
  const onReset = useCallback(() => {
    resetData();
    setNonce((n) => n + 1);
    showToast('Demo reset. Fresh start.', 'success');
  }, [resetData, showToast]);

  return (
    <LayoutCtx.Provider value={desktop}>
      <div
        id="app-frame"
        className={
          desktop
            ? 'relative isolate h-[100dvh] w-full overflow-hidden bg-cream'
            : 'relative isolate h-[100dvh] w-full overflow-hidden bg-cream sm:h-[min(880px,calc(100dvh-112px))] sm:w-[412px] sm:rounded-[38px] sm:border sm:border-[#e3ddd1] sm:shadow-[0_40px_80px_-40px_rgba(20,33,61,0.35),0_0_0_8px_rgba(255,254,251,0.9),0_0_0_9px_#e3ddd1] lg:h-[min(880px,calc(100dvh-40px))]'
        }
      >
        <AppScreens key={nonce} onReset={onReset} desktop={desktop} view={view} onView={onView} />
        <Toast />
      </div>
    </LayoutCtx.Provider>
  );
}

function BrandPanel({ view, onView }: ViewProps) {
  return (
    <aside className="hidden max-w-[560px] flex-1 flex-col justify-center lg:flex" aria-label="About Relay">
      <Logo size={34} />
      <div className="mt-[clamp(20px,4.5vh,44px)] flex flex-wrap items-center gap-3">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-[12px] font-semibold text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
          TE 200 Idea Fair · Interactive prototype
        </p>
        <ViewSwitch view={view} onChange={onView} size="sm" />
      </div>
      <h1 className="mt-5 font-display font-semibold leading-[0.98] tracking-[-0.045em] text-navy" style={{ fontSize: 'clamp(48px, min(5.6vw, 9.4vh), 84px)' }}>
        Good stuff.
        <br />
        New semester<span className="text-orange">.</span>
      </h1>
      <p className="mt-5 max-w-[440px] text-[clamp(16px,2.2vh,19px)] leading-relaxed text-muted">
        The campus marketplace that helps dorm essentials find their next home.
      </p>
      <div className="mt-[clamp(28px,6vh,60px)] max-w-[520px]">
        <ProcessSteps />
      </div>
      <p className="mt-[clamp(28px,6vh,56px)] max-w-[480px] border-t border-line pt-4 text-[12px] leading-relaxed text-muted">
        University of Illinois Urbana-Champaign · Fall 2027 move-in scenario. Listings, people and ratings are simulated. Not affiliated with
        or endorsed by University Housing.
      </p>
    </aside>
  );
}

function readView(): View {
  return new URLSearchParams(window.location.search).get('view') === 'desktop' ? 'desktop' : 'phone';
}

export default function App() {
  const [view, setView] = useState<View>(readView);
  const wide = useWideScreen();
  const desktop = view === 'desktop' && wide; // the desktop app needs a laptop-sized window

  const onView = useCallback((v: View) => {
    setView(v);
    const url = new URL(window.location.href);
    if (v === 'desktop') url.searchParams.set('view', 'desktop');
    else url.searchParams.delete('view');
    window.history.replaceState(null, '', url);
  }, []);

  return (
    <StoreProvider>
      {desktop ? (
        <AppFrame desktop view={view} onView={onView} />
      ) : (
        <div className="flex min-h-[100dvh] items-center justify-center sm:px-8 sm:py-10 lg:gap-[clamp(48px,7vw,120px)] lg:px-[clamp(32px,6vw,96px)] lg:py-5">
          <BrandPanel view={view} onView={onView} />
          <div className="flex w-full flex-col items-center sm:w-auto">
            <div className="mb-5 hidden items-center gap-3 sm:flex lg:hidden">
              <Logo size={26} />
              <span className="text-[13px] text-muted">Good stuff. New semester.</span>
            </div>
            <AppFrame desktop={false} view={view} onView={onView} />
          </div>
        </div>
      )}
    </StoreProvider>
  );
}
