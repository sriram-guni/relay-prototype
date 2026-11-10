import { useId, type ReactNode } from 'react';
import type { Art } from '../data/types';

/* ------------------------------------------------------------------ *
 * Product "photography" drawn as SVG: a soft studio sweep, a grounded
 * shadow, and a 3/4 view of each object. Everything is local, so the
 * demo never depends on Wi-Fi or remote images.
 * ------------------------------------------------------------------ */

function mix(hex: string, target: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex);
  const b = p(target);
  return (
    '#' +
    a
      .map((v, i) => Math.round(v + (b[i] - v) * t))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}
const lighten = (c: string, t: number) => mix(c, '#ffffff', t);
const darken = (c: string, t: number) => mix(c, '#000000', t);
const isDark = (c: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
};

/** Returns the three faces of a box in oblique 3/4 projection. */
function boxFaces(x: number, y: number, w: number, h: number, d: number, c: string, r = 6) {
  const dx = d * 0.64;
  const dy = d * 0.42;
  const dark = isDark(c);
  const top = lighten(c, dark ? 0.16 : 0.5);
  const side = darken(c, dark ? 0.22 : 0.13);
  const soft = { strokeLinejoin: 'round' as const, strokeWidth: 3 };
  return {
    dx,
    dy,
    top: <path d={`M${x + 1} ${y}L${x + dx} ${y - dy}L${x + w + dx} ${y - dy}L${x + w} ${y}Z`} fill={top} stroke={top} {...soft} />,
    side: <path d={`M${x + w} ${y}L${x + w + dx} ${y - dy}L${x + w + dx} ${y + h - dy - 2}L${x + w} ${y + h}Z`} fill={side} stroke={side} {...soft} />,
    front: <rect x={x} y={y} width={w} height={h} rx={r} fill={c} />,
  };
}

function Shadow({ id, cx, cy, rx, opacity = 0.26 }: { id: string; cx: number; cy: number; rx: number; opacity?: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.11} fill="#2a1f14" opacity={opacity * 0.7} filter={`url(#${id}-blur)`} />
      <ellipse cx={cx} cy={cy - 1} rx={rx * 0.86} ry={4} fill="#2a1f14" opacity={opacity} filter={`url(#${id}-blur-s)`} />
    </g>
  );
}

/* ----------------------------- objects ----------------------------- */

function MiniFridge({ id, c, tall = false }: { id: string; c: string; tall?: boolean }) {
  const w = 148;
  const h = tall ? 226 : 184;
  const d = 44;
  const x = 200 - (w + d * 0.64) / 2;
  const y = 324 - h;
  const f = boxFaces(x, y, w, h, d, c, 7);
  const dark = isDark(c);
  const door = dark ? lighten(c, 0.06) : darken(c, 0.02);
  const seam = dark ? darken(c, 0.35) : darken(c, 0.16);
  const handle = dark ? darken(c, 0.45) : darken(c, 0.24);
  const freezerH = 70;
  return (
    <g>
      <Shadow id={id} cx={x + (w + f.dx) / 2} cy={327} rx={(w + f.dx) / 2 + 10} />
      {f.side}
      {f.top}
      {f.front}
      {/* doors */}
      {tall ? (
        <>
          <rect x={x + 5} y={y + 5} width={w - 10} height={freezerH} rx={5} fill={door} />
          <rect x={x + 5} y={y + freezerH + 9} width={w - 10} height={h - freezerH - 36} rx={5} fill={door} />
          <rect x={x + w - 22} y={y + 22} width={6} height={36} rx={3} fill={handle} />
          <rect x={x + w - 22} y={y + freezerH + 24} width={6} height={64} rx={3} fill={handle} />
        </>
      ) : (
        <>
          <rect x={x + 5} y={y + 5} width={w - 10} height={h - 32} rx={5} fill={door} />
          <rect x={x + w - 22} y={y + 26} width={6} height={72} rx={3} fill={handle} />
        </>
      )}
      {/* subtle sheen */}
      <rect x={x + 14} y={y + 12} width={5} height={h - 52} rx={2.5} fill="#fff" opacity={dark ? 0.08 : 0.5} />
      {/* badge */}
      <rect x={x + 26} y={y + 18} width={22} height={6} rx={3} fill={dark ? lighten(c, 0.3) : darken(c, 0.12)} />
      {/* kick grille */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 18} y={y + h - 22 + i * 6} width={w - 36} height={2} rx={1} fill={seam} opacity={0.6} />
      ))}
      <rect x={x + 10} y={y + h} width={10} height={4} rx={1} fill={darken(c, 0.5)} />
      <rect x={x + w - 20} y={y + h} width={10} height={4} rx={1} fill={darken(c, 0.5)} />
    </g>
  );
}

