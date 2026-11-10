import { MapPin, Star } from 'lucide-react';
import { formatPrice } from '../data/campus';
import { sellerById } from '../data/seed';
import type { Listing } from '../data/types';
import { ListingImage, RelayBadge } from './ui';

function Price({ value, large = false }: { value: number; large?: boolean }) {
  if (value === 0)
    return (
      <span className={`rounded-full bg-green-light font-semibold text-green ${large ? 'px-2.5 py-1 text-[14px]' : 'px-2 py-[3px] text-[12.5px]'}`}>
        Free
      </span>
    );
  return (
    <span className={`font-display font-semibold tracking-[-0.02em] text-navy ${large ? 'text-[26px]' : 'text-[17px]'}`}>
      {formatPrice(value)}
    </span>
  );
}

export function ListingCard({ listing, onOpen, index = 0 }: { listing: Listing; onOpen: () => void; index?: number }) {
  return (
    <button
      type="button"
      data-listing={listing.id}
      onClick={onOpen}
      aria-label={`${listing.title}, ${formatPrice(listing.price)}, ${listing.dorm} ${listing.hall}, ${listing.condition}${
        listing.relayChecked ? ', Relay-checked' : ''
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
      className="anim-fade-up press group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-line bg-card text-left hover:shadow-[0_14px_30px_-18px_rgba(20,33,61,0.35)] active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.035]">
          <ListingImage listing={listing} />
        </div>
        <div className="absolute left-2 top-2 flex gap-1">
          {listing.relayChecked && <RelayBadge />}
          {listing.isOwn && (
            <span className="rounded-full bg-orange px-2 py-[5px] text-[10.5px] font-semibold leading-none text-white">New</span>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <Price value={listing.price} />
          <span className="truncate text-[11.5px] font-medium text-muted">{listing.condition}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[14px] font-medium leading-snug text-ink">{listing.title}</p>
        <p className="mt-auto flex items-center gap-1 pt-1.5 text-[12px] text-muted">
          <MapPin size={12} className="shrink-0 text-orange" aria-hidden="true" />
          <span className="truncate">
            {listing.dorm} · {listing.hall}
          </span>
        </p>
      </div>
    </button>
  );
}

export function FeaturedCard({ listing, onOpen }: { listing: Listing; onOpen: () => void }) {
  const seller = sellerById(listing.sellerId);
  return (
    <button
      type="button"
      data-listing={listing.id}
      onClick={onOpen}
      aria-label={`Featured: ${listing.title}, ${formatPrice(listing.price)}, ${listing.dorm} ${listing.hall}`}
      className="anim-fade-up press group col-span-2 grid grid-cols-[46%_1fr] overflow-hidden rounded-[24px] border border-line bg-card text-left hover:shadow-[0_18px_36px_-20px_rgba(20,33,61,0.4)] active:scale-[0.985]"
    >
      <div className="relative aspect-[4/4.5] overflow-hidden">
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.035]">
          <ListingImage listing={listing} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col p-3.5 pl-4">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-orange-deep">Featured near you</span>
        <p className="mt-1.5 font-display text-[19px] font-semibold leading-[1.12] tracking-[-0.02em] text-navy">{listing.title}</p>
        <p className="mt-1.5 flex items-center gap-1 text-[12.5px] text-muted">
          <MapPin size={12} className="shrink-0 text-orange" aria-hidden="true" />
          <span className="truncate">
            {listing.dorm} · {listing.hall} Hall
          </span>
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1">{listing.relayChecked && <RelayBadge variant="inline" />}</div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price value={listing.price} large />
          <span className="flex items-center gap-1 pb-1 text-[12px] text-muted">
            <Star size={12} className="fill-orange text-orange" aria-hidden="true" />
            <span className="font-semibold text-ink">{seller.rating.toFixed(1)}</span>
            <span className="truncate">· {seller.name.split(' ')[0]}</span>
          </span>
        </div>
      </div>
    </button>
  );
}

export { Price };
