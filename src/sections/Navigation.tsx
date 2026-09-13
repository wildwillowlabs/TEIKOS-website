import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_LOGIN_URL, APP_SIGNUP_URL } from '@/config/appUrls';
import { dispatchFeaturesTab, scrollToHash } from '@/lib/scrollToSection';

const MotionLink = motion.create(Link);

type NavLink = {
  label: string;
  href: string;
  /** When set, Features section listens and switches tabs before scroll */
  featuresTab?: 'agency' | 'business';
  /** Internal route (react-router) vs homepage anchor */
  isRoute?: boolean;
};

const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs', isRoute: true },
  { label: 'Agency', href: '#features', featuresTab: 'agency' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToSection = (link: NavLink) => {
    setIsOpen(false);
    const hash = link.href.replace(/^#/, '');

    if (isHome) {
      if (link.featuresTab) {
        dispatchFeaturesTab(link.featuresTab);
      }
      scrollToHash(`#${hash}`);
      window.history.replaceState(null, '', `#${hash}`);
      return;
    }

    navigate(
      { pathname: '/', hash },
      { state: link.featuresTab ? { featuresTab: link.featuresTab } : undefined },
    );
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b-[3px] border-dark' 
          : 'bg-transparent'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 relative">
                <img
                  src="/images/logo-cube.png"
                  alt="TEIKOS"
                  width={40}
                  height={40}
                  decoding="async"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-heading font-bold text-xl text-dark">TEIKOS</span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isRoute ? (
                <MotionLink
                  key={link.label}
                  to={link.href}
                  className="relative font-body text-sm font-medium text-dark hover:text-dark/80 transition-colors"
                  whileHover="hover"
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-teikos-blue origin-left"
                    initial={{ scaleX: 0 }}
                    variants={{ hover: { scaleX: 1 } }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </MotionLink>
              ) : (
                <motion.a
                  key={link.label}
                  href={isHome ? link.href : `/${link.href}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goToSection(link);
                  }}
                  className="relative font-body text-sm font-medium text-dark hover:text-dark/80 transition-colors"
                  whileHover="hover"
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-teikos-blue origin-left"
                    initial={{ scaleX: 0 }}
                    variants={{ hover: { scaleX: 1 } }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </motion.a>
              ),
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="font-heading font-semibold text-sm text-dark hover:text-dark/80" asChild>
              <a href={APP_LOGIN_URL}>Sign In</a>
            </Button>
            <motion.a
              href={APP_SIGNUP_URL}
              className="btn-primary inline-block text-sm py-3 px-6 text-center"
              whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 #1A1A1A' }}
              whileTap={{ x: 2, y: 2, boxShadow: '2px 2px 0 #1A1A1A' }}
            >
              Get Started Free
            </motion.a>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button type="button" variant="ghost" size="icon" aria-label="Open main menu">
                <Menu className="w-6 h-6" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white border-l-[3px] border-dark">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) =>
                  link.isRoute ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="font-heading font-semibold text-lg text-dark hover:text-teikos-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={isHome ? link.href : `/${link.href}`}
                      onClick={(e) => {
                        e.preventDefault();
                        goToSection(link);
                      }}
                      className="font-heading font-semibold text-lg text-dark text-left hover:text-teikos-blue transition-colors"
                    >
                      {link.label}
                    </a>
                  ),
                )}
                <hr className="border-dark/20" />
                <Button variant="ghost" className="font-heading font-semibold text-lg text-dark justify-start" asChild>
                  <a href={APP_LOGIN_URL} onClick={() => setIsOpen(false)}>
                    Sign In
                  </a>
                </Button>
                <a
                  href={APP_SIGNUP_URL}
                  onClick={() => setIsOpen(false)}
                  className="btn-primary block text-center"
                >
                  Get Started Free
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </motion.header>
  );
}
