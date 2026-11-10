import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, ImagePlus, Info, Sparkles, Trash2, WandSparkles } from 'lucide-react';
import { CATEGORIES, CLEANING_STEPS, CONDITIONS, DORM_AREAS, findRestrictedWord } from '../data/campus';
import { CATEGORY_FALLBACK_ART } from '../data/seed';
import type { Category, Condition, DormArea, Listing } from '../data/types';
import { ListingCard } from '../components/ListingCard';
import { CheckMark, Chip, GhostButton, PrimaryButton, SuccessCheck } from '../components/ui';
import { ProductArt } from '../art/ProductArt';
import { useNav } from '../state/nav';
import { useStore } from '../state/store';
import { CATEGORY_ICON } from './Discover';

interface Form {
  photo: { url: string; name: string } | null;
  title: string;
  category: Category | null;
  dorm: DormArea | null;
  hall: string;
  condition: Condition | null;
  priceMode: 'free' | 'set';
  price: string;
  description: string;
  checked: string[];
}

const EMPTY: Form = {
  photo: null,
  title: '',
  category: null,
  dorm: null,
  hall: '',
  condition: null,
  priceMode: 'set',
  price: '',
  description: '',
  checked: [],
};

/** Demo shortcut: everything except the cleaning confirmations. */
const SAMPLE: Form = {
  ...EMPTY,
  title: 'Dimmable LED Desk Lamp',
  category: 'Lamp',
  dorm: 'ISR',
  hall: 'Wardall',
  condition: 'Very good',
  priceMode: 'set',
  price: '10',
  description:
    'Three brightness levels and a USB port in the base. Bright enough for 2 a.m. problem sets, warm enough for winding down. Tiny scratch on the base.',
};

type Errors = Partial<Record<'title' | 'category' | 'dorm' | 'hall' | 'condition' | 'price' | 'description' | 'cleaning' | 'photo', string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  const restricted = findRestrictedWord(f.title);
  if (f.title.trim().length < 3) e.title = 'Give your item a name (at least 3 characters).';
  else if (restricted) e.title = `“${restricted}” falls under soft goods, which Relay doesn’t support yet.`;
  if (!f.category) e.category = 'Choose a category.';
  if (!f.dorm) e.dorm = 'Choose your residence area.';
  else if (!f.hall) e.hall = 'Choose your hall.';
  if (!f.condition) e.condition = 'Choose a condition.';
  if (f.priceMode === 'set') {
    const n = Number(f.price);
    if (!f.price) e.price = 'Enter a price, or switch to Free.';
    else if (!Number.isInteger(n) || n < 1 || n > 500) e.price = 'Enter a whole-dollar price between $1 and $500.';
  }
  if (f.description.trim().length < 10) e.description = 'Add a short description (at least 10 characters).';
  if (f.category && f.checked.length < CLEANING_STEPS[f.category].length) e.cleaning = 'Complete every cleaning step before publishing.';
  return e;
}