function DeskLamp({ id, c }: { id: string; c: string }) {
  const joint = lighten(c, 0.25);
  return (
    <g>
      <ellipse cx={118} cy={330} rx={70} ry={12} fill="#FFD79A" opacity={0.55} filter={`url(#${id}-blur)`} />
      <Shadow id={id} cx={170} cy={324} rx={60} />
      {/* base */}
      <path d="M116 310 L116 318 A54 13 0 0 0 224 318 L224 310 Z" fill={darken(c, 0.25)} />
      <ellipse cx={170} cy={310} rx={54} ry={13} fill={lighten(c, 0.12)} />
      <ellipse cx={170} cy={309} rx={30} ry={6} fill={lighten(c, 0.22)} />
      {/* arms */}
      <line x1={172} y1={302} x2={238} y2={196} stroke={c} strokeWidth={9} strokeLinecap="round" />
      <line x1={180} y1={298} x2={244} y2={198} stroke={lighten(c, 0.35)} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      <line x1={238} y1={196} x2={170} y2={128} stroke={c} strokeWidth={9} strokeLinecap="round" />
      <line x1={244} y1={190} x2={176} y2={122} stroke={lighten(c, 0.35)} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      <circle cx={172} cy={302} r={10} fill={c} />
      <circle cx={172} cy={302} r={4} fill={joint} />
      <circle cx={238} cy={196} r={10} fill={c} />
      <circle cx={238} cy={196} r={4} fill={joint} />
      {/* shade */}
      <g transform="translate(164 132) rotate(32)">
        <path d="M-13 -4 L13 -4 L42 60 Q0 74 -42 60 Z" fill={c} />
        <path d="M-13 -4 L0 -4 L-6 64 Q-26 66 -42 60 Z" fill={lighten(c, 0.14)} opacity={0.7} />
        <ellipse cx={0} cy={62} rx={42} ry={10} fill={darken(c, 0.35)} />
        <ellipse cx={0} cy={62} rx={22} ry={5.5} fill="#FFF3D6" />
        <ellipse cx={0} cy={62} rx={30} ry={7.5} fill="#FFE3AE" opacity={0.45} />
        <circle cx={0} cy={-6} r={8} fill={c} />
      </g>
    </g>
  );
}

function ClipLamp({ id, c }: { id: string; c: string }) {
  const metal = '#3A3F4A';
  return (
    <g>
      {/* desk edge */}
      <rect x={-10} y={262} width={244} height={44} fill="#2a1f14" opacity={0.12} filter={`url(#${id}-blur)`} />
      <rect x={-10} y={248} width={240} height={20} rx={3} fill="#D7BC95" />
      <rect x={-10} y={248} width={240} height={4} rx={2} fill="#E6D0AF" />
      <rect x={-10} y={264} width={240} height={4} fill="#BF9F76" />
      <ellipse cx={150} cy={250} rx={62} ry={5} fill="#FFE0A6" opacity={0.8} filter={`url(#${id}-blur-s)`} />
      {/* clamp */}
      <rect x={196} y={236} width={34} height={13} rx={3} fill={c} />
      <rect x={220} y={236} width={11} height={52} rx={3} fill={darken(c, 0.12)} />
      <rect x={198} y={278} width={33} height={10} rx={3} fill={c} />
      <rect x={207} y={286} width={5} height={22} fill={metal} />
      <rect x={198} y={304} width={23} height={8} rx={3} fill={darken(c, 0.2)} />
      {/* gooseneck */}
      <path d="M212 238 C212 196 282 184 268 128" stroke={metal} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M212 238 C212 196 282 184 268 128" stroke="#5A606C" strokeWidth={10} fill="none" strokeDasharray="1.6 3.2" />
      {/* head */}
      <g transform="translate(258 126) rotate(38)">
        <rect x={-7} y={-22} width={14} height={14} rx={3} fill={darken(c, 0.15)} />
        <path d="M-40 18 A40 34 0 0 1 40 18 Z" fill={c} />
        <path d="M-40 18 A40 34 0 0 1 -6 -15 Q-26 0 -28 18 Z" fill={lighten(c, 0.22)} opacity={0.7} />
        <ellipse cx={0} cy={18} rx={40} ry={8} fill={darken(c, 0.3)} />
        <ellipse cx={0} cy={18} rx={18} ry={4.5} fill="#FFF3D6" />
      </g>
    </g>
  );
}

