import { useEffect, useRef, useState } from 'react';
import { Handshake, Send } from 'lucide-react';
import { sellerReply } from '../data/pricing';
import { sellerById } from '../data/seed';
import type { Listing } from '../data/types';
import { ListingImage, PrimaryButton, Sheet } from './ui';

interface Msg {
  from: 'me' | 'seller';
  text: string;
  price?: number;
}

const MAX_ROUNDS = 3;

/**
 * Simulated bargaining chat. The buyer sends up to three offers; the seller
 * accepts, counters, or declines. An agreed price is handed back to the claim flow.
 */
export function OfferSheet({
  listing,
  open,
  onClose,
  onDeal,
}: {
  listing: Listing;
  open: boolean;
  onClose: () => void;
  onDeal: (price: number) => void;
}) {
  const seller = sellerById(listing.sellerId);
  const first = seller.name.split(' ')[0];
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [amount, setAmount] = useState('');
  const [round, setRound] = useState(0);
  const [counter, setCounter] = useState<number | undefined>();
  const [deal, setDeal] = useState<number | undefined>();
  const [typing, setTyping] = useState(false);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setMsgs([{ from: 'seller', text: `Hi! The ${listing.title.toLowerCase()} is listed at $${listing.price}. Make me an offer.` }]);
    setAmount('');
    setRound(0);
    setCounter(undefined);
    setDeal(undefined);
  }, [open, listing]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const n = Number(amount);
  const ceiling = counter ?? listing.price;
  const valid = Number.isInteger(n) && n >= 1 && n <= ceiling;
  const outOfRounds = round >= MAX_ROUNDS && deal === undefined;

  const send = (price = n) => {
    if (typing || deal !== undefined || outOfRounds) return;
    const next = round + 1;
    setMsgs((m) => [...m, { from: 'me', text: `Would you take $${price}?`, price }]);
    setAmount('');
    setRound(next);
    setTyping(true);
    window.setTimeout(() => {
      const r = sellerReply(listing.price, price, next, counter);
      setTyping(false);
      if (r.kind === 'accept') {
        setDeal(r.price);
        setMsgs((m) => [...m, { from: 'seller', text: r.text, price: r.price }]);
      } else if (r.kind === 'counter') {
        setCounter(r.price);
        setMsgs((m) => [...m, { from: 'seller', text: r.text, price: r.price }]);
      } else {
        setMsgs((m) => [...m, { from: 'seller', text: r.text }]);
      }
    }, 900);
  };

  const acceptCounter = () => {
    if (counter === undefined) return;
    setMsgs((m) => [...m, { from: 'me', text: `Deal at $${counter}!`, price: counter }]);
    setDeal(counter);
  };

  const quick = [0.8, 0.85, 0.9].map((p) => Math.max(1, Math.round(listing.price * p))).filter((v, i, a) => a.indexOf(v) === i && v < ceiling);

  return (
    <Sheet open={open} onClose={onClose} label={`Make an offer to ${first}`}>
      <div className="px-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <ListingImage listing={listing} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-[19px] font-semibold tracking-[-0.02em] text-navy">Make an offer</h2>
            <p className="truncate text-[12.5px] text-muted">
              {listing.title} · listed ${listing.price}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-[11.5px] font-semibold text-muted">
            {Math.min(round, MAX_ROUNDS)}/{MAX_ROUNDS} offers
          </span>
        </div>

        <div ref={log} className="thin-scrollbar mt-4 h-[230px] space-y-2 overflow-y-auto rounded-[20px] border border-line bg-card p-3" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`anim-fade-up flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <p
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-[13.5px] leading-snug ${
                  m.from === 'me' ? 'rounded-br-md bg-navy text-cream' : 'rounded-bl-md bg-sand text-ink'
                }`}
              >
                {m.from === 'seller' && <span className="mb-0.5 block text-[11px] font-semibold text-muted">{first}</span>}
                {m.text}
              </p>
            </div>
          ))}
          {typing && <p className="px-1 text-[12px] italic text-muted">{first} is typing…</p>}
        </div>

        {deal !== undefined ? (
          <div className="anim-fade-up mt-4">
            <div className="flex items-center gap-3 rounded-2xl bg-green-light px-4 py-3">
              <Handshake size={20} className="shrink-0 text-green" aria-hidden="true" />
              <p className="flex-1 text-[14px] font-semibold text-green">
                Agreed at ${deal}
                {deal < listing.price && <span className="font-medium"> · you saved ${listing.price - deal}</span>}
              </p>
            </div>
            <PrimaryButton type="button" className="mt-3 w-full" onClick={() => onDeal(deal)}>
              Claim at ${deal}
            </PrimaryButton>
          </div>
        ) : (
          <>
            {counter !== undefined && !typing && (
              <button
                type="button"
                onClick={acceptCounter}
                className="press anim-fade-up mt-3 w-full rounded-2xl border border-green/30 bg-green-light py-2.5 text-[14px] font-semibold text-green"
              >
                Accept ${counter}
              </button>
            )}
            {outOfRounds ? (
              <p className="mt-3 text-center text-[12.5px] text-muted">You’ve used all your offers. Accept the last price or claim at the listed price.</p>
            ) : (
              <>
                {quick.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {quick.map((q) => (
                      <button
                        key={q}
                        type="button"
                        disabled={typing}
                        onClick={() => send(q)}
                        className="press flex-1 rounded-full border border-line bg-card py-2 text-[13px] font-semibold text-ink hover:border-orange disabled:opacity-50"
                      >
                        ${q}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  className="mt-2.5 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (valid) send();
                  }}
                >
                  <label className="relative flex-1">
                    <span className="sr-only">Your offer in dollars</span>
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-display text-[16px] font-semibold text-muted">$</span>
                    <input
                      className="field h-12 pl-8 font-display text-[16px] font-semibold"
                      inputMode="numeric"
                      placeholder="Your offer"
                      maxLength={3}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </label>
                  <PrimaryButton type="submit" className="h-12 shrink-0 px-4" disabled={!valid || typing} aria-label="Send offer">
                    <Send size={16} aria-hidden="true" /> Send
                  </PrimaryButton>
                </form>
                {amount && !valid && <p className="mt-1.5 text-[12px] text-[#B4472F]">Offer a whole-dollar amount up to ${ceiling}.</p>}
              </>
            )}
          </>
        )}
        <p className="mt-3 pb-1 text-center text-[11.5px] text-muted">Prototype: the seller’s replies are simulated.</p>
      </div>
    </Sheet>
  );
}
