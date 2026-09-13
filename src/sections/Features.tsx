import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Phone, 
  AlertCircle, 
  Clock, 
  Users, 
  Plug,
  LayoutDashboard,
  Zap,
  BarChart3,
  UserPlus,
  MessageSquare,
  ScrollText
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

const businessOwnerFeatures = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Calendar, services, clients, and work hours — all in one place.',
  },
  {
    icon: Phone,
    title: 'Voice Call Logs',
    description: 'See exactly what your voice agent said on every call.',
  },
  {
    icon: AlertCircle,
    title: 'Conflict Detection',
    description: 'Instant alerts when scheduling conflicts arise.',
  },
  {
    icon: Clock,
    title: 'Time Off Management',
    description: 'Block vacation days, holidays, and breaks.',
  },
  {
    icon: Users,
    title: 'Client Database',
    description: 'Manage your customer information and booking history.',
  },
  {
    icon: Plug,
    title: 'Basic Integrations',
    description: 'Connect to your existing tools.',
  },
];

const agencyFeatures = [
  {
    icon: LayoutDashboard,
    title: 'Multi-Client Dashboard',
    description:
      "Manage all client accounts from one interface. 'Account switch' allows you to impersonate only your linked clients' accounts.",
  },
  {
    icon: Zap,
    title: 'One-Click Autoprovision',
    description: 'Set up Vapi, Retell, n8n integrations for clients in seconds.',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Track tool calls, confirmed appointments, and performance per client.',
  },
  {
    icon: UserPlus,
    title: 'Autoprovision Client Account & Agency Invite',
    description:
      'One click—create new client account, set basic info, and send email invite to join your services.',
  },
  {
    icon: ScrollText,
    title: 'Voice Log Viewer',
    description: 'Review call transcripts and outcomes with outcome tagging.',
  },
  {
    icon: MessageSquare,
    title: 'Agency Messaging',
    description: 'Direct communication channel with your clients.',
  },
];

const selectedToggleClass =
  'bg-teikos-coral text-dark border-[2px] border-dark shadow-[3px_3px_0_#1A1A1A]';
const idleToggleClass = 'text-dark/60 hover:text-dark bg-transparent';

export function Features() {
  const [activeTab, setActiveTab] = useState<'business' | 'agency'>('business');

  useEffect(() => {
    const onFeaturesNav = (e: Event) => {
      const detail = (e as CustomEvent<'business' | 'agency'>).detail;
      if (detail === 'agency' || detail === 'business') {
        setActiveTab(detail);
      }
    };
    window.addEventListener('teikos:features-tab', onFeaturesNav);
    return () => window.removeEventListener('teikos:features-tab', onFeaturesNav);
  }, []);

  const features = activeTab === 'business' ? businessOwnerFeatures : agencyFeatures;

  return (
    <section id="features" className="section-padding bg-white">
      <div className="container-max mx-auto">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block bg-teikos-blue/20 border-[2px] border-teikos-blue rounded-full px-4 py-2 text-sm font-body font-semibold text-teikos-blue-deep mb-4">
            Features
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-dark max-w-3xl mx-auto mb-4">
            Built for{' '}
            <span className="text-teikos-blue">Both</span> Audiences
          </h2>
          <p className="font-body text-lg text-dark/70 max-w-2xl mx-auto">
            Whether you&apos;re a business owner or a voice agent agency, 
            TEIKOS has the tools you need.
          </p>
        </ScrollReveal>

        {/* Tabs */}
        <ScrollReveal className="flex justify-center mb-12">
          <div className="bg-gray-100 border-[3px] border-dark rounded-xl p-1.5 inline-flex">
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`px-6 py-3 rounded-lg font-heading font-semibold text-sm transition-all duration-300 ${
                activeTab === 'business' ? selectedToggleClass : idleToggleClass
              }`}
            >
              For Business Owners
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('agency')}
              className={`px-6 py-3 rounded-lg font-heading font-semibold text-sm transition-all duration-300 ${
                activeTab === 'agency' ? selectedToggleClass : idleToggleClass
              }`}
            >
              For Agencies
            </button>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <div className="teikos-card h-full group">
                  <motion.div 
                    className="w-12 h-12 bg-teikos-yellow border-[2px] border-dark rounded-lg flex items-center justify-center mb-4 group-hover:bg-teikos-blue transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <feature.icon className="w-6 h-6 text-dark" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-lg text-dark mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-body text-dark/70 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Tab Indicator */}
        <ScrollReveal className="mt-12 text-center" delay={0.3}>
          <p className="font-body text-base font-semibold">
            {activeTab === 'business' ? (
              <>
                <span className="text-dark">Free for individual business owners.</span>{' '}
                <span className="text-teikos-coral">Upgrade to Pro for integrations.</span>
              </>
            ) : (
              <span className="text-teikos-coral">
                Agency tier includes all Pro features plus multi-client management.
              </span>
            )}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