function DeskFan({ id, c }: { id: string; c: string }) {
  const cage = isDark(c) ? lighten(c, 0.3) : darken(c, 0.22);
  const blade = isDark(c) ? lighten(c, 0.15) : mix(c, '#B9C7D6', 0.45);
  const cx = 200;
  const cy = 170;
  return (
    <g>
      <Shadow id={id} cx={204} cy={328} rx={72} />
      {/* base */}
      <path d="M136 328 L148 300 Q151 294 158 294 L242 294 Q249 294 252 300 L264 328 Z" fill={darken(c, 0.08)} />
      <path d="M150 300 Q152 294 158 294 L242 294 Q248 294 250 300 Z" fill={lighten(c, 0.4)} />
      <circle cx={232} cy={312} r={6} fill="#F28C28" />
      <rect x={158} y={309} width={30} height={5} rx={2.5} fill={darken(c, 0.2)} />
      {/* neck */}
      <rect x={191} y={236} width={18} height={62} rx={6} fill={darken(c, 0.06)} />
      <rect x={191} y={236} width={6} height={62} rx={3} fill={lighten(c, 0.4)} opacity={0.7} />
      {/* blades */}
      <g transform={`translate(${cx} ${cy})`}>
        {[15, 135, 255].map((a) => (
          <path key={a} transform={`rotate(${a})`} d="M0 0 C18 -14 56 -34 70 -10 C74 8 34 16 0 0Z" fill={blade} opacity={0.95} />
        ))}
      </g>
      {/* cage */}
      <circle cx={cx} cy={cy} r={90} fill="none" stroke={c} strokeWidth={9} />
      <circle cx={cx} cy={cy} r={90} fill="none" stroke={cage} strokeWidth={1.4} opacity={0.6} />
      <circle cx={cx} cy={cy} r={94.5} fill="none" stroke={cage} strokeWidth={1.2} opacity={0.5} />
      {[66, 44].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={cage} strokeWidth={1.6} opacity={0.75} />
      ))}
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * 22}
            y1={cy + Math.sin(a) * 22}
            x2={cx + Math.cos(a) * 86}
            y2={cy + Math.sin(a) * 86}
            stroke={cage}
            strokeWidth={1.1}
            opacity={0.55}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={22} fill={c} />
      <circle cx={cx} cy={cy} r={22} fill="none" stroke={cage} strokeWidth={1.4} opacity={0.6} />
      <circle cx={cx} cy={cy} r={7} fill={cage} opacity={0.6} />
    </g>
  );
}

function TowerFan({ id, c }: { id: string; c: string }) {
  const slot = isDark(c) ? darken(c, 0.4) : darken(c, 0.25);
  return (
    <g>
      <Shadow id={id} cx={204} cy={328} rx={74} />
      {/* base */}
      <path d="M140 316 L140 322 A60 12 0 0 0 260 322 L260 316 Z" fill={darken(c, 0.25)} />
      <ellipse cx={200} cy={316} rx={60} ry={12} fill={lighten(c, 0.14)} />
      {/* body */}
      <rect x={168} y={64} width={64} height={252} rx={28} fill={c} />
      <rect x={168} y={64} width={22} height={252} rx={11} fill={lighten(c, 0.12)} opacity={0.8} />
      <rect x={216} y={70} width={14} height={240} rx={7} fill={darken(c, 0.2)} opacity={0.6} />
      {/* panel */}
      <rect x={184} y={80} width={32} height={20} rx={6} fill={darken(c, 0.35)} />
      <circle cx={193} cy={90} r={3} fill="#F28C28" />
      <rect x={200} y={88} width={10} height={4} rx={2} fill={lighten(c, 0.4)} />
      {/* grille */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={180 + i * 6} y={116} width={2.6} height={176} rx={1.3} fill={slot} />
      ))}
      {/* remote */}
      <rect x={258} y={316} width={42} height={12} rx={4} fill={darken(c, 0.1)} />
      <rect x={258} y={316} width={42} height={4} rx={2} fill={lighten(c, 0.2)} />
      <circle cx={266} cy={322} r={1.8} fill="#F28C28" />
      <circle cx={274} cy={322} r={1.8} fill={lighten(c, 0.4)} />
    </g>
  );
}

