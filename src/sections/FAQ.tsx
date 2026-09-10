import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CONTACT_MAILTO_URL } from '@/config/appUrls';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'What makes TEIKOS different from Cal.com or Calendly?',
    answer: 'Traditional scheduling tools were built for human booking. TEIKOS was built from the ground up for voice AI agents. Our atomic Hold → Confirm state machine ensures zero double-bookings, even with concurrent callers. We don\'t just check availability — we lock slots atomically until confirmation.',
  },
  {
    question: 'How does the 90-second hold window work?',
    answer: 'When a voice agent requests a slot, TEIKOS places an atomic lock on that slot for 90 seconds. If the caller confirms within that window, the booking is committed. If not, the slot is released. No other caller can book that slot during the hold, eliminating race conditions entirely.',
  },
  {
    question: 'Can I use TEIKOS with my existing voice agent platform?',
    answer: 'Yes! TEIKOS has native playbooks for Vapi and Retell, plus universal webhook support. Any system that can make HTTP POST requests can integrate with TEIKOS. This includes Make, Zapier, custom backends, and any future voice platform.',
  },
  {
    question: 'What happens if my voice agent makes a mistake?',
    answer: 'TEIKOS provides complete voice logs for every call, including transcripts and outcome tagging. You can review exactly what was said and take corrective action. Our immutable audit log ensures you always have a complete history.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. TEIKOS uses PostgreSQL with Row Level Security (RLS) — permissions are enforced at the database level and cannot be bypassed. All data is encrypted in transit and at rest. We follow the same security patterns used by Stripe and Twilio.',
  },
  {
    question: 'How do I upgrade from Free to Pro or Agency?',
    answer: 'Simply navigate to your account settings and select your desired plan. Pro & Agency upgrades are instant.',
  },
];

export function FAQ() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block bg-white border-[2px] border-dark rounded-full px-4 py-2 text-sm font-body font-semibold mb-4">
            FAQ
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-dark max-w-3xl mx-auto">
            Frequently Asked{' '}
            <span className="text-teikos-blue">Questions</span>
          </h2>
        </ScrollReveal>

        {/* FAQ Accordion */}
        <ScrollReveal className="max-w-3xl mx-auto">
          <div className="bg-white border-[3px] border-dark rounded-xl overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-dark/10 last:border-b-0"
                >
                  <AccordionTrigger className="px-6 py-5 hover:bg-gray-50 transition-colors font-heading font-semibold text-left text-dark hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5">
                    <p className="font-body text-dark/70 leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>

        {/* Still Have Questions */}
        <ScrollReveal className="mt-12 text-center" delay={0.3}>
          <p className="font-body text-dark/60 mb-4">
            Still have questions?
          </p>
          <motion.a
            href={CONTACT_MAILTO_URL}
            className="inline-flex items-center gap-2 text-teikos-blue font-heading font-semibold hover:underline"
            whileHover={{ x: 5 }}
          >
            Contact our team
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
}
