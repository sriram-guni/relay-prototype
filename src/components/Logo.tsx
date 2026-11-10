interface MarkProps {
  size?: number;
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * The Relay mark: two arcs meeting in an "exchange zone" — one path
 * hands off to the next, like a baton pass between move-out and move-in.
 */
export function RelayMark({ size = 28, tone = 'dark', className }: MarkProps) {
  const first = tone === 'dark' ? '#14213D' : '#F7F4EC';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <path d="M6 24.5a9 9 0 0 1 18 0" stroke={first} strokeWidth="5.6" strokeLinecap="round" />
      <path d="M16 15.5a9 9 0 0 0 18 0" stroke="#F28C28" strokeWidth="5.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 28, tone = 'dark', className = '' }: MarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Relay">
      <RelayMark size={size} tone={tone} />
      <span
        className="font-display font-semibold tracking-[-0.04em] leading-none"
        style={{ fontSize: size * 0.86, color: tone === 'dark' ? '#14213D' : '#F7F4EC' }}
      >
        relay
      </span>
    </span>
  );
}