function DrawerTower({ id, c }: { id: string; c: string }) {
  const x = 140;
  const y = 128;
  const w = 128;
  const h = 190;
  const f = boxFaces(x, y, w, h, 36, c, 7);
  const tints = ['#F28C28', '#14213D', '#287A5A'];
  return (
    <g>
      <Shadow id={id} cx={x + (w + f.dx) / 2} cy={328} rx={(w + f.dx) / 2 + 8} />
      {f.side}
      {f.top}
      {f.front}
      {[0, 1, 2].map((i) => {
        const dy = y + 8 + i * 61;
        return (
          <g key={i}>
            <rect x={x + 8} y={dy} width={w - 16} height={54} rx={5} fill="#D6DEE3" />
            <rect x={x + 20 + i * 14} y={dy + 22} width={42 - i * 6} height={22} rx={4} fill={tints[i]} opacity={0.28} />
            <rect x={x + 70} y={dy + 26} width={24} height={18} rx={4} fill={tints[(i + 1) % 3]} opacity={0.18} />
            <rect x={x + 8} y={dy} width={w - 16} height={54} rx={5} fill="#fff" opacity={0.35} />
            <rect x={x + w / 2 - 15} y={dy + 7} width={30} height={7} rx={3.5} fill={darken(c, 0.22)} />
          </g>
        );
      })}
      {[x + 16, x + w - 16].map((cx) => (
        <circle key={cx} cx={cx} cy={324} r={6} fill="#3A3F4A" />
      ))}
      <circle cx={x + w + f.dx - 14} cy={324 - f.dy} r={5} fill="#3A3F4A" />
    </g>
  );
}

function RollingCart({ id, c }: { id: string; c: string }) {
  const x = 118;
  const w = 150;
  const d = 46;
  const trays = [112, 184, 256];
  const th = 34;
  const post = darken(c, 0.12);
  const dx = d * 0.64;
  const dy = d * 0.42;
  const contents: ReactNode[] = [
    <g key="t0">
      {/* plant */}
      <path d={`M${x + 34} ${trays[0] - 30} L${x + 64} ${trays[0] - 30} L${x + 60} ${trays[0] + 6} L${x + 38} ${trays[0] + 6}Z`} fill="#C9774A" />
      <path d={`M${x + 49} ${trays[0] - 30} C${x + 30} ${trays[0] - 60} ${x + 22} ${trays[0] - 50} ${x + 30} ${trays[0] - 36}Z`} fill="#4F7A55" />
      <path d={`M${x + 49} ${trays[0] - 30} C${x + 60} ${trays[0] - 74} ${x + 76} ${trays[0] - 60} ${x + 68} ${trays[0] - 38}Z`} fill="#3E6A47" />
      <path d={`M${x + 49} ${trays[0] - 30} C${x + 46} ${trays[0] - 70} ${x + 56} ${trays[0] - 72} ${x + 54} ${trays[0] - 40}Z`} fill="#5D8C62" />
      {/* mug */}
      <rect x={x + 92} y={trays[0] - 22} width={26} height={28} rx={5} fill="#F28C28" />
      <path d={`M${x + 118} ${trays[0] - 16} q10 0 10 8 q0 8 -10 8`} stroke="#F28C28" strokeWidth={4} fill="none" />
    </g>,
    <g key="t1">
      <rect x={x + 24} y={trays[1] - 14} width={70} height={11} rx={2} fill="#14213D" />
      <rect x={x + 30} y={trays[1] - 24} width={64} height={11} rx={2} fill="#E9DDC6" />
      <rect x={x + 104} y={trays[1] - 18} width={22} height={24} rx={3} fill="#FFFEFB" />
    </g>,
    <g key="t2" />,
  ];
  return (
    <g>
      <Shadow id={id} cx={x + (w + dx) / 2} cy={328} rx={(w + dx) / 2 + 8} />
      {/* back posts */}
      {[x + dx + 5, x + w + dx - 5].map((px) => (
        <rect key={px} x={px - 3} y={trays[0] - dy - 4} width={6} height={trays[2] + th - trays[0] + 14} rx={3} fill={darken(c, 0.3)} />
      ))}
      {trays.map((ty, i) => {
        const f = boxFaces(x, ty, w, th, d, c, 5);
        return (
          <g key={ty}>
            {f.side}
            {f.top}
            {contents[i]}
            {f.front}
            {Array.from({ length: 9 }).map((_, k) => (
              <circle key={k} cx={x + 19 + k * 14} cy={ty + th / 2} r={3} fill={darken(c, 0.28)} />
            ))}
          </g>
        );
      })}
      {/* front posts */}
      {[x + 4, x + w - 4].map((px) => (
        <rect key={px} x={px - 3.5} y={trays[0] - 6} width={7} height={trays[2] + th - trays[0] + 24} rx={3.5} fill={post} />
      ))}
      {[x + 4, x + w - 4].map((px) => (
        <circle key={px} cx={px} cy={321} r={8} fill="#2E323B" />
      ))}
      <circle cx={x + w + dx - 5} cy={321 - dy} r={6} fill="#2E323B" />
    </g>
  );
}

