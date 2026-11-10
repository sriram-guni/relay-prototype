import { useState } from 'react';
import { ArrowLeft, CalendarDays, Hand, MapPin, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { dormInfo, formatMoveIn, formatPrice } from '../data/campus';
import { sellerById } from '../data/seed';
import type { Listing } from '../data/types';
import { Price } from '../components/ListingCard';
import { ClaimSheet } from '../components/ClaimSheet';
import { CheckMark, GhostButton, ListingImage, PrimaryButton, SectionLabel } from '../components/ui';
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
  const [sheet, setSheet] = useState(false);
  const listing = getListing(listingId);
  if (!listing) return null;
  const seller = sellerById(listing.sellerId);
  const dorm = dormInfo(listing.dorm);
  const claim = claims.find((c) => c.listingId === listing.id);

  return (
    <div className="anim-slide-in absolute inset-0 z-40 flex flex-col bg-cream">
      <div className="thin-scrollbar flex-1 overflow-y-auto" data-scroll>
        {/* image */}
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
          {listing.relayChecked && (
            <span className="absolute right-4 top-[max(18px,env(safe-area-inset-top))] inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1.5 text-[11.5px] font-semibold text-green backdrop-blur">
              <ShieldCheck size={13} strokeWidth={2.4} aria-hidden="true" /> Relay-checked
            </span>
          )}
        </div>

        <div className="relative -mt-6 rounded-t-[28px] bg-cream px-5 pb-8 pt-5">
          {/* title block */}
          <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium">
            <span className="rounded-full border border-line bg-card px-2.5 py-1 text-ink">{listing.category}</span>
            <span className="rounded-full border border-line bg-card px-2.5 py-1 text-ink">{listing.condition}</span>
            <span className="px-1 text-muted">{listing.postedLabel}</span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="min-w-0 break-words font-display text-[26px] font-semibold leading-[1.08] tracking-[-0.03em] text-navy">
              {listing.title}
            </h1>
            <div className="shrink-0 pt-0.5">
              <Price value={listing.price} large />
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[13.5px] text-muted">
            <MapPin size={14} className="text-orange" aria-hidden="true" />
            {dorm.label} · {listing.hall} Hall
          </p>

          {/* seller */}
          <div className="mt-5 flex items-center gap-3 rounded-[20px] border border-line bg-card p-3.5">
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

          {/* description */}
          <div className="mt-5">
            <SectionLabel>From the seller</SectionLabel>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">{listing.description}</p>
          </div>

          {/* cleaning */}
          <div className="mt-6">
            <CleaningPanel listing={listing} />
          </div>

          {/* pickup */}
          <section className="mt-6" aria-labelledby="pickup-title">
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
        </div>
      </div>

      {/* sticky CTA */}
      <div className="border-t border-line bg-cream/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        {listing.isOwn ? (
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
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-[11.5px] text-muted">Price</p>
              <p className="font-display text-[20px] font-semibold leading-tight tracking-[-0.02em] text-navy">{formatPrice(listing.price)}</p>
            </div>
            <PrimaryButton type="button" className="flex-1" onClick={() => setSheet(true)}>
              Claim for move-in day
            </PrimaryButton>
          </div>
        )}
      </div>

      <ClaimSheet listing={listing} open={sheet} onClose={() => setSheet(false)} />
    </div>
  );
}
