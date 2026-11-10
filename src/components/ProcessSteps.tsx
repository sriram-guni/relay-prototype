import { CalendarCheck, Handshake, Tag } from 'lucide-react';

const STEPS = [
  { n: '01', title: 'List', body: 'Moving out? Post it with a cleaning checklist.', Icon: Tag },
  { n: '02', title: 'Claim', body: 'Moving in? Reserve it for your move-in day.', Icon: CalendarCheck },
  { n: '03', title: 'Pick up', body: 'Meet at your hall. Done before unpacking.', Icon: Handshake },
];

/** LIST → CLAIM → PICK UP, joined by a flowing orange path. */
export function ProcessSteps({ scale = 1, tone = 'light' }: { scale?: number; tone?: 'light' | 'dark' }) {
  const node = 52 * scale;
  const gap = 20 * scale;
  const ink = tone === 'light' ? 'text-navy' : 'text-cream';
  const sub = tone === 'light' ? 'text-muted' : 'text-cream/70';
  return (
    <ol className="grid grid-cols-3" style={{ gap }}>
      {STEPS.map(({ n, title, body, Icon }, i) => (
        <li key={n} className="relative">
          {i < STEPS.length - 1 && (
            <div className="pointer-events-none absolute" style={{ top: 0, height: node, left: node + 10 * scale, right: -gap + 10 * scale }} aria-hidden="true">
            <svg className="block h-full w-full" viewBox="0 0 100 52" preserveAspectRatio="none">
              <path
                d={i === 0 ? 'M0 26 C 30 6, 70 6, 100 26' : 'M0 26 C 30 46, 70 46, 100 26'}
                stroke="#F28C28"
                strokeWidth={2.2 * scale}
                strokeDasharray={`0.1 ${7 * scale}`}
                strokeLinecap="round"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            </div>
          )}
          <span
            className={`relative grid place-items-center rounded-full ${
              i === 2 ? 'bg-orange text-white' : tone === 'light' ? 'bg-navy text-cream' : 'bg-cream text-navy'
            }`}
            style={{ width: node, height: node }}
          >
            <Icon size={22 * scale} strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="font-display font-semibold tracking-[0.08em] text-orange-deep" style={{ fontSize: 12 * scale, marginTop: 16 * scale }}>
            {n}
          </p>
          <p className={`font-display font-semibold tracking-[-0.025em] ${ink}`} style={{ fontSize: 22 * scale, lineHeight: 1.15 }}>
            {title}
          </p>
          <p className={`leading-snug ${sub}`} style={{ fontSize: 13.5 * scale, marginTop: 4 * scale }}>
            {body}
          </p>
        </li>
      ))}
    </ol>
  );
}