function DeskCaddy({ id, c }: { id: string; c: string }) {
  const cup = boxFaces(128, 188, 58, 136, 40, c, 6);
  const tray = boxFaces(190, 262, 112, 62, 40, c, 6);
  const mesh = `${id}-mesh`;
  return (
    <g>
      <defs>
        <pattern id={mesh} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill={c} />
          <rect width="3.2" height="3.2" fill={lighten(c, 0.12)} />
        </pattern>
      </defs>
      <Shadow id={id} cx={222} cy={328} rx={112} />
      {/* tray */}
      {tray.side}
      {tray.top}
      <rect x={214} y={232} width={40} height={40} rx={2} fill="#F28C28" transform="rotate(-8 234 252)" />
      <rect x={252} y={240} width={34} height={34} rx={2} fill="#FFE7B8" transform="rotate(6 269 257)" />
      <rect x={190} y={262} width={112} height={62} rx={6} fill={`url(#${mesh})`} />
      <rect x={190} y={262} width={112} height={4} rx={2} fill={lighten(c, 0.25)} />
      {/* cup */}
      {cup.side}
      {cup.top}
      {[
        { x1: 146, x2: 134, col: '#F28C28', top: 104 },
        { x1: 160, x2: 166, col: '#E8C15A', top: 96 },
        { x1: 174, x2: 188, col: '#F7F4EC', top: 118 },
      ].map((p) => (
        <g key={p.col}>
          <line x1={p.x1} y1={196} x2={p.x2} y2={p.top} stroke={p.col} strokeWidth={8} />
          <line x1={p.x2} y1={p.top} x2={p.x2 + (p.x2 - p.x1) * 0.12} y2={p.top - 12} stroke="#E4C9A2" strokeWidth={6} strokeLinecap="round" />
        </g>
      ))}
      <rect x={128} y={188} width={58} height={136} rx={6} fill={`url(#${mesh})`} />
      <rect x={128} y={188} width={58} height={4} rx={2} fill={lighten(c, 0.25)} />
      {/* honest chip, as described */}
      <path d="M128 318 l8 0 l-3 6 l-5 0z" fill={lighten(c, 0.5)} opacity={0.6} />
    </g>
  );
}

function UnderDeskDrawers({ id, c }: { id: string; c: string }) {
  const x = 96;
  const y = 202;
  const w = 206;
  const h = 118;
  const f = boxFaces(x, y, w, h, 44, c, 7);
  return (
    <g>
      <Shadow id={id} cx={x + (w + f.dx) / 2} cy={328} rx={(w + f.dx) / 2 + 8} />
      {f.side}
      {f.top}
      {f.front}
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={x + 9} y={y + 9 + i * 52} width={w - 18} height={46} rx={5} fill={darken(c, 0.04)} />
          <rect x={x + 9} y={y + 9 + i * 52} width={w - 18} height={3} rx={1.5} fill="#fff" opacity={0.6} />
          <rect x={x + w / 2 - 26} y={y + 24 + i * 52} width={52} height={7} rx={3.5} fill="#3A3F4A" />
        </g>
      ))}
      {[x + 16, x + w - 16].map((cx) => (
        <circle key={cx} cx={cx} cy={324} r={6} fill="#3A3F4A" />
      ))}
      <circle cx={x + w + f.dx - 14} cy={324 - f.dy} r={5} fill="#3A3F4A" />
    </g>
  );
}

