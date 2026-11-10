import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, CircleCheck, Info, ShieldCheck, Star, TriangleAlert } from 'lucide-react';
import { ProductArt } from '../art/ProductArt';
import type { Listing } from '../data/types';
import { useStore } from '../state/store';

/* ---------------- Relay-checked badge ---------------- */
export function RelayBadge({ variant = 'overlay', label = 'Relay-checked' }: { variant?: 'overlay' | 'inline'; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold leading-none tracking-[-0.005em] ${
        variant === 'overlay'
          ? 'bg-white/92 px-2 py-[5px] text-[10.5px] text-green shadow-[0_1px_2px_rgba(20,33,61,0.08)] backdrop-blur-sm'
          : 'bg-green-light px-2.5 py-1.5 text-[12px] text-green'
      }`}
    >
      <ShieldCheck size={variant === 'overlay' ? 12 : 14} strokeWidth={2.4} aria-hidden="true" />
      {label}
    </span>
  );
}

/* ---------------- Listing image with graceful fallback ---------------- */
export function ListingImage({ listing, className = '' }: { listing: Listing; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (listing.photoUrl && !failed) {
    return (
      <img
        src={listing.photoUrl}
        alt={listing.title}
        onError={() => setFailed(true)}
        className={`block h-full w-full object-cover ${className}`}
      />
    );
  }
  return <ProductArt art={listing.art} label={listing.title} className={className} />;
}

/* ---------------- Chips ---------------- */
export function Chip({
  active,
  onClick,
  children,
  icon,
  size = 'md',
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium ${
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-9 px-3.5 text-[13.5px]'
      } ${
        active
          ? 'border-navy bg-navy text-cream shadow-[0_2px_8px_-2px_rgba(20,33,61,0.35)]'
          : 'border-line bg-card text-ink hover:border-[#d5cfc3]'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  title,
  body,
  action,
  art,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  art?: ReactNode;
}) {
  return (
    <div className="anim-fade-up flex flex-col items-center px-8 py-10 text-center">
      <div className="mb-5">{art}</div>
      <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-navy">{title}</h3>
      <p className="mt-1.5 max-w-[260px] text-[14.5px] leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------------- Buttons ---------------- */
export function PrimaryButton({
  children,
  className = '',
  tone = 'orange',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'orange' | 'navy' }) {
  return (
    <button
      {...props}
      className={`press inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl px-6 text-[15.5px] font-semibold tracking-[-0.01em] disabled:opacity-45 ${
        tone === 'orange'
          ? 'bg-orange text-white shadow-[0_8px_20px_-8px_rgba(242,140,40,0.7)] hover:bg-orange-deep'
          : 'bg-navy text-cream shadow-[0_8px_20px_-10px_rgba(20,33,61,0.6)] hover:bg-ink'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`press inline-flex h-[48px] items-center justify-center gap-2 rounded-2xl border border-line bg-card px-5 text-[15px] font-semibold text-navy hover:border-[#d5cfc3] ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------- Check row (display or interactive) ---------------- */
export function CheckMark({ on, size = 22 }: { on: boolean; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center rounded-full transition-all duration-200 ${
        on ? 'scale-100 bg-green text-white' : 'border-[1.5px] border-[#cfc9bd] bg-white text-transparent'
      }`}
    >
      <Check size={size * 0.62} strokeWidth={3.2} className={on ? 'anim-pop' : ''} />
    </span>
  );
}

/* ---------------- Rating ---------------- */
export function RatingInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="press grid h-9 w-9 place-items-center rounded-full hover:bg-orange-light"
        >
          <Star
            size={24}
            strokeWidth={1.8}
            className={`transition-all duration-150 ${n <= shown ? 'scale-110 fill-orange text-orange' : 'text-[#c9c2b5]'}`}
          />
        </button>
      ))}
    </div>
  );
}

/* ---------------- Toast ---------------- */
export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  const Icon = toast.tone === 'warn' ? TriangleAlert : toast.tone === 'success' ? CircleCheck : Info;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-[60] flex justify-center px-4" role="status" aria-live="polite">
      <div
        key={toast.id}
        className="anim-toast flex max-w-full items-center gap-2 rounded-full bg-navy py-2.5 pl-3 pr-4 text-[13.5px] font-medium text-cream shadow-[0_12px_30px_-10px_rgba(20,33,61,0.55)]"
      >
        <Icon size={16} className={toast.tone === 'warn' ? 'text-orange' : 'text-[#7fd1a8]'} aria-hidden="true" />
        <span className="truncate">{toast.text}</span>
      </div>
    </div>
  );
}

/* ---------------- Sheet / dialog (scoped to the app frame) ---------------- */
export function Sheet({
  open,
  onClose,
  label,
  children,
  variant = 'sheet',
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  variant?: 'sheet' | 'dialog';
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const focusables = () =>
      Array.from(el?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])') ?? []);
    window.setTimeout(() => (focusables()[0] ?? el)?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className={`absolute inset-0 z-50 flex ${variant === 'sheet' ? 'items-end' : 'items-center px-6'}`}>
      <div className="anim-fade-in absolute inset-0 bg-navy/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative w-full bg-cream outline-none ${
          variant === 'sheet'
            ? 'anim-sheet-up max-h-[92%] overflow-y-auto rounded-t-[30px] pb-[max(20px,env(safe-area-inset-bottom))] thin-scrollbar'
            : 'anim-pop rounded-[26px] shadow-2xl'
        }`}
      >
        {variant === 'sheet' && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-[#d8d2c6]" aria-hidden="true" />}
        {children}
      </div>
    </div>,
    document.getElementById('app-frame') ?? document.body,
  );
}

/* ---------------- Success burst ---------------- */
export function SuccessCheck({ size = 76 }: { size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <span className="anim-ring absolute inset-0 rounded-full bg-orange/40" aria-hidden="true" />
      <span className="anim-pop relative grid h-full w-full place-items-center rounded-full bg-orange shadow-[0_14px_30px_-10px_rgba(242,140,40,0.8)]">
        <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path className="draw-check" d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-muted">{children}</h2>;
}
