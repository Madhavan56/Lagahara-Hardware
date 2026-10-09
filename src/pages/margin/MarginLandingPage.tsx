import '@fontsource/funnel-display/500.css'
import '@fontsource/funnel-display/700.css'
import '@fontsource/funnel-display/800.css'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './margin.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/motion/reveal'
import { WeekPreview } from './WeekPreview'

const EASE = [0.16, 1, 0.3, 1] as const

const WRAP = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10'
const SECTION = 'scroll-mt-20 pt-20 lg:pt-28'
const H2 = 'text-[clamp(2rem,4vw,3.125rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance'

const BTN =
  'inline-flex h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-(--m-ctl) px-6 text-[15px] font-semibold leading-none transition-[transform,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px active:translate-y-px active:scale-[0.98]'
const BTN_PRIMARY = `${BTN} group bg-(--m-ink) text-(--m-paper)`
const BTN_GHOST = `${BTN} border border-(--m-line) text-(--m-ink) hover:border-(--m-ink)`

const NAV_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export default function MarginLandingPage() {
  useDocumentHead({
    title: 'Margin | Get your focus time back',
    description: 'Margin groups your meetings together, so you get long blocks of focus time back.',
  })

  return (
    <div className="margin-root" id="top">
      <Nav />
      <main>
        <Hero />
        <LogoWall />
        <HowItWorks />
        <Features />
        <Testimonial />
        <Pricing />
        <Faq />
        <SignupCta />
      </main>
      <Footer />
    </div>
  )
}

/* ------------------------------------------------------------------ Nav */

function Nav() {
  const { scrollY } = useScroll()
  const hairline = useTransform(scrollY, [0, 24], [0, 1])

  return (
    <header className="sticky top-0 z-10 bg-(--m-paper)/85 backdrop-blur-md">
      <div className={cn(WRAP, 'flex h-[68px] items-center justify-between gap-8')}>
        <a href="#top" aria-label="Margin home" className="flex items-center gap-2.5 font-(family-name:--m-display) text-[21px] font-extrabold tracking-[-0.02em]">
          <span aria-hidden="true" className="relative size-[22px] overflow-hidden rounded-[5px] border-2 border-(--m-ink)">
            <span className="absolute inset-x-0 bottom-0 h-[45%] bg-(--m-mark)" />
          </span>
          Margin
        </a>
        <nav aria-label="Primary" className="mr-auto hidden gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-[15px] text-(--m-muted) transition-colors hover:text-(--m-ink)">
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#start" className={cn(BTN_PRIMARY, 'h-[38px] px-4 text-sm')}>
          Start free
        </a>
      </div>
      <m.div style={{ opacity: hairline }} className="absolute inset-x-0 bottom-0 h-px bg-(--m-line)" />
    </header>
  )
}

/* ----------------------------------------------------------------- Hero */

function Hero() {
  const reduce = useReducedMotion()
  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  }

  return (
    <section className="py-14 lg:py-[72px]">
      <div className={cn(WRAP, 'grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-[72px]')}>
        <m.div initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }}>
          <m.h1 variants={item} className="text-[clamp(2.625rem,5.4vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-balance">
            Find the <span className="m-mark">margin</span> in your week.
          </m.h1>
          <m.p variants={item} className="mt-6 max-w-[34ch] text-[19px] leading-relaxed text-(--m-muted)">
            Margin groups your meetings together, so you get long blocks of focus time back.
          </m.p>
          <m.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <a href="#start" className={BTN_PRIMARY}>
              Start free
              <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <a href="#how" className={BTN_GHOST}>
              See how it works
            </a>
          </m.div>
        </m.div>

        <m.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="min-w-0"
        >
          <WeekPreview />
        </m.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ Logo wall */

