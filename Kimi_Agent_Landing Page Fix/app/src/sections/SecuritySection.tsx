import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Shield, Check, Lock, FileText, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function SecuritySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [toggles, setToggles] = useState({
    sso: true,
    scim: true,
    audit: true,
    mfa: false,
  });

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 0.5,
          },
        }
      );

      gsap.fromTo(
        visualRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 0.5,
          },
        }
      );

      // Toggle items stagger
      const items = visualRef.current?.querySelectorAll('.toggle-item');
      if (items) {
        gsap.fromTo(
          items,
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.5,
            scrollTrigger: {
              trigger: section,
              start: 'top 55%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const securityFeatures = [
    { key: 'sso', label: 'Single Sign-On (SSO)', icon: Users },
    { key: 'scim', label: 'SCIM Provisioning', icon: Shield },
    { key: 'audit', label: 'Audit Logs', icon: FileText },
    { key: 'mfa', label: 'Multi-Factor Auth', icon: Lock },
  ];

  const auditLogs = [
    { action: 'User login', user: 'john@company.com', time: '2m ago' },
    { action: 'Policy updated', user: 'admin@company.com', time: '1h ago' },
    { action: 'Role assigned', user: 'sarah@company.com', time: '3h ago' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
      style={{ zIndex: 107 }}
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content - Left */}
          <div ref={contentRef} className="lg:w-1/2">
            <div className="eyebrow mb-4">SECURITY</div>
            <h2 className="headline-display text-glue-text mb-6">
              Built to be trusted.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              SSO, SCIM, audit logs, and granular permissions—enterprise-ready from day one.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              Security overview
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Visual - Right */}
          <div ref={visualRef} className="lg:w-1/2">
            <div className="glue-card p-6">
              {/* Toggle switches */}
              <div className="space-y-4 mb-6">
                {securityFeatures.map((feature) => (
                  <div
                    key={feature.key}
                    className="toggle-item flex items-center justify-between p-4 rounded-xl bg-glue-bg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-glue-text">
                        <feature.icon size={20} />
                      </div>
                      <span className="font-medium text-glue-text">{feature.label}</span>
                    </div>
                    <button
                      onClick={() => setToggles(prev => ({ ...prev, [feature.key]: !prev[feature.key as keyof typeof toggles] }))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        toggles[feature.key as keyof typeof toggles] ? 'bg-glue-accent' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles[feature.key as keyof typeof toggles] ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Audit log preview */}
              <div className="border-t border-glue-text/10 pt-4">
                <div className="font-medium text-glue-text mb-3">Recent Activity</div>
                <div className="space-y-2">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-glue-text">{log.action}</span>
                      <span className="text-glue-text-secondary ml-auto">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
