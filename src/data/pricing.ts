/**
 * Landing-page pricing copy — mirrors TEIKOS app / Stripe product definitions.
 */

export type BillingCycle = 'monthly' | 'yearly';

export const AGENCY_INCLUDED_CLIENTS = 5;

/** Flat per-seat pricing for managed clients beyond the Agency plan inclusion (5). */
export const AGENCY_SEAT_PRICE = {
  monthly: {
    priceLine: '$20',
    subPriceLine: 'per seat / month',
  },
  yearly: {
    priceLine: '$200',
    subPriceLine: 'per seat / year',
  },
} as const;

export interface PlanColumn {
  id: 'free' | 'pro' | 'agency';
  name: string;
  description: string;
  /** Shown under plan name for paid tiers when applicable */
  discountBadge?: string;
  monthly: {
    priceLine: string;
    subPriceLine?: string;
    features: string[];
  };
  yearly: {
    priceLine: string;
    subPriceLine?: string;
    features: string[];
  };
  popular?: boolean;
}

export const FREE_PLAN: PlanColumn = {
  id: 'free',
  name: 'TEIKOS — FREE',
  description:
    'Explore core scheduling for your business. Upgrade to Pro when you are ready for voice-agent integrations.',
  monthly: {
    priceLine: '$0',
    subPriceLine: 'forever',
    features: [
      'Free business scheduling with interactive calendar',
      'Manage services, work hours, time off, appointments, clients',
      'Conflict detection and time-off blocking',
      'Client database and booking history',
      'View agent voice logs, transcripts, and prospects. [callers who dont book right away are added to the prospects list]',
      'In-app messaging between accounts',
      'Upgrade anytime to PRO or AGENCY to unlock and manage voice agent integrations',
      'Or LINK to AGENCY and have them managed for you.[Agency fees may apply]',
      'Need an AGENCY? Send [message to dev] on your business dashboard and i will point you in the right direction'
    ],
  },
  yearly: {
    priceLine: '$0',
    subPriceLine: 'forever',
    features: [
      'Same features as FREE monthly',
    ],
  },
};

export const PRO_PLAN: PlanColumn = {
  id: 'pro',
  name: 'TEIKOS — PRO',
  description:
    'PRO — create and manage integrations for your own business. LIMITS: 1 business & 3 ACTIVE integrations.',
  discountBadge: '25% off',
  monthly: {
    priceLine: '$39.99',
    subPriceLine: 'per month',
    features: [
      'Free business scheduling with interactive calendar',
      'Manage services, work hours, time off, appointments, clients',
      'PRO — integrate voice agent into your business scheduling',
      'Auto-provision button — single click creates integration inside TEIKOS',
      'Integrate with: Vapi, Retell, HTTP, n8n, webhooks',
      'Guided docs for each type of integration',
      'View agent voice logs, transcripts, and prospects',
      'In-app messaging between accounts',
      'Agent Lab — simulate agent ↔ database ↔ agent communication',
      'Limited to: (1) business & (3) ACTIVE integrations at a time',
    ],
  },
  yearly: {
    priceLine: '$30',
    subPriceLine: '$360 billed annually',
    features: [
      "Same as TEIKOS — PRO monthly, with 25% off when billed annually (effective $30/mo).",
    ],
  },
};

export const AGENCY_PLAN: PlanColumn = {
  id: 'agency',
  name: 'TEIKOS — AGENCY',
  description:
    'AGENCY — create and manage integrations for yourself and all linked accounts (agency clients). Unlimited integrations — manage up to (5) agency clients (more seats available for purchase).',
  discountBadge: '25% off',
  popular: true,
  monthly: {
    priceLine: '$199',
    subPriceLine: 'per month',
    features: [
      "Includes everything in PRO for your business",
      'Free business scheduling with interactive calendar — for all your clients',
      'Your clients manage services, work hours, time off, appointments, and business clients',
      "Client access to agent voice logs and caller prospects list",
      'Auto-provision client accounts — sends invite link to your agency',
      'Account Switcher — Impersonate [view and manage] any linked client account (optional)',
      'Auto-provision (one-click) integrations inside TEIKOS',
      'Integrate with Vapi, Retell, custom HTTP, n8n, webhooks',
      'Guided docs for each integration type plus custom business facts',
      'Agent Lab — simulate agent ↔ database ↔ agent communication',
      'Agency Hub — client cards with visual integration-health cues',
      'In-app messaging between accounts — and more',
      'Unlimited integrations',
      'Included: (5) managed clients (more available for purchase)',
    ],
  },
  yearly: {
    priceLine: '$150',
    subPriceLine: '$1,800 billed annually',
    features: [
      "Same as TEIKOS — AGENCY monthly, with 25% off when billed annually (effective $150/mo).",
    ],
  },
};
