import { motion } from 'framer-motion';
import { Play, ExternalLink, Database, Search, Lock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { APP_SIGNUP_URL } from '@/config/appUrls';

const demoSteps = [
  { icon: Database, label: 'business_facts_get', status: 'complete' },
  { icon: Search, label: 'availability_check', status: 'complete' },
  { icon: Lock, label: 'appointment_hold', status: 'active' },
  { icon: CheckCircle, label: 'appointment_confirm', status: 'pending' },
];

/** Demo slots shown in availability_check — agent_readable must match these times */
const DEMO_SLOTS = ['2024-01-15T14:00:00Z', '2024-01-15T14:15:00Z'] as const;
const DEMO_HOLD_SLOT = '2024-01-15T14:00:00Z';

function getDemoResponseJson(activeStep: number): string {
  const envelope = <T extends Record<string, unknown>>(tool: string, body: T) =>
    JSON.stringify({ success: true, tool, ...body }, null, 2);

  switch (activeStep) {
    case 0:
      return envelope('business_facts_get', {
        data: {
          business_name: 'TEIKOS',
          business_hours: 'Mon–Fri 7am–5pm',
          location: '123 Teikos Street, Huntsville, Alabama 12345',
          parking: 'Parking garage across the street',
          services: ['Inspection', 'Consultation', 'Management'],
          warranty: '1 year guarantee',
          experience: '10 years',
          timezone: 'America/Chicago',
          contact_phone: '+1 (256) 555-0142',
          website: 'https://teikos.io',
          languages: ['English', 'Spanish'],
          after_hours_policy: 'Voicemail monitored until 8pm on weekdays',
        },
      });
    case 1:
      return envelope('availability_check', {
        available_slots: [...DEMO_SLOTS],
        agent_readable:
          'I have openings on Wednesday, January 15, 2024 at 2:00 PM and 2:15 PM. Which works best for you?',
      });
    case 2:
      return envelope('appointment_hold', {
        status: 'held',
        slot: DEMO_HOLD_SLOT,
        hold_expires: '2024-01-15T14:01:30Z',
      });
    case 3:
      return envelope('appointment_confirm', {
        status: 'confirmed',
        appointment: {
          date: '2024-01-15',
          start_time: DEMO_HOLD_SLOT,
          timezone: 'America/Chicago',
          confirmed: true,
          confirmation_id: 'cnf_8k2m9p1q',
        },
        agent_readable:
          'Your appointment is confirmed for Wednesday, January 15, 2024 at 2:00 PM.',
      });
    default:
      return JSON.stringify({ success: false, error: 'unknown_step' }, null, 2);
  }
}

/** Reserve vertical space for the tallest payload (step 0) so the Agent Lab panel does not jump when steps rotate */
const longestDemoText = getDemoResponseJson(0);
/** Approx wrapped visual lines inside the ~610px Agent Lab card (mono text-xs) */
const approxWrappedLines = longestDemoText
  .split('\n')
  .reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / 54)), 0);
const demoResponsePreMinHeightRem = Math.max(
  30,
  Math.ceil(approxWrappedLines * 1.125) + 4,
);

export function Demo() {
  const [activeStep, setActiveStep] = useState(2);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="section-padding bg-white">
      <div className="container-max mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <ScrollReveal direction="left">
            <span className="inline-block bg-teikos-yellow border-[2px] border-dark rounded-full px-4 py-2 text-sm font-body font-semibold mb-4">
              Demo
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-dark mb-4">
              See It In{' '}
              <span className="text-teikos-blue">Action</span>
            </h2>
            <p className="font-body text-lg text-dark/70 mb-6 leading-relaxed">
              Watch the Hold → Confirm state machine execute in real-time. 
              Agent Lab lets you simulate the full booking pipeline without 
              real side effects.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Select an integration (Vapi, Retell, n8n)',
                'Run availability_check → appointment_hold → appointment_confirm',
                'Watch the state machine execute step by step',
                'See real JSON responses formatted as a logic tree',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teikos-blue/20 border border-teikos-blue rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-teikos-blue" />
                  </div>
                  <span className="font-body text-dark/70">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a
                href={APP_SIGNUP_URL}
                className="btn-primary inline-flex items-center justify-center gap-2 text-center"
                whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 #1A1A1A' }}
                whileTap={{ x: 2, y: 2, boxShadow: '2px 2px 0 #1A1A1A' }}
              >
                <ExternalLink className="w-4 h-4" />
                Try Agent Lab
              </motion.a>
            </div>
          </ScrollReveal>

          {/* Right Content - Demo Widget */}
          <ScrollReveal direction="right" delay={0.2} className="w-full">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border-[3px] border-dark bg-dark">
              {/* Widget Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-dark px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="font-mono text-xs text-white/50">Agent Lab</span>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label={isPlaying ? 'Pause demo animation' : 'Play demo animation'}
                >
                  <Play className={`w-4 h-4 ${isPlaying ? 'opacity-50' : ''}`} aria-hidden />
                </button>
              </div>

              {/* Demo Content — flex + min height reserves space for largest JSON so the row does not jump */}
              <div className="flex flex-col p-6">
                <div className="shrink-0 bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                  <p className="font-mono text-xs text-white/50 mb-2">Integration</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
                      <span className="font-heading font-bold text-white text-xs">V</span>
                    </div>
                    <span className="font-body text-sm text-white">Vapi Voice Agent</span>
                  </div>
                </div>

                {/* Steps */}
                <div className="shrink-0 space-y-3">
                  {demoSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        index === activeStep
                          ? 'bg-teikos-blue/20 border-teikos-blue'
                          : index < activeStep
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                      animate={{
                        scale: index === activeStep ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center ${
                          index === activeStep
                            ? 'bg-teikos-blue'
                            : index < activeStep
                            ? 'bg-green-500'
                            : 'bg-white/10'
                        }`}
                      >
                        <step.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-xs text-white">{step.label}</p>
                      </div>
                      {index < activeStep && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {index === activeStep && (
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Response Preview — min height keyed off business_facts_get (longest) so shorter steps don’t collapse layout */}
                <div className="mt-4 flex flex-col rounded-lg border border-white/10 bg-black/50 p-3">
                  <p className="shrink-0 font-mono text-xs text-white/50 mb-2">Response</p>
                  <pre
                    className="font-mono text-xs text-green-400 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words"
                    style={{ minHeight: `${demoResponsePreMinHeightRem}rem` }}
                  >
                    {getDemoResponseJson(activeStep)}
                  </pre>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
