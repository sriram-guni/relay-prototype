import { useState } from 'react';
import { ArrowLeft, CalendarDays, Hand, Handshake, MapPin, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { dormInfo, formatMoveIn, formatPrice } from '../data/campus';
import { sellerById } from '../data/seed';
import type { Listing } from '../data/types';
import { Price } from '../components/ListingCard';
import { ClaimSheet } from '../components/ClaimSheet';
import { OfferSheet } from '../components/OfferSheet';
import { CheckMark, GhostButton, ListingImage, PrimaryButton, SectionLabel } from '../components/ui';
import { useDesktop } from '../state/layout';
import { useNav } from '../state/nav';
import { useStore } from '../state/store';

export function CleaningPanel({ listing }: { listing: Listing }) {
  const steps = listing.cleaning;
  return (
    <section aria-labelledby="clean-title" className="relative overflow-hidden rounded-[24px] border border-green/15 bg-green-light p-5">
      <svg className="pointer-events-none absolute -right-8 -top-10 opacity-[0.09]" width="160" height="160" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M6 24.5a9 9 0 0 1 18 0" stroke="#287A5A" strokeWidth="2" fill="none" />
        <path d="M16 15.5a9 9 0 0 0 18 0" stroke="#287A5A" strokeWidth="2" fill="none" />
      </svg>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-green">
            <Sparkles size={13} aria-hidden="true" /> Cleaning checklist
          </p>
          <h2 id="clean-title" className="mt-1.5 font-display text-[22px] font-semibold leading-tight tracking-[-0.025em] text-navy">
            Cleaned. Checked. Ready.
          </h2>
          <p className="mt-1 text-[13.5px] text-[#47685a]">Cleaning steps completed by the seller.</p>
        </div>
        <span className="mt-1 shrink-0 rounded-full bg-green px-2.5 py-1 font-display text-[13px] font-semibold text-white">
          {steps.length}/{steps.length}
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {steps.map((s, i) => (
          <li key={s} className="anim-fade-up flex items-center gap-3 text-[14.5px] font-medium text-ink" style={{ animationDelay: `${120 + i * 50}ms` }}>
            <CheckMark on size={22} />
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-2 border-t border-green/15 pt-3.5 text-[12.5px] leading-snug">
        <p className="flex items-start gap-2 text-[#47685a]">
          <Hand size={14} className="mt-[1px] shrink-0" aria-hidden="true" />
          <span>
            <span className="font-semibold text-green">Seller-confirmed.</span> Required for every Relay listing.
          </span>
        </p>
        <p className="flex items-start gap-2 text-[#47685a]">
          <ShieldCheck size={14} className="mt-[1px] shrink-0" aria-hidden="true" />
          {listing.relayChecked ? (
            <span>
              <span className="font-semibold text-green">Relay-checked.</span> A Relay volunteer would also confirm condition before handoff
              (proposed process, simulated here).
            </span>
          ) : (
            <span>Not Relay-checked. Optional second look is a proposed future service.</span>
          )}
        </p>
      </div>
    </section>
  );
}

export function ItemDetail({ listingId }: { listingId: string }) {
  const { getListing, claims } = useStore();
  const { closeDetail, goTab } = useNav();
  const desktop = useDesktop();
  const [sheet, setSheet] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [deal, setDeal] = useState<number | undefined>();
  const listing = getListing(listingId);
  if (!listing) return null;
  const seller = sellerById(listing.sellerId);
  const dorm = dormInfo(listing.dorm);
  const claim = claims.find((c) => c.listingId === listing.id);
  const canOffer = listing.price > 0 && listing.negotiable !== false;

  const relayBadge = (top: string) =>
    listing.relayChecked && (
      <span
        className={`absolute right-4 ${top} inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1.5 text-[11.5px] font-semibold text-green backdrop-blur`}
      >
        <ShieldCheck size={13} strokeWidth={2.4} aria-hidden="true" /> Relay-checked
      </span>
    );

  const titleBlock = (
    <>
      <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium">
        <span className="rounded-full border border-line bg-card px-2.5 py-1 text-ink">{listing.category}</span>
        <span className="rounded-full border border-line bg-card px-2.5 py-1 text-ink">{listing.condition}</span>
        <span className="px-1 text-muted">{listing.postedLabel}</span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-4">
        <h1
          className={`min-w-0 break-words font-display font-semibold tracking-[-0.03em] text-navy ${
            desktop ? 'text-[38px] leading-[1.04]' : 'text-[26px] leading-[1.08]'
          }`}
        >
          {listing.title}
        </h1>
        {!desktop && (
          <div className="shrink-0 pt-0.5">
            <Price value={listing.price} large />
          </div>
        )}
      </div>
      <p className={`mt-2 flex items-center gap-1.5 text-muted ${desktop ? 'text-[15px]' : 'text-[13.5px]'}`}>
        <MapPin size={14} className="text-orange" aria-hidden="true" />
        {dorm.label} · {listing.hall} Hall
      </p>
    </>
  );

  const sellerCard = (
    <div className="flex items-center gap-3 rounded-[20px] border border-line bg-card p-3.5">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-[14px] font-semibold text-white"
        style={{ background: seller.avatarColor }}
        aria-hidden="true"
      >
        {seller.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-navy">{listing.isOwn ? `${seller.name} (you)` : seller.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-muted">
          <Star size={12} className="fill-orange text-orange" aria-hidden="true" />
          <span className="font-semibold text-ink">{seller.rating.toFixed(1)}</span>· {seller.handoffs} handoffs
        </p>
      </div>
      <div className="text-right text-[12px] leading-tight text-muted">
        <p className="font-semibold text-ink">{listing.dorm}</p>
        <p>{listing.hall} Hall</p>
      </div>
    </div>
  );

  const description = (
    <div>
      <SectionLabel>From the seller</SectionLabel>
      <p className={`mt-2 leading-relaxed text-ink ${desktop ? 'text-[16px]' : 'text-[15px]'}`}>{listing.description}</p>
    </div>
  );

  const pickup = (
    <section aria-labelledby="pickup-title">
      <SectionLabel>
        <span id="pickup-title">Pickup plan</span>
      </SectionLabel>
      <div className="mt-2.5 divide-y divide-line rounded-[20px] border border-line bg-card">
        <div className="flex items-start gap-3 p-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-light text-orange-deep">
            <MapPin size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] text-muted">Pickup</p>
            <p className="text-[14.5px] font-semibold text-navy">{dorm.pickup}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-sand px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted">
            Proposed
          </span>
        </div>
        <div className="flex items-start gap-3 p-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-light text-orange-deep">
            <CalendarDays size={17} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[12px] text-muted">Move-in</p>
            <p className="text-[14.5px] font-semibold text-navy">August 2027 · you choose the day</p>
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-[12px] leading-snug text-muted">
        Prototype: pickup arrangements are simulated. Sellers, ratings and handoff points are illustrative.
      </p>
    </section>
  );

  const action = listing.isOwn ? (
    <div className="flex h-[52px] items-center justify-center rounded-2xl bg-green-light text-[14.5px] font-semibold text-green">
      Your listing is live on Discover
    </div>
  ) : claim ? (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-muted">Claimed for</p>
        <p className="truncate text-[15px] font-semibold text-navy">{formatMoveIn(claim.moveInDate)}</p>
      </div>
      <GhostButton
        type="button"
        onClick={() => {
          closeDetail();
          goTab('claims');
        }}
      >
        View my claims
      </GhostButton>
    </div>
  ) : (
    <div>
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <p className="text-[11.5px] text-muted">{deal !== undefined ? 'Your deal' : canOffer ? 'Price · open to offers' : 'Price'}</p>
          <p className={`font-display font-semibold leading-tight tracking-[-0.02em] text-navy ${desktop ? 'text-[28px]' : 'text-[20px]'}`}>
            {formatPrice(deal ?? listing.price)}
            {deal !== undefined && deal !== listing.price && (
              <span className="ml-1.5 align-middle text-[13px] font-medium text-muted line-through">{formatPrice(listing.price)}</span>
            )}
          </p>
        </div>
        {canOffer && deal === undefined && (
          <GhostButton type="button" className="shrink-0 px-3.5" onClick={() => setOfferOpen(true)}>
            <Handshake size={16} aria-hidden="true" /> Offer
          </GhostButton>
        )}
        <PrimaryButton type="button" className="flex-1" onClick={() => setSheet(true)}>
          {deal !== undefined ? `Claim at ${formatPrice(deal)}` : 'Claim for move-in day'}
        </PrimaryButton>
      </div>
    </div>
  );

  const claimSheet = (
    <>
      <ClaimSheet listing={listing} open={sheet} onClose={() => setSheet(false)} agreedPrice={deal} />
      {canOffer && (
        <OfferSheet
          listing={listing}
          open={offerOpen}
          onClose={() => setOfferOpen(false)}
          onDeal={(p) => {
            setDeal(p);
            setOfferOpen(false);
            setSheet(true);
          }}
        />
      )}
    </>
  );

  /* ---------- desktop: two-column product page ---------- */
  if (desktop) {
    return (
      <div className="anim-fade-in thin-scrollbar absolute inset-0 z-40 overflow-y-auto bg-cream" data-scroll>
        <div className="mx-auto max-w-[1240px] px-10 pb-16 pt-6">
          <button
            type="button"
            onClick={closeDetail}
            aria-label="Back to Discover"
            className="press inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-[14px] font-semibold text-navy hover:border-[#d5cfc3]"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to Discover
          </button>
          <div className="mt-6 grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12">
            <div className="sticky top-6 space-y-4 self-start">
              <div className="relative aspect-square overflow-hidden rounded-[32px] border border-line">
                <ListingImage listing={listing} />
                {relayBadge('top-4')}
              </div>
              {sellerCard}
            </div>
            <div className="min-w-0 space-y-7">
              <div>{titleBlock}</div>
              <div className="rounded-[24px] border border-line bg-card p-5 shadow-[0_18px_40px_-30px_rgba(20,33,61,0.45)]">{action}</div>
              {description}
              <CleaningPanel listing={listing} />
              {pickup}
            </div>
          </div>
        </div>
        {claimSheet}
      </div>
    );
  }

  /* ---------- phone ---------- */
  return (
    <div className="anim-slide-in absolute inset-0 z-40 flex flex-col bg-cream">
      <div className="thin-scrollbar flex-1 overflow-y-auto" data-scroll>
        <div className="relative aspect-[6/5] w-full overflow-hidden">
          <ListingImage listing={listing} />
          <button
            type="button"
            onClick={closeDetail}
            aria-label="Back to Discover"
            className="press absolute left-4 top-[max(16px,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/92 text-navy shadow-[0_4px_14px_-6px_rgba(20,33,61,0.4)] backdrop-blur hover:bg-white"
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          {relayBadge('top-[max(18px,env(safe-area-inset-top))]')}
        </div>

        <div className="relative -mt-6 rounded-t-[28px] bg-cream px-5 pb-8 pt-5">
          {titleBlock}
          <div className="mt-5">{sellerCard}</div>
          <div className="mt-5">{description}</div>
          <div className="mt-6">
            <CleaningPanel listing={listing} />
          </div>
          <div className="mt-6">{pickup}</div>
        </div>
      </div>

      <div className="border-t border-line bg-cream/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">{action}</div>

      {claimSheet}
    </div>
  );
}