function Microwave({ id, c }: { id: string; c: string }) {
  const x = 88;
  const y = 200;
  const w = 198;
  const h = 120;
  const f = boxFaces(x, y, w, h, 60, c, 8);
  const dark = isDark(c);
  const glassA = dark ? '#0F131A' : '#2A313D';
  const glassB = dark ? '#262D39' : '#4A5363';
  const panel = dark ? lighten(c, 0.08) : darken(c, 0.05);
  const btn = dark ? lighten(c, 0.25) : darken(c, 0.16);
  const g = `${id}-glass`;
  return (
    <g>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={glassB} />
          <stop offset="1" stopColor={glassA} />
        </linearGradient>
      </defs>
      <Shadow id={id} cx={x + (w + f.dx) / 2} cy={327} rx={(w + f.dx) / 2 + 10} />
      {f.side}
      {f.top}
      {f.front}
      <rect x={x + 10} y={y + 12} width={130} height={h - 24} rx={8} fill={`url(#${g})`} />
      <path d={`M${x + 30} ${y + 12} L${x + 62} ${y + 12} L${x + 34} ${y + h - 12} L${x + 10} ${y + h - 12} L${x + 10} ${y + 70}Z`} fill="#fff" opacity={0.07} />
      <rect x={x + 146} y={y + 8} width={w - 154} height={h - 16} rx={6} fill={panel} />
      <rect x={x + 154} y={y + 18} width={w - 170} height={16} rx={3} fill="#1B212C" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 160 + i * 8} y={y + 23} width={5} height={6} rx={1} fill="#F28C28" opacity={0.95} />
      ))}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((k) => <rect key={`${r}${k}`} x={x + 156 + k * 11} y={y + 44 + r * 10} width={8} height={5} rx={2} fill={btn} />),
      )}
      <circle cx={x + 172} cy={y + h - 22} r={10} fill={btn} />
      <circle cx={x + 172} cy={y + h - 22} r={4} fill={panel} />
      <rect x={x + 12} y={y + h} width={12} height={5} rx={1.5} fill={darken(c, 0.5)} />
      <rect x={x + w - 24} y={y + h} width={12} height={5} rx={1.5} fill={darken(c, 0.5)} />
    </g>
  );
}

/* ----------------------------- scene ----------------------------- */

export function ProductArt({ art, label, className = '' }: { art: Art; label: string; className?: string }) {
  const raw = useId();
  const id = 'a' + raw.replace(/[^a-zA-Z0-9]/g, '');
  const obj = (() => {
    switch (art.kind) {
      case 'mini-fridge':
        return <MiniFridge id={id} c={art.body} />;
      case 'fridge-freezer':
        return <MiniFridge id={id} c={art.body} tall />;
      case 'desk-lamp':
        return <DeskLamp id={id} c={art.body} />;
      case 'clip-lamp':
        return <ClipLamp id={id} c={art.body} />;
      case 'desk-fan':
        return <DeskFan id={id} c={art.body} />;
      case 'tower-fan':
        return <TowerFan id={id} c={art.body} />;
      case 'drawer-tower':
        return <DrawerTower id={id} c={art.body} />;
      case 'rolling-cart':
        return <RollingCart id={id} c={art.body} />;
      case 'desk-caddy':
        return <DeskCaddy id={id} c={art.body} />;
      case 'under-desk-drawers':
        return <UnderDeskDrawers id={id} c={art.body} />;
      case 'microwave':
        return <Microwave id={id} c={art.body} />;
    }
  })();
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
      className={`block h-full w-full ${className}`}
    >
      <defs>
        <radialGradient id={`${id}-light`} cx="0.32" cy="0.18" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a4128" stopOpacity="0" />
          <stop offset="1" stopColor="#5a4128" stopOpacity="0.09" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={`${id}-blur-s`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      <rect width="400" height="400" fill={art.backdrop} />
      <rect width="400" height="400" fill={`url(#${id}-light)`} />
      <rect y="250" width="400" height="150" fill={`url(#${id}-floor)`} />
      <g transform="translate(200 338) scale(1.12) translate(-200 -330)">{obj}</g>
    </svg>
  );
}
