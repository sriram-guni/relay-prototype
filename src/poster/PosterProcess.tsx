import { Logo } from '../components/Logo';
import { ProcessSteps } from '../components/ProcessSteps';

/**
 * Poster-only views, rendered at /?poster=process[&tone=dark|transparent].
 * Used by `npm run assets` to export print-ready graphics with the app's own design system.
 */
export function PosterProcess() {
  const params = new URLSearchParams(window.location.search);
  const tone = params.get('tone');
  const dark = tone === 'dark';
  const transparent = tone === 'transparent';
  return (
    <div
      id="poster"
      className="inline-block"
      style={{ width: 1600, padding: 96, background: transparent ? 'transparent' : dark ? '#14213D' : '#F7F4EC' }}
    >
      <div className="mb-16 flex items-center justify-between">
        <p className={`font-display text-[30px] font-semibold tracking-[-0.02em] ${dark ? 'text-cream' : 'text-navy'}`}>How Relay works</p>
        <Logo size={44} tone={dark ? 'light' : 'dark'} />
      </div>
      <ProcessSteps scale={2.35} tone={dark ? 'dark' : 'light'} />
    </div>
  );
}