const LOGOS: { name: string; mark: ReactNode }[] = [
  {
    name: 'Northwind',
    mark: (
      <>
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <circle cx="12" cy="12" r="4" fill="var(--m-paper)" />
      </>
    ),
  },
  {
    name: 'Halcyon',
    mark: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" />
        <rect x="7" y="7" width="10" height="10" fill="var(--m-paper)" />
      </>
    ),
  },
  { name: 'Paperplane', mark: <path d="M2 21 12 3l10 18z" fill="currentColor" /> },
  {
    name: 'Ostrava',
    mark: (
      <>
        <rect x="3" y="3" width="7" height="18" rx="2" fill="currentColor" />
        <rect x="14" y="9" width="7" height="12" rx="2" fill="currentColor" />
      </>
    ),
  },
  {
    name: 'Kettlewell',
    mark: (
      <>
        <path d="M2 14a10 10 0 0 1 20 0z" fill="currentColor" />
        <rect x="2" y="17" width="20" height="4" rx="2" fill="currentColor" />
      </>
    ),
  },
]

function LogoWall() {
  return (
    <section className="border-y border-(--m-line) py-8">
      <div className={cn(WRAP, 'flex flex-wrap items-center gap-x-12 gap-y-6')}>
        <h2 className="font-(family-name:--m-body) text-sm font-medium text-(--m-muted)">Used by teams at</h2>
        <ul className="flex flex-1 flex-wrap items-center gap-x-[clamp(24px,4vw,52px)] gap-y-5 lg:justify-between">
          {LOGOS.map((logo) => (
            <li key={logo.name} className="flex items-center gap-2 font-(family-name:--m-display) text-lg font-bold tracking-[-0.01em] text-(--m-muted) transition-colors hover:text-(--m-ink)">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[22px] shrink-0">
                {logo.mark}
              </svg>
              {logo.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- How it works */

const STEPS = [
  {
    verb: 'Connect',
    body: 'Margin reads your meetings, who is invited, and which ones repeat every week.',
    outcome: 'Finds the short, unusable gaps',
  },
  {
    verb: 'Review',
    body: 'It suggests new times for internal meetings. Calls with customers and anything you pin stay where they are.',
    outcome: 'Shows each move before it happens',
  },
  {
    verb: 'Approve',
    body: 'Accept all of it, some of it, or none. Attendees get a normal calendar update.',
    outcome: 'Focus time lands on your calendar',
  },
]

function SectionHead({ title, body }: { title: string; body: string }) {
  return (
    <Reveal className="mb-12 max-w-[65ch]">
      <h2 className={H2}>{title}</h2>
      <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-(--m-muted)">{body}</p>
    </Reveal>
  )
}

function HowItWorks() {
  return (
    <section id="how" className={SECTION}>
      <div className={WRAP}>
        <SectionHead
          title="Three minutes on Sunday. A calmer week."
          body="Margin plans your week in three steps. Nothing on your calendar changes until you approve it."
        />
        <Reveal>
          <ol className="border-t border-(--m-ink)">
            {STEPS.map((step) => (
              <li
                key={step.verb}
                className="group grid gap-3 border-b border-(--m-line) py-8 last:border-b-0 md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)] md:items-baseline md:gap-8"
              >
                <h3 className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-bold tracking-[-0.02em] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                  {step.verb}
                </h3>
                <p className="max-w-[44ch] leading-relaxed text-(--m-muted)">{step.body}</p>
                <p className="text-sm font-medium md:text-right">{step.outcome}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- Features */

const TILE =
  'flex min-w-0 flex-col gap-3 rounded-(--m-box) border p-8 transition-[transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px]'

type Triage = 'Today' | 'This week' | 'Archive'
const TRIAGE_ORDER: Triage[] = ['Today', 'This week', 'Archive']
const TRIAGE_STYLE: Record<Triage, string> = {
  Today: 'bg-(--m-ink) text-(--m-paper)',
  'This week': 'bg-(--m-busy) text-(--m-busy-ink)',
  Archive: 'text-(--m-muted) shadow-[inset_0_0_0_1px_var(--m-line)]',
}

const RULES = [
  { id: 'rule-external', label: 'Never move external meetings', on: true },
  { id: 'rule-lunch', label: 'Keep 12 to 1 pm free for lunch', on: true },
  { id: 'rule-early', label: 'No meetings before 9:30 am', on: false },
  { id: 'rule-friday', label: 'Protect Friday afternoons', on: true },
]

function Features() {
  const [mail, setMail] = useState<{ subject: string; label: Triage }[]>([
    { subject: 'Contract redlines from Northwind legal', label: 'Today' },
    { subject: 'Q4 offsite: pick a venue by Friday', label: 'This week' },
    { subject: 'Your September invoice is ready', label: 'Archive' },
  ])

  function cycle(index: number) {
    setMail((rows) =>
      rows.map((row, i) =>
        i === index ? { ...row, label: TRIAGE_ORDER[(TRIAGE_ORDER.indexOf(row.label) + 1) % TRIAGE_ORDER.length]! } : row,
      ),
    )
  }

  return (
    <section id="features" className={SECTION}>
      <div className={WRAP}>
        <SectionHead
          title="Built for calendars that fill themselves."
          body="Each feature saves time in a different place. Use one or all of them."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Meeting grouping */}
          <Reveal className="md:col-span-7">
            <article className={cn(TILE, 'h-full border-(--m-mark)/45 bg-(--m-mark-soft)')}>
              <h3 className="text-[23px] font-bold">Meeting grouping</h3>
              <p className="max-w-[44ch] leading-relaxed">
                Gaps of 30 minutes are too short for real work. Margin closes them up so free time adds up to blocks you can use.
              </p>
              <DayStrips />
            </article>
          </Reveal>

          {/* Inbox triage */}
          <Reveal className="md:col-span-5" delay={0.06}>
            <article className={cn(TILE, 'h-full border-(--m-line) bg-(--m-surface)')}>
              <h3 className="text-[23px] font-bold">Inbox triage</h3>
              <p className="max-w-[44ch] leading-relaxed text-(--m-muted)">
                Each morning, new mail is sorted into what needs you today and what can wait.
              </p>
              <div className="mt-auto pt-6">
                <ul className="grid gap-1.5">
                  {mail.map((row, i) => (
                    <li key={row.subject} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-(--m-ctl) border border-(--m-line) px-3 py-2.5 text-sm">
                      <span className="truncate">{row.subject}</span>
                      <button
                        type="button"
                        onClick={() => cycle(i)}
                        aria-label={`${row.subject}: ${row.label}. Change label`}
                        className={cn(
                          'rounded-(--m-ctl) px-2.5 py-1.5 text-xs font-medium leading-none whitespace-nowrap transition-[transform,background-color] duration-200 active:scale-95',
                          TRIAGE_STYLE[row.label],
                        )}
                      >
                        {row.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-(--m-muted)">Tap a label to change it. Margin learns from every correction.</p>
              </div>
            </article>
          </Reveal>

          {/* Daily brief */}
          <Reveal className="md:col-span-5">
            <article className={cn(TILE, 'm-dots h-full border-(--m-line) bg-(--m-surface)')}>
              <h3 className="text-[23px] font-bold">Daily brief</h3>
              <p className="max-w-[44ch] leading-relaxed text-(--m-muted)">One short note at 8:30 with what's on and what to prepare.</p>
              <div className="mt-auto rounded-(--m-ctl) border border-(--m-line) bg-(--m-surface) p-4 text-sm">
                <time className="mb-2 block font-(family-name:--m-mono) text-xs text-(--m-muted)">Tuesday, 8:30 am</time>
                <strong className="font-semibold">3 meetings and 4 hours of focus today.</strong>
                <ul className="mt-2 list-disc pl-[18px] text-(--m-muted)">
                  <li>Read Priya's spec before the 2 pm review</li>
                  <li>Dana moved the roadmap call to Thursday</li>
                </ul>
              </div>
            </article>
          </Reveal>

          {/* Rules */}
          <Reveal className="md:col-span-7" delay={0.06}>
            <article className={cn(TILE, 'h-full border-(--m-line) bg-(--m-surface)')}>
              <h3 className="text-[23px] font-bold">Rules you set once</h3>
              <p className="max-w-[44ch] leading-relaxed text-(--m-muted)">
                Tell Margin what it must never touch. These are the defaults most people keep.
              </p>
              <div className="mt-auto grid gap-x-8 gap-y-1 pt-6 sm:grid-cols-2">
                {RULES.map((rule) => (
                  <label key={rule.id} htmlFor={rule.id} className="flex cursor-pointer items-center justify-between gap-3 py-2.5 text-sm">
                    {rule.label}
                    <span className="relative h-[22px] w-[38px] shrink-0">
                      <input id={rule.id} type="checkbox" defaultChecked={rule.on} className="peer absolute inset-0 m-0 cursor-pointer opacity-0" />
                      <span className="pointer-events-none absolute inset-0 rounded-full bg-(--m-line) transition-colors peer-checked:bg-(--m-ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--m-ink)" />
                      <span className="pointer-events-none absolute left-[3px] top-[3px] size-4 rounded-full bg-(--m-surface) shadow-[0_1px_2px_var(--m-shadow)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-checked:translate-x-4" />
                    </span>
                  </label>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** One sample Tuesday, before and after grouping. Positions are hours after 9:00. */
const STRIPS = [
  { label: 'Before', meetings: [[0.5, 0.5], [2.5, 0.5], [4, 0.5], [6, 1]], free: null, longest: '1h 30m' },
  { label: 'After', meetings: [[0.5, 1.5], [6, 1]], free: [2, 4], longest: '4h 00m' },
] as const

function DayStrips() {
  return (
    <div className="mt-auto grid gap-4 pt-6" aria-label="Longest free block on a sample Tuesday, before and after">
      {STRIPS.map((strip) => (
        <div key={strip.label} className="grid grid-cols-[44px_minmax(0,1fr)_52px] items-center gap-3 font-(family-name:--m-mono) text-xs font-medium sm:grid-cols-[56px_minmax(0,1fr)_64px]">
          <span>{strip.label}</span>
          <div className="relative h-[18px] border-b border-dashed border-(--m-ink)/25">
            {strip.meetings.map(([start, length]) => (
              <i key={start} className="absolute inset-y-0 bottom-[3px] rounded-[3px] bg-(--m-ink)/75" style={{ left: `${(start / 8) * 100}%`, width: `calc(${(length / 8) * 100}% - 2px)` }} />
            ))}
            {strip.free && (
              <m.i
                className="absolute inset-y-0 bottom-[3px] origin-left rounded-[3px] bg-(--m-mark) shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"
                style={{ left: `${(strip.free[0] / 8) * 100}%`, width: `calc(${(strip.free[1] / 8) * 100}% - 2px)` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 1 }}
                transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
              />
            )}
          </div>
          <span className="text-right tabular-nums">{strip.longest}</span>
        </div>
      ))}
      <div aria-hidden="true" className="ml-14 mr-16 flex justify-between font-(family-name:--m-mono) text-[11px] opacity-60 sm:ml-[68px] sm:mr-[76px]">
        <span>9am</span>
        <span>1pm</span>
        <span>5pm</span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- Testimonial */

function Testimonial() {
  return (
    <section className={SECTION}>
      <div className={WRAP}>
        <Reveal>
          <figure className="border-y border-(--m-line) py-12">
            <blockquote className="max-w-[26ch] font-(family-name:--m-display) text-[clamp(1.625rem,3.4vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.02em]">
              “I had four 30-minute gaps a day. Now I get one free afternoon, and I ship things in it.”
            </blockquote>
            <figcaption className="mt-6 text-[15px] text-(--m-muted)">
              <b className="font-semibold text-(--m-ink)">Maya Okafor</b>, Engineering Manager at Paperplane
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- Pricing */

type Plan = {
  name: string
  blurb: string
  monthly: number
  yearly: number
  unit: string
  features: string[]
  cta: { label: string; href: string }
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Personal',
    blurb: 'For trying Margin on your own week.',
    monthly: 0,
    yearly: 0,
    unit: 'forever',
    features: ['1 calendar', 'Weekly suggestions', 'Daily brief'],
    cta: { label: 'Start free', href: '#start' },
  },
  {
    name: 'Pro',
    blurb: 'For a full calendar and a full inbox. First 14 days free.',
    monthly: 14,
    yearly: 12,
    unit: 'per month',
    features: ['Unlimited calendars', 'Inbox and Slack triage', 'Custom rules and pinned events', 'Auto-apply changes you trust'],
    cta: { label: 'Start free', href: '#start' },
    featured: true,
  },
  {
    name: 'Team',
    blurb: 'For teams that want shared focus hours.',
    monthly: 24,
    yearly: 20,
    unit: 'per seat per month',
    features: ['Everything in Pro', 'Team-wide no-meeting blocks', 'Admin controls and SSO'],
    cta: { label: 'Talk to sales', href: '#start' },
  },
]

function Pricing() {
  const [yearly, setYearly] = useState(true)

  return (
    <section id="pricing" className={SECTION}>
      <div className={WRAP}>
        <SectionHead
          title="Pay only for the people who use it."
          body="Free for one calendar. Upgrade for inbox triage or team-wide focus hours."
        />
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-(--m-muted)">
          <div role="group" aria-label="Billing period" className="inline-flex rounded-(--m-ctl) border border-(--m-line) bg-(--m-paper) p-[3px]">
            {[false, true].map((option) => (
              <button
                key={String(option)}
                type="button"
                aria-pressed={yearly === option}
                onClick={() => setYearly(option)}
                className={cn(
                  'rounded-[4px] px-3 py-2 text-[13px] font-semibold leading-none transition-colors',
                  yearly === option ? 'bg-(--m-surface) text-(--m-ink) shadow-[0_1px_3px_var(--m-shadow)]' : 'text-(--m-muted) hover:text-(--m-ink)',
                )}
              >
                {option ? 'Yearly' : 'Monthly'}
              </button>
            ))}
          </div>
          Yearly billing saves 2 months.
        </div>

        <Reveal className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
          {PLANS.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly
            const unit = plan.monthly > 0 && yearly ? `${plan.unit}, billed yearly` : plan.unit
            return (
              <div
                key={plan.name}
                className={cn(
                  'flex min-w-0 flex-col gap-4 rounded-(--m-box) p-8',
                  plan.featured ? 'border-2 border-(--m-ink) bg-(--m-surface) shadow-[0_30px_60px_-40px_var(--m-shadow)]' : 'border border-(--m-line)',
                )}
              >
                <h3 className="flex items-center justify-between gap-3 text-xl font-bold">
                  {plan.name}
                  {plan.featured && (
                    <span className="rounded-(--m-ctl) bg-(--m-mark) px-2 py-1 font-(family-name:--m-body) text-xs font-semibold text-(--m-mark-ink)">
                      Most popular
                    </span>
                  )}
                </h3>
                <p className="text-sm text-(--m-muted)">{plan.blurb}</p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="relative inline-flex overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <m.strong
                        key={price}
                        initial={{ y: -12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 12, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="font-(family-name:--m-display) text-5xl font-extrabold leading-none tracking-[-0.03em] tabular-nums"
                      >
                        ${price}
                      </m.strong>
                    </AnimatePresence>
                  </span>
                  <span className="text-sm text-(--m-muted)">{unit}</span>
                </div>
                <ul className="grid gap-2 text-sm text-(--m-muted)">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className={cn('mt-[0.7em] w-3 shrink-0', plan.featured ? 'h-[3px] bg-(--m-mark)' : 'h-0.5 bg-current opacity-50')}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href={plan.cta.href} className={cn('mt-auto', plan.featured ? BTN_PRIMARY : BTN_GHOST)}>
                  {plan.cta.label}
                </a>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ FAQ */

const FAQS = [
  {
    q: 'Will Margin move meetings without asking me?',
    a: 'No. Every change waits for your approval. On Pro you can turn on auto-apply for specific meetings, such as your own recurring 1:1s.',
  },
  {
    q: 'What happens to the other people in a meeting?',
    a: 'Margin only suggests times when every attendee is free. When you approve a change, they get a normal calendar update with a short note you can edit.',
  },
  {
    q: 'Does Margin read my email?',
    a: 'Only if you turn on inbox triage. Messages are sorted and then discarded. They are not stored or used to train models, and you can disconnect at any time.',
  },
  {
    q: 'Which calendars work with Margin?',
    a: 'Google Calendar and Microsoft Outlook. iCloud is in testing for Pro accounts.',
  },
]

function Faq() {
  return (
    <section id="faq" className={SECTION}>
      <div className={cn(WRAP, 'grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12')}>
        <Reveal>
          <h2 className={H2}>Common questions</h2>
        </Reveal>
        <div>
          {FAQS.map((item, i) => (
            <details key={item.q} open={i === 0} className="group border-b border-(--m-line)">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-lg font-semibold leading-snug [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="relative size-3.5 shrink-0">
                  <span className="absolute inset-x-0 top-1.5 h-0.5 bg-(--m-ink)" />
                  <span className="absolute inset-x-0 top-1.5 h-0.5 rotate-90 bg-(--m-ink) transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-0" />
                </span>
              </summary>
              <p className="max-w-[62ch] pb-6 leading-relaxed text-(--m-muted)">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ Signup CTA */

const signupSchema = z.object({
  email: z.email('Enter a work email, like you@company.com.'),
})
type SignupValues = z.infer<typeof signupSchema>

function SignupCta() {
  const [done, setDone] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) })

  // No signup backend exists for Margin yet; wire the real request in here.
  async function onSubmit() {
    setDone(true)
  }

  const message = errors.email?.message ?? (done ? "Thanks. Signup isn't connected yet, so nothing was sent." : 'Free for one calendar. No card needed.')

  return (
    <section id="start" className={cn(WRAP, 'scroll-mt-20 pt-20 lg:pt-28')}>
      <Reveal>
        <div className="grid items-end gap-8 rounded-(--m-box) bg-(--m-mark) p-[clamp(32px,6vw,72px)] text-(--m-mark-ink) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <h2 className="text-[clamp(2.125rem,4.6vw,3.625rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-balance">
              Get a free afternoon back this week.
            </h2>
            <p className="mt-4 max-w-[40ch] text-[17px]">Connect a calendar and see a better version of next week in about three minutes.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-2">
            <label htmlFor="signup-email" className="text-sm font-semibold">
              Work email
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby="signup-email-msg"
                {...register('email')}
                className="h-[46px] min-w-0 flex-[1_1_220px] rounded-(--m-ctl) border-[1.5px] border-(--m-mark-ink) bg-(--m-mark-field) px-4 text-[15px] text-(--m-mark-ink) placeholder:text-(--m-mark-ink)/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--m-mark-ink) aria-invalid:border-[2.5px]"
              />
              <button type="submit" disabled={isSubmitting} className={cn(BTN, 'bg-(--m-mark-ink) text-(--m-mark)')}>
                Start free
              </button>
            </div>
            <p id="signup-email-msg" role="status" aria-live="polite" className={cn('min-h-[1.5em] text-sm', errors.email ? 'font-semibold' : 'opacity-85')}>
              {message}
            </p>
          </form>
        </div>
      </Reveal>
    </section>
  )
}

/* --------------------------------------------------------------- Footer */

function Footer() {
  return (
    <footer className="pb-8 pt-12 text-sm text-(--m-muted)">
      <div className={cn(WRAP, 'flex flex-wrap justify-between gap-6')}>
        <span>© 2026 Margin Labs</span>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          {['Privacy', 'Security', 'Changelog', 'Status'].map((label) => (
            <a key={label} href="#top" className="transition-colors hover:text-(--m-ink)">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
