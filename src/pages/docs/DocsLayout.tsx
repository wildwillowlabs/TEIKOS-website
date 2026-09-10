import { Link, NavLink, Outlet } from "react-router-dom";
import { Navigation } from "@/sections/Navigation";
import { Footer } from "@/sections/Footer";
import {
  DOC_GROUPS,
  ROLE_BADGE_CLASS,
  docPath,
  findDocBySlug,
  getTierBadgeKey,
  getTierBadgeLabel,
  type DocNavItem,
  type TierBadge,
} from "@/docs/docsNav";
import { cn } from "@/lib/utils";
import { APP_DOCS_URL, APP_SIGNUP_URL } from "@/config/appUrls";

const TIER_KEY: { tier: TierBadge; label: string }[] = [
  { tier: "free", label: "Free" },
  { tier: "pro-plus", label: "Pro+" },
  { tier: "pro", label: "Pro" },
  { tier: "agency", label: "Agency" },
];

function SidebarRoleBadge({ item }: { item: DocNavItem }) {
  const label = getTierBadgeLabel(item);
  const tier = getTierBadgeKey(item);
  if (!label || !tier) return null;
  return (
    <span
      className={cn(
        "ml-auto shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border border-dark/15",
        ROLE_BADGE_CLASS[tier],
      )}
    >
      {label}
    </span>
  );
}

export function DocsLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-[72px]">
        <header className="border-b-[3px] border-dark bg-teikos-yellow/30">
          <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-sm font-body font-medium text-dark/60 mb-2">
              <Link to="/" className="hover:text-dark">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link to="/docs" className="hover:text-dark">
                Documentation
              </Link>
            </p>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-dark mb-3">
              TEIKOS Documentation
            </h1>
            <p className="font-body text-dark/70 max-w-3xl leading-relaxed">
              Role-based onboarding for business owners, Pro voice agent builders, and agencies — plus integration
              playbooks, API reference, and troubleshooting.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to={docPath("onboarding")} className="btn-primary text-sm">
                Start onboarding
              </Link>
              <a href={APP_SIGNUP_URL} className="btn-secondary text-sm">
                Get Started Free
              </a>
              <a
                href={APP_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
              >
                Detailed Docs
              </a>
            </div>
          </div>
        </header>

        <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <nav className="lg:w-72 shrink-0" aria-label="Documentation sections">
              <div className="lg:sticky lg:top-[88px] flex flex-col max-h-[calc(100vh-6rem)]">
                <div className="shrink-0 mb-4 p-3 border-2 border-dark/20 rounded-lg bg-gray-50">
                  <p className="text-xs font-heading font-bold text-dark mb-2">Role key</p>
                  <div className="flex flex-wrap gap-2">
                    {TIER_KEY.map(({ tier, label }) => (
                      <span
                        key={tier}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold border border-dark/15",
                          ROLE_BADGE_CLASS[tier],
                        )}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-dark/50 mt-2 leading-snug">Pro+ = Pro and Agency plans</p>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-5 pr-1">
                  <NavLink
                    to="/docs"
                    end
                    className={({ isActive }) =>
                      cn(
                        "block px-3 py-2 rounded-md border-2 border-dark text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-teikos-coral text-dark shadow-[2px_2px_0_#1A1A1A]"
                          : "bg-white hover:bg-teikos-yellow/40",
                      )
                    }
                  >
                    Doc home
                  </NavLink>

                  {DOC_GROUPS.map((group) => (
                    <div key={group.id}>
                      <p className="text-xs font-heading font-bold uppercase tracking-wider text-dark/45 px-1 mb-1.5">
                        {group.label}
                      </p>
                      <div className="space-y-1">
                        {group.slugs.map((slug) => {
                          const item = findDocBySlug(slug);
                          if (!item) return null;
                          const to = docPath(slug);
                          const isNested = slug.includes("/");
                          return (
                            <NavLink
                              key={slug}
                              to={to}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-1 py-2 rounded-md border-2 border-dark text-sm font-semibold transition-colors",
                                  isNested ? "ml-3 px-2.5 text-xs" : "px-3",
                                  isActive
                                    ? "bg-teikos-coral text-dark shadow-[2px_2px_0_#1A1A1A]"
                                    : "bg-white hover:bg-teikos-yellow/40",
                                )
                              }
                            >
                              <span className="truncate">{item.label}</span>
                              <SidebarRoleBadge item={item} />
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
