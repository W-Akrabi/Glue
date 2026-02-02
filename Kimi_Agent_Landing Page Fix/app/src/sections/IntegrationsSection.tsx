import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function IntegrationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
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

      gsap.fromTo(
        visualRef.current,
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

      // Integration cards stagger
      const cards = visualRef.current?.querySelectorAll('.integration-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: 'back.out(1.4)',
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

  const integrations = [
    { name: 'Slack', color: 'bg-purple-500', connected: true },
    { name: 'Salesforce', color: 'bg-blue-500', connected: true },
    { name: 'Zendesk', color: 'bg-black', connected: false },
    { name: 'HubSpot', color: 'bg-orange-500', connected: true },
    { name: 'Stripe', color: 'bg-indigo-500', connected: false },
    { name: 'Notion', color: 'bg-gray-700', connected: true },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
      style={{ zIndex: 106 }}
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          {/* Content - Right */}
          <div ref={contentRef} className="lg:w-1/2">
            <div className="eyebrow mb-4">INTEGRATIONS</div>
            <h2 className="headline-display text-glue-text mb-6">
              Connect your stack.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              Sync with the tools your team already uses—no code required.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              Browse integrations
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Visual - Left */}
          <div ref={visualRef} className="lg:w-1/2">
            <div className="glue-card p-8">
              <div className="grid grid-cols-3 gap-4">
                {integrations.map((integration, i) => (
                  <div
                    key={i}
                    className={`integration-card relative p-6 rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 cursor-pointer ${
                      integration.connected 
                        ? 'bg-glue-accent/10 ring-2 ring-glue-accent' 
                        : 'bg-glue-bg hover:bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center text-white font-bold text-lg`}>
                      {integration.name[0]}
                    </div>
                    <div className="text-sm font-medium text-glue-text">{integration.name}</div>
                    {integration.connected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-glue-accent flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-glue-accent font-medium hover:underline">
                  + 47 more integrations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
