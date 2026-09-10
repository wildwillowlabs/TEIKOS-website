import { motion } from 'framer-motion';
import { ArrowRight, Database, Search, Lock, CheckCircle } from 'lucide-react';
import { ScrollReveal, StaggerReveal, StaggerItem } from '@/components/ScrollReveal';
import { numberBadge } from '@/lib/animation';

const steps = [
  {
    number: 1,
    icon: Database,
    title: 'business_facts_get',
    description: 'Agent learns the business (hours, services, timezone)',
    color: 'teikos-yellow',
  },
  {
    number: 2,
    icon: Search,
    title: 'availability_check',
    description: 'Real-time slot computation (never cached)',
    color: 'teikos-blue',
  },
  {
    number: 3,
    icon: Lock,
    title: 'appointment_hold',
    description: 'Atomic 90-second lock on the chosen slot',
    color: 'teikos-coral',
  },
  {
    number: 4,
    icon: CheckCircle,
    title: 'appointment_confirm',
    description: 'Database transaction re-verifies and commits',
    color: 'teikos-yellow',
  },
];

export function APIFlow() {
  return (
    <section id="how-it-works" className="section-padding halftone-bg">
      <div className="container-max mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block bg-white border-[2px] border-dark rounded-full px-4 py-2 text-sm font-body font-semibold mb-4">
            How It Works
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-dark max-w-4xl mx-auto mb-4">
            The 4-Step Booking Pipeline
          </h2>
          <p className="font-body text-lg text-dark/70 max-w-2xl mx-auto">
            TEIKOS is a &apos;first of its kind&apos; application. Our 4 step booking
            pipeline is specifically designed to guardrail agentic scheduling. Traditional
            calendar tools [often duct taped to agent workflows] skip steps 3 and 4
            entirely.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Desktop Connector Line */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-1 bg-dark/10">
            <motion.div
              className="h-full bg-teikos-blue"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              style={{ originX: 0 }}
            />
          </div>

          {/* Steps Grid */}
          <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <StaggerItem key={index}>
                <div className="relative">
                  {/* Number Badge */}
                  <motion.div
                    className={`w-12 h-12 bg-${step.color} border-[3px] border-dark rounded-full flex items-center justify-center mb-6 relative z-10 mx-auto lg:mx-0`}
                    variants={numberBadge}
                  >
                    <span className="font-heading font-bold text-lg text-dark">
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Card */}
                  <div className="teikos-card text-center lg:text-left">
                    <div className={`w-10 h-10 bg-${step.color}/30 border-[2px] border-${step.color === 'teikos-yellow' ? 'teikos-yellow-deep' : step.color === 'teikos-blue' ? 'teikos-blue-deep' : 'teikos-coral-deep'} rounded-lg flex items-center justify-center mb-4 mx-auto lg:mx-0`}>
                      <step.icon className={`w-5 h-5 text-${step.color === 'teikos-yellow' ? 'dark' : step.color === 'teikos-blue' ? 'teikos-blue-deep' : 'teikos-coral-deep'}`} />
                    </div>
                    <h3 className="font-mono font-semibold text-sm text-dark mb-2">
                      {step.title}
                    </h3>
                    <p className="font-body text-sm text-dark/70">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow (mobile only) */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-4 lg:hidden">
                      <ArrowRight className="w-6 h-6 text-dark/30" />
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>

        {/* Key Insight */}
        <ScrollReveal className="mt-16" delay={0.4}>
          <div className="bg-white border-[3px] border-dark rounded-xl p-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teikos-yellow border-[2px] border-dark rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-heading font-bold text-dark">!</span>
              </div>
              <div>
                <h4 className="font-heading font-bold text-lg text-dark mb-2">
                  Why This Matters
                </h4>
                <p className="font-body text-dark/70 leading-relaxed">
                  Traditional scheduling tools only do steps 1 and 2. They check availability
                  and book immediately — with no{' '}
                  <span className="font-bold text-dark/70">Atomic Protection</span>. When two
                  callers request the same slot simultaneously, race conditions cause
                  double-bookings.{' '}
                  <span className="font-bold text-dark/70">TEIKOS&apos;s</span>{' '}
                  <span className="font-bold text-teikos-coral-deep">Hold</span>
                  {' → '}
                  <span className="font-bold text-teikos-blue">Confirm</span>{' '}
                  <span className="font-bold text-dark/70">State Machine</span> eliminates this
                  entirely.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
