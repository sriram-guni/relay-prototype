import { useState } from 'react';
import { CalendarDays, Check, MapPin, PackageCheck, Star } from 'lucide-react';
import { dormInfo, formatMoveIn } from '../data/campus';
import { sellerById } from '../data/seed';
import type { Claim, ClaimStatus, Listing } from '../data/types';
import { Price } from '../components/ListingCard';
import { RelayMark } from '../components/Logo';
import { EmptyState, GhostButton, ListingImage, PrimaryButton, RatingInput, Sheet } from '../components/ui';
import { useNav } from '../state/nav';
import { useStore } from '../state/store';

const STAGES: ClaimStatus[] = ['Reserved', 'Picked up', 'Complete'];

function Stepper({ status }: { status: ClaimStatus }) {
  const at = STAGES.indexOf(status);
  const finished = status === 'Complete';
  return (
    <ol className="flex items-center" aria-label={`Status: ${status}`}>
      {STAGES.map((s, i) => {
        const reached = i <= at;
        const current = i === at && !finished;
        return (
          <li key={s} className={`flex items-center ${i < STAGES.length - 1 ? 'flex-1' : ''}`}>
            <span className="flex items-center gap-1.5">
              <span
                className={`grid h-[18px] w-[18px] place-items-center rounded-full transition-colors duration-300 ${
                  reached ? (current ? 'bg-orange text-white' : 'bg-green text-white') : 'border-[1.5px] border-[#d5cfc3] bg-card'
                }`}
                aria-hidden="true"
              >
                {reached && !current && <Check size={11} strokeWidth={3.4} />}
                {current && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className={`text-[11.5px] font-semibold ${current ? 'text-navy' : reached ? 'text-green' : 'text-muted'}`}>{s}</span>
            </span>
            {i < STAGES.length - 1 && (
              <span className={`mx-2 h-[2px] flex-1 rounded-full transition-colors duration-300 ${i < at ? 'bg-green' : 'bg-line'}`} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ClaimCard({ claim, listing, index }: { claim: Claim; listing: Listing; index: number }) {
  const { confirmPickup, rate, showToast } = useStore();
  const { openDetail } = useNav();
  const [confirming, setConfirming] = useState(false);
  const [stars, setStars] = useState(0);
  const seller = sellerById(listing.sellerId);
  const first = seller.name.split(' ')[0];

  return (
    <article className="anim-fade-up overflow-hidden rounded-[24px] border border-line bg-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex gap-3.5 p-3.5">
        <button
          type="button"
          onClick={() => openDetail(listing.id)}
          aria-label={`View ${listing.title}`}
          className="press h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl"
        >
          <ListingImage listing={listing} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[15.5px] font-semibold leading-snug text-navy">{listing.title}</h3>
            <div className="shrink-0">
              <Price value={listing.price} />
            </div>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink">
            <CalendarDays size={13} className="shrink-0 text-orange" aria-hidden="true" />
            <span className="font-semibold">{formatMoveIn(claim.moveInDate, true)}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
            <MapPin size={13} className="shrink-0 text-orange" aria-hidden="true" />
            <span className="truncate">{dormInfo(listing.dorm).pickup}</span>
          </p>
        </div>
      </div>

      <div className="border-t border-line px-3.5 py-3">
        <Stepper status={claim.status} />
      </div>

      <div className="border-t border-line bg-cream/50 px-3.5 py-3">
        {claim.status === 'Reserved' && (
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-muted">
              {first} is holding it for you. Confirm once it’s in your hands.
            </p>
            <PrimaryButton type="button" tone="navy" className="h-10 shrink-0 rounded-xl px-4 text-[13.5px]" onClick={() => setConfirming(true)}>
              <PackageCheck size={16} aria-hidden="true" /> Confirm pickup
            </PrimaryButton>
          </div>
        )}
        {claim.status === 'Picked up' && (
          <div className="anim-fade-up">
            <p className="text-[13px] font-semibold text-navy">How was the handoff with {first}?</p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <RatingInput value={stars} onChange={setStars} label={`Rate your handoff with ${first}`} />
              <PrimaryButton
                type="button"
                className="h-10 shrink-0 rounded-xl px-4 text-[13.5px]"
                disabled={!stars}
                onClick={() => {
                  rate(claim.id, stars);
                  showToast(`Thanks! Rating saved for ${first}.`, 'success');
                }}
              >
                Submit rating
              </PrimaryButton>
            </div>
          </div>
        )}
        {claim.status === 'Complete' && (
          <div className="anim-fade-up flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-green">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-green text-white">
                <Check size={12} strokeWidth={3.2} aria-hidden="true" />
              </span>
              Handoff complete
            </p>
            <p className="flex items-center gap-0.5" aria-label={`You rated ${claim.rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={14} className={n <= (claim.rating ?? 0) ? 'fill-orange text-orange' : 'text-[#d5cfc3]'} aria-hidden="true" />
              ))}
            </p>
          </div>
        )}
      </div>

      <Sheet open={confirming} onClose={() => setConfirming(false)} label="Confirm pickup" variant="dialog">
        <div className="p-6 text-center">
          <div className="mx-auto h-20 w-20 overflow-hidden rounded-2xl">
            <ListingImage listing={listing} />
          </div>
          <h2 className="mt-4 font-display text-[21px] font-semibold tracking-[-0.02em] text-navy">Got the {listing.title}?</h2>
          <p className="mt-1.5 text-[14px] leading-snug text-muted">Confirm only once it’s in your hands. This lets {first} know the handoff is done.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <GhostButton type="button" onClick={() => setConfirming(false)}>
              Not yet
            </GhostButton>
            <PrimaryButton
              type="button"
              className="h-[48px]"
              onClick={() => {
                confirmPickup(claim.id);
                setConfirming(false);
                showToast('Pickup confirmed. Enjoy!', 'success');
              }}
            >
              Yes, I have it
            </PrimaryButton>
          </div>
        </div>
      </Sheet>
    </article>
  );
}

export function MyClaims() {
  const { claims, getListing } = useStore();
  const { goTab } = useNav();
  const items = claims.map((c) => ({ claim: c, listing: getListing(c.listingId) })).filter((x): x is { claim: Claim; listing: Listing } => !!x.listing);
  const active = items.filter((x) => x.claim.status !== 'Complete').length;

  return (
    <div className="px-5 pb-10 pt-[max(20px,env(safe-area-inset-top))]">
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-orange-deep">Moving in</p>
      <h1 className="mt-1 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.035em] text-navy">Your move-in lineup.</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">Everything you’ve claimed, in one place.</p>

      {items.length > 0 ? (
        <>
          <div className="mt-5 flex gap-2 text-[12.5px] font-medium">
            <span className="rounded-full bg-navy px-3 py-1.5 text-cream">
              {items.length} claimed
            </span>
            <span className="rounded-full border border-line bg-card px-3 py-1.5 text-ink">{active} awaiting pickup or rating</span>
          </div>
          <div className="mt-4 space-y-3.5">
            {items.map((x, i) => (
              <ClaimCard key={x.claim.id} claim={x.claim} listing={x.listing} index={i} />
            ))}
          </div>
          <p className="mt-5 text-center text-[12px] text-muted">Prototype: claims, pickups and ratings are simulated.</p>
        </>
      ) : (
        <EmptyState
          art={
            <div className="relative grid h-28 w-28 place-items-center rounded-[32px] bg-card shadow-[0_18px_40px_-24px_rgba(20,33,61,0.45)] ring-1 ring-line">
              <RelayMark size={56} />
              <span className="absolute -right-2 -top-2 rounded-full bg-orange px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white">Aug</span>
            </div>
          }
          title="Your room is waiting."
          body="Find something worth bringing home."
          action={
            <PrimaryButton type="button" onClick={() => goTab('discover')}>
              Browse essentials
            </PrimaryButton>
          }
        />
      )}
    </div>
  );
}