function Field({ label, error, hint, children, id }: { label: string; error?: string; hint?: ReactNode; children: ReactNode; id: string }) {
  return (
    <div id={`f-${id}`} className="scroll-mt-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-semibold text-navy">{label}</span>
        {hint && <span className="text-[12px] text-muted">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="anim-fade-up mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-[#B4472F]" role="alert">
          <CircleAlert size={14} className="mt-[1px] shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function ListItem() {
  const { publish, showToast } = useStore();
  const { openDetail, goTab } = useNav();
  const [f, setF] = useState<Form>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [published, setPublished] = useState<Listing | null>(null);
  const [photoError, setPhotoError] = useState('');
  const top = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const errors = validate(f);
  const shown: Errors = submitted ? errors : {};
  const restrictedLive = findRestrictedWord(f.title);
  if (!submitted && restrictedLive) shown.title = errors.title;

  const steps = f.category ? CLEANING_STEPS[f.category] : [];
  const done = steps.filter((s) => f.checked.includes(s)).length;

  useEffect(() => {
    top.current?.closest('[data-scroll]')?.scrollTo({ top: 0 });
  }, [published]);

  const onPhoto = (file?: File) => {
    setPhotoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) return setPhotoError('That file isn’t an image. Try a JPG or PNG.');
    if (file.size > 12 * 1024 * 1024) return setPhotoError('That photo is over 12 MB. Try a smaller one.');
    if (f.photo) URL.revokeObjectURL(f.photo.url);
    set('photo', { url: URL.createObjectURL(file), name: file.name });
  };

  const submit = () => {
    setSubmitted(true);
    const keys = Object.keys(errors);
    if (keys.length) {
      const order = ['title', 'category', 'dorm', 'hall', 'condition', 'price', 'description', 'cleaning'];
      const first = order.find((k) => keys.includes(k));
      document.getElementById(`f-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast(errors.cleaning && keys.length === 1 ? 'Finish the cleaning checklist to publish.' : 'Almost there. Check the highlighted fields.', 'warn');
      return;
    }
    const listing: Listing = {
      id: `l-own-${Date.now()}`,
      title: f.title.trim().replace(/\s+/g, ' '),
      category: f.category!,
      price: f.priceMode === 'free' ? 0 : Number(f.price),
      dorm: f.dorm!,
      hall: f.hall,
      condition: f.condition!,
      description: f.description.trim(),
      sellerId: 'me',
      relayChecked: false,
      art: { ...CATEGORY_FALLBACK_ART[f.category!] },
      photoUrl: f.photo?.url,
      cleaning: steps,
      postedLabel: 'Just now',
      isOwn: true,
    };
    publish(listing);
    setPublished(listing);
    showToast('Listing published to Discover', 'success');
  };

  const restart = () => {
    setF(EMPTY);
    setSubmitted(false);
    setPublished(null);
    setPhotoError('');
  };

  if (published) {
    return (
      <div ref={top} className="flex flex-col items-center px-6 pb-10 pt-[max(40px,env(safe-area-inset-top))] text-center">
        <SuccessCheck />
        <h1 className="anim-fade-up mt-5 font-display text-[30px] font-semibold tracking-[-0.035em] text-navy" style={{ animationDelay: '120ms' }}>
          You’re live.
        </h1>
        <p className="anim-fade-up mt-1.5 max-w-[290px] text-[15px] leading-snug text-muted" style={{ animationDelay: '180ms' }}>
          Your {published.title} is on Discover, ready for an incoming student.
        </p>
        <div className="mt-6 w-[200px] text-left">
          <ListingCard listing={published} onOpen={() => (goTab('discover'), openDetail(published.id))} />
        </div>
        <div className="mt-6 flex w-full flex-col gap-2">
          <PrimaryButton
            type="button"
            className="w-full"
            onClick={() => {
              goTab('discover');
              openDetail(published.id);
            }}
          >
            View listing
          </PrimaryButton>
          <GhostButton type="button" className="w-full" onClick={restart}>
            List another item
          </GhostButton>
        </div>
      </div>
    );
  }

  return (
    <div ref={top} className="px-5 pb-10 pt-[max(20px,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-orange-deep">Moving out?</p>
          <h1 className="mt-1 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.035em] text-navy">Pass it forward.</h1>
          <p className="mt-1.5 text-[14.5px] leading-snug text-muted">Your old essential could be someone’s new favorite.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setF((p) => ({ ...SAMPLE, photo: p.photo }));
            setSubmitted(false);
            showToast('Sample lamp filled in. Now finish the cleaning steps.');
          }}
          className="press mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-[#d5cfc3] bg-card px-3 py-2 text-[12px] font-semibold text-ink hover:border-orange hover:text-orange-deep"
        >
          <WandSparkles size={14} aria-hidden="true" />
          Try sample
        </button>
      </div>

      <form
        className="mt-6 space-y-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {/* photo */}
        <Field label="Photo" hint="Optional" id="photo" error={photoError}>
          {f.photo ? (
            <div className="relative overflow-hidden rounded-[20px] border border-line">
              <img src={f.photo.url} alt="Your item preview" className="aspect-[16/10] w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(f.photo!.url);
                  set('photo', null);
                }}
                className="press absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-[12.5px] font-semibold text-ink backdrop-blur"
              >
                <Trash2 size={14} aria-hidden="true" /> Remove
              </button>
            </div>
          ) : (
            <label className="press group flex cursor-pointer items-center gap-4 rounded-[20px] border-[1.5px] border-dashed border-[#d5cfc3] bg-card p-3 hover:border-orange focus-within:border-orange">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl">
                <ProductArt art={CATEGORY_FALLBACK_ART[f.category ?? 'Fridge']} label="" />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[14.5px] font-semibold text-navy">
                  <ImagePlus size={16} className="text-orange" aria-hidden="true" /> Add a photo
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted">No photo? We’ll use a clean studio image for your category.</p>
              </div>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          )}
        </Field>

        {/* title */}
        <Field label="Item title" id="title" error={shown.title} hint={`${f.title.length}/60`}>
          <input
            className="field"
            value={f.title}
            maxLength={60}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Compact mini fridge"
            aria-invalid={!!shown.title}
          />
        </Field>

        {/* category */}
        <Field label="Category" id="category" error={shown.category}>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Category">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c];
              const on = f.category === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setF((p) => ({ ...p, category: c, checked: p.category === c ? p.checked : [] }))}
                  className={`press flex h-[70px] flex-col items-center justify-center gap-1.5 rounded-2xl border text-[11.5px] font-semibold ${
                    on ? 'border-navy bg-navy text-cream' : 'border-line bg-card text-ink hover:border-[#d5cfc3]'
                  }`}
                >
                  <Icon size={21} strokeWidth={1.9} aria-hidden="true" className={on ? 'text-orange' : ''} />
                  {c}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2.5 rounded-2xl bg-orange-light/70 p-3.5">
            <Info size={16} className="mt-[1px] shrink-0 text-orange-deep" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-navy">Not everything makes a good hand-me-down.</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
                For now, Relay focuses on easy-to-clean dorm essentials. Bedding and other soft goods aren’t supported.
              </p>
            </div>
          </div>
        </Field>

        {/* dorm + hall */}
        <Field label="Residence area" id="dorm" error={shown.dorm}>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Residence area">
            {DORM_AREAS.map((d) => (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={f.dorm === d.id}
                onClick={() => setF((p) => ({ ...p, dorm: d.id, hall: p.dorm === d.id ? p.hall : '' }))}
                className={`press h-11 rounded-xl border text-[13px] font-semibold ${
                  f.dorm === d.id ? 'border-navy bg-navy text-cream' : 'border-line bg-card text-ink hover:border-[#d5cfc3]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Field>
        {f.dorm && (
          <div className="anim-fade-up">
            <Field label="Residence hall" id="hall" error={shown.hall} hint={DORM_AREAS.find((d) => d.id === f.dorm)!.full}>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Residence hall">
                {DORM_AREAS.find((d) => d.id === f.dorm)!.halls.map((h) => (
                  <Chip key={h} size="sm" active={f.hall === h} onClick={() => set('hall', h)}>
                    {h}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* condition */}
        <Field label="Condition" id="condition" error={shown.condition}>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <Chip key={c} size="sm" active={f.condition === c} onClick={() => set('condition', c)}>
                {c}
              </Chip>
            ))}
          </div>
        </Field>

        {/* price */}
        <Field label="Price" id="price" error={shown.price}>
          <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-[176px] shrink-0 grid-cols-2 rounded-2xl border border-line bg-sand/60 p-1" role="radiogroup" aria-label="Pricing">
              <span
                aria-hidden="true"
                className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-xl bg-card shadow-[0_2px_8px_-3px_rgba(20,33,61,0.3)] transition-transform duration-200 ease-[var(--ease-out-soft)] ${
                  f.priceMode === 'set' ? 'translate-x-[calc(100%)]' : 'translate-x-0'
                }`}
                style={{ left: 4 }}
              />
              {(['free', 'set'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={f.priceMode === m}
                  onClick={() => setF((p) => ({ ...p, priceMode: m, price: m === 'free' ? '0' : p.price === '0' ? '' : p.price }))}
                  className={`relative z-10 rounded-xl text-[13.5px] font-semibold transition-colors ${f.priceMode === m ? 'text-navy' : 'text-muted'}`}
                >
                  {m === 'free' ? 'Free' : 'Set price'}
                </button>
              ))}
            </div>
            {f.priceMode === 'set' ? (
              <label className="relative flex-1">
                <span className="sr-only">Price in dollars</span>
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-display text-[16px] font-semibold text-muted">$</span>
                <input
                  className="field h-12 pl-8 font-display text-[16px] font-semibold"
                  inputMode="numeric"
                  value={f.price}
                  maxLength={3}
                  placeholder="0"
                  onChange={(e) => set('price', e.target.value.replace(/[^0-9]/g, ''))}
                  aria-invalid={!!shown.price}
                />
              </label>
            ) : (
              <p className="flex-1 text-[13px] leading-snug text-green">
                <span className="font-semibold">$0.</span> Someone’s move-in just got easier.
              </p>
            )}
          </div>
        </Field>

        {/* description */}
        <Field label="Description" id="description" error={shown.description} hint={`${f.description.length}/280`}>
          <textarea
            className="field min-h-[128px] resize-none leading-relaxed"
            maxLength={280}
            value={f.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Size, age, quirks. Honest details build trust."
            aria-invalid={!!shown.description}
          />
        </Field>

        {/* cleaning checklist */}
        <div id="f-cleaning" className="scroll-mt-4">
          <section
            aria-labelledby="clean-form-title"
            className={`rounded-[24px] border p-4 transition-colors ${
              shown.cleaning ? 'border-[#B4472F]/40 bg-[#fdf3ef]' : steps.length && done === steps.length ? 'border-green/20 bg-green-light' : 'border-line bg-card'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-green">
                  <Sparkles size={13} aria-hidden="true" /> Required
                </p>
                <h2 id="clean-form-title" className="mt-1 font-display text-[19px] font-semibold tracking-[-0.02em] text-navy">
                  Cleaning checklist
                </h2>
              </div>
              {steps.length > 0 && (
                <span className="mt-1 font-display text-[14px] font-semibold text-navy" aria-live="polite">
                  {done}/{steps.length}
                </span>
              )}
            </div>
            {steps.length > 0 ? (
              <>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9e4da]" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-green transition-[width] duration-300 ease-[var(--ease-out-soft)]"
                    style={{ width: `${(done / steps.length) * 100}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-1">
                  {steps.map((s) => {
                    const on = f.checked.includes(s);
                    return (
                      <li key={s}>
                        <label className="press flex cursor-pointer items-center gap-3 rounded-xl px-1.5 py-2 text-[14.5px] font-medium text-ink hover:bg-white/60">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={on}
                            onChange={() => set('checked', on ? f.checked.filter((x) => x !== s) : [...f.checked, s])}
                          />
                          <span className="rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange">
                            <CheckMark on={on} size={24} />
                          </span>
                          <span className={on ? 'text-ink' : 'text-ink/85'}>{s}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-[12px] leading-snug text-muted">You confirm each step. Buyers see this checklist on your listing.</p>
              </>
            ) : (
              <p className="mt-2 text-[13.5px] text-muted">Choose a category to see its cleaning steps.</p>
            )}
            {shown.cleaning && (
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-[#B4472F]" role="alert">
                <CircleAlert size={14} aria-hidden="true" /> {shown.cleaning}
              </p>
            )}
          </section>
        </div>

        <PrimaryButton type="submit" className="w-full">
          Publish listing
        </PrimaryButton>
        <p className="-mt-3 text-center text-[12px] text-muted">Prototype: listings are stored only in this browser session.</p>
      </form>
    </div>
  );
}
