import { useEffect, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { dormInfo, formatMoveIn, formatPrice, MOVE_IN_DATES } from '../data/campus';
import type { Listing } from '../data/types';
import { useNav } from '../state/nav';
import { useStore } from '../state/store';
import { GhostButton, ListingImage, PrimaryButton, Sheet, SuccessCheck } from './ui';

export function ClaimSheet({ listing, open, onClose }: { listing: Listing; open: boolean; onClose: () => void }) {
  const { claim, claimedIds } = useStore();
  const { closeDetail, goTab } = useNav();
  const [date, setDate] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const pickup = dormInfo(listing.dorm).pickup;

  useEffect(() => {
    if (open && !done) setDate(null);
  }, [open, done]);

  const confirm = () => {
    if (!date || claimedIds.has(listing.id)) return;
    claim(listing.id, date);
    setDone(true);
  };

  const finish = (to: 'claims' | 'discover') => {
    onClose();
    closeDetail();
    goTab(to);
  };

  return (
    <Sheet open={open} onClose={done ? () => finish('discover') : onClose} label={done ? 'Claim confirmed' : 'Claim for move-in day'}>
      {!done ? (
        <div className="px-5 pt-4">
          <h2 className="font-display text-[23px] font-semibold tracking-[-0.025em] text-navy">Pick your move-in day</h2>
          <p className="mt-1 text-[14px] leading-snug text-muted">The seller holds it until you arrive on campus.</p>

          <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-line bg-card p-2.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              <ListingImage listing={listing} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-semibold text-navy">{listing.title}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] text-muted">
                <MapPin size={12} className="shrink-0 text-orange" aria-hidden="true" />
                {pickup}
              </p>
            </div>
            <p className="pr-1.5 font-display text-[17px] font-semibold text-navy">{formatPrice(listing.price)}</p>
          </div>

          <fieldset className="mt-5">
            <legend className="flex w-full items-center justify-between text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">
              <span>August 2027</span>
              <span className="normal-case tracking-normal font-medium">Fall move-in window</span>
            </legend>
            <div className="mt-2.5 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Move-in day">
              {MOVE_IN_DATES.map((d) => {
                const on = date === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={formatMoveIn(d.iso, true)}
                    onClick={() => setDate(d.iso)}
                    className={`press relative flex h-[76px] flex-col items-center justify-center rounded-2xl border ${
                      on
                        ? 'border-orange bg-orange text-white shadow-[0_10px_22px_-12px_rgba(242,140,40,0.9)]'
                        : 'border-line bg-card text-navy hover:border-[#d5cfc3]'
                    }`}
                  >
                    <span className={`text-[11.5px] font-semibold uppercase tracking-[0.06em] ${on ? 'text-white/85' : 'text-muted'}`}>
                      {d.weekday}
                    </span>
                    <span className="font-display text-[23px] font-semibold leading-tight tracking-[-0.02em]">{d.day}</span>
                    {d.tag && (
                      <span className={`absolute -top-2 rounded-full px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-[0.06em] ${on ? 'bg-navy text-cream' : 'bg-orange-light text-orange-deep'}`}>
                        {d.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sand/70 px-3.5 py-3 text-[12.5px] leading-snug text-muted">
            <CalendarDays size={14} className="mt-[1px] shrink-0 text-ink" aria-hidden="true" />
            Demo only: no payment is taken and no real reservation is made.
          </p>

          <PrimaryButton type="button" className="mt-4 w-full" disabled={!date} onClick={confirm}>
            {date ? `Confirm for ${formatMoveIn(date)}` : 'Choose a day to continue'}
          </PrimaryButton>
          <button type="button" onClick={onClose} className="mt-1 h-11 w-full rounded-xl text-[14px] font-medium text-muted hover:text-ink">
            Not now
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 pb-2 pt-7 text-center">
          <SuccessCheck />
          <h2 className="anim-fade-up mt-5 font-display text-[32px] font-semibold tracking-[-0.035em] text-navy" style={{ animationDelay: '120ms' }}>
            It's yours!
          </h2>
          <p className="anim-fade-up mt-1 text-[15px] text-muted" style={{ animationDelay: '180ms' }}>
            One less thing on your move-in checklist.
          </p>
          <div
            className="anim-fade-up mt-5 flex w-full items-center gap-3 rounded-[20px] border border-line bg-card p-3 text-left"
            style={{ animationDelay: '240ms' }}
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <ListingImage listing={listing} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-navy">{listing.title}</p>
              <p className="mt-0.5 text-[13px] font-medium text-orange-deep">{date && formatMoveIn(date, true)}</p>
              <p className="truncate text-[12.5px] text-muted">{pickup}</p>
            </div>
          </div>
          <PrimaryButton type="button" className="mt-5 w-full" onClick={() => finish('claims')}>
            View my claims
          </PrimaryButton>
          <GhostButton type="button" className="mt-2 w-full border-transparent bg-transparent" onClick={() => finish('discover')}>
            Keep browsing
          </GhostButton>
        </div>
      )}
    </Sheet>
  );
}
