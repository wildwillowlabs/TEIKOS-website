import { useState } from 'react';
import { Check } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { APP_LOGIN_URL, APP_SIGNUP_URL } from '@/config/appUrls';
import {
  AGENCY_INCLUDED_CLIENTS,
  AGENCY_PLAN,
  AGENCY_SEAT_PRICE,
  FREE_PLAN,
  PRO_PLAN,
  type BillingCycle,
  type PlanColumn,
} from '@/data/pricing';

function paidPlanHref(): string {
  return APP_LOGIN_URL !== '#' ? APP_LOGIN_URL : APP_SIGNUP_URL;
}

const billingToggleSelectedClass =
  'bg-teikos-coral text-dark border-[2px] border-dark shadow-[3px_3px_0_#1A1A1A]';
const billingToggleIdleClass = 'text-dark/60 hover:text-dark bg-transparent';

const pricingCardClass =
  'relative flex h-full flex-col bg-white border-[3px] border-dark rounded-xl p-6 shadow-[6px_6px_0_#1A1A1A]';

/** From md+ (2–4 column layout), match description block height so price + CTAs line up across plans. */
const planDescriptionSlotClass =
  'max-md:block md:flex md:flex-col md:justify-end md:min-h-[7.75rem] lg:min-h-[8.25rem] xl:min-h-[8.75rem]';

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-3 font-body text-sm text-dark/85 leading-snug">
      {items.map((line) => (
        <li key={line} className="flex gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-dark bg-teikos-yellow/50">
            <Check className="h-3 w-3 text-teikos-coral-deep" strokeWidth={3} />
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function PlanCard({
  plan,
  cycle,
  className = '',
}: {
  plan: PlanColumn;
  cycle: BillingCycle;
  className?: string;
}) {
  const pack = cycle === 'monthly' ? plan.monthly : plan.yearly;
  const showYearlyDeal = plan.id !== 'free' && cycle === 'yearly' && plan.discountBadge;

  return (
    <div
      className={`${pricingCardClass} ${plan.popular ? 'bg-teikos-yellow-deep/35 ring-2 ring-dark/10' : ''} ${className}`}
    >
      {plan.popular ? (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border-[2px] border-dark bg-teikos-coral px-3 py-1 font-body text-xs font-bold text-white shadow-[3px_3px_0_#1A1A1A]">
          Most popular
        </span>
      ) : null}

      <div className="mb-4 flex items-start gap-3">
        <img src="/images/logo-cube.png" alt="" className="h-12 w-12 shrink-0 object-contain" width={48} height={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-lg font-bold leading-tight text-dark sm:text-xl">{plan.name}</h3>
            {showYearlyDeal ? (
              <span className="rounded-full border-[2px] border-dark bg-white px-2 py-0.5 font-body text-xs font-semibold text-dark">
                {plan.discountBadge}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className={planDescriptionSlotClass}>
        <p className="font-body text-sm leading-relaxed text-dark/75">{plan.description}</p>
      </div>

      <div className="mt-6 border-t-2 border-dashed border-dark/20 pt-6">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-heading text-4xl font-bold tracking-tight text-dark">{pack.priceLine}</span>
          {pack.subPriceLine ? (
            <span className="font-body text-sm font-medium text-dark/65">{pack.subPriceLine}</span>
          ) : null}
        </div>
      </div>

      {plan.id === 'free' ? (
        <a href={APP_SIGNUP_URL} className="btn-coral mt-6 block w-full text-center">
          Get started free
        </a>
      ) : (
        <a href={paidPlanHref()} className="btn-coral mt-6 block w-full text-center">
          Continue in TEIKOS
        </a>
      )}

      <p className="mt-3 text-center font-body text-xs text-dark/55">
        Subscriptions and upgrades are completed in the app after you sign in.
      </p>

      <FeatureList items={pack.features} />
    </div>
  );
}

function AgencySeatsColumn({
  cycle,
  className = '',
}: {
  cycle: BillingCycle;
  className?: string;
}) {
  const pack = AGENCY_SEAT_PRICE[cycle];

  return (
    <div className={`${pricingCardClass} ${className} bg-white`}>
      <span className="mb-3 inline-block w-fit rounded-full border-[2px] border-teikos-coral bg-teikos-coral/15 px-3 py-1 font-body text-xs font-semibold text-teikos-coral-deep">
        Active Agency subscribers only
      </span>

      <div className="mb-2 flex items-start gap-3">
        <img src="/images/logo-cube.png" alt="" className="h-12 w-12 shrink-0 object-contain" width={48} height={48} />
        <div>
          <h3 className="font-heading text-lg font-bold text-dark sm:text-xl">Add client seats</h3>
        </div>
      </div>

      <div className={planDescriptionSlotClass}>
        <p className="font-body text-sm leading-relaxed text-dark/75">
          Flat per-seat pricing for managed clients beyond the ({AGENCY_INCLUDED_CLIENTS}) included with Agency.
          Same rate for every additional seat — no volume tiers.
        </p>
      </div>

      <div className="mt-6 border-t-2 border-dashed border-dark/20 pt-6">
        {cycle === 'yearly' ? (
          <div className="mb-3 flex justify-center">
            <span className="inline-block w-fit rounded-full border-[2px] border-teikos-coral bg-teikos-coral/15 px-3 py-1 font-body text-xs font-semibold text-teikos-coral-deep">
              2 months free
            </span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-heading text-4xl font-bold tracking-tight text-dark">{pack.priceLine}</span>
          <span className="font-body text-sm font-medium text-dark/65">{pack.subPriceLine}</span>
        </div>
        <p className="mt-2 font-body text-xs text-dark/55">
          {cycle === 'monthly'
            ? 'Or $200 per seat / year when billed annually.'
            : 'Or $20 per seat / month when billed monthly.'}
        </p>
      </div>

      <a href={paidPlanHref()} className="btn-coral mt-6 block w-full text-center">
        Manage seats in TEIKOS
      </a>

      <p className="mt-3 text-center font-body text-xs text-dark/55">
        Eligibility and exact totals are confirmed in TEIKOS billing. Seat add-ons are billed in USD.
      </p>
    </div>
  );
}

export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <section id="pricing" className="section-padding halftone-bg">
      <div className="container-max mx-auto">
        <ScrollReveal className="text-center mb-10">
          <span className="inline-block bg-white border-[2px] border-dark rounded-full px-4 py-2 text-sm font-body font-semibold mb-4">
            Pricing
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-dark max-w-3xl mx-auto mb-4">
            Simple, <span className="text-teikos-blue-deep">Transparent</span> Pricing
          </h2>
          <p className="font-body text-lg text-dark/70 max-w-2xl mx-auto">
            Compare plans here, then sign in to TEIKOS to subscribe, change billing, or add Agency seats.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mb-10 flex justify-center">
          <div
            className="inline-flex items-center gap-1 rounded-full border-[2px] border-dark bg-white p-1.5 shadow-[4px_4px_0_#1A1A1A]"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              className={`rounded-full px-5 py-2.5 font-body text-sm font-semibold transition-all sm:px-7 ${
                cycle === 'monthly' ? billingToggleSelectedClass : billingToggleIdleClass
              }`}
              onClick={() => setCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`rounded-full px-5 py-2.5 font-body text-sm font-semibold transition-all sm:px-7 ${
                cycle === 'yearly' ? billingToggleSelectedClass : billingToggleIdleClass
              }`}
              onClick={() => setCycle('yearly')}
            >
              Yearly
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <PlanCard plan={FREE_PLAN} cycle={cycle} className="order-1" />
            <PlanCard plan={PRO_PLAN} cycle={cycle} className="order-2" />
            <PlanCard plan={AGENCY_PLAN} cycle={cycle} className="order-3" />
            <AgencySeatsColumn cycle={cycle} className="order-4" />
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-12 text-center" delay={0.2}>
          <div className="font-body text-sm text-dark/70 max-w-md mx-auto space-y-1 leading-relaxed">
            <p>Need more than the listed plans?</p>
            <p>
              <a
                href="mailto:hello@teikos.io?subject=TEIKOS%20pricing%20question"
                className="text-teikos-blue-deep font-semibold hover:underline"
              >
                Send us a message
              </a>
              , we believe in creative solutions!
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
