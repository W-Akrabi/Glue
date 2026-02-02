import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Clock, Bell, AlertCircle, CheckCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function SLASection() {
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

      // Timeline items stagger
      const items = visualRef.current?.querySelectorAll('.timeline-item');
      if (items) {
        gsap.fromTo(
          items,
          { y: 20, opacity: 0 },
          {
            y: 0,
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

  const timelineItems = [
    { icon: CheckCircle, label: 'Request submitted', time: 'Now', status: 'done' },
    { icon: Clock, label: 'Manager review', time: '2h', status: 'pending' },
    { icon: Bell, label: 'Auto-reminder', time: '24h', status: 'pending' },
    { icon: AlertCircle, label: 'Escalation', time: '48h', status: 'pending' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
      style={{ zIndex: 104 }}
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          {/* Content - Right */}
          <div ref={contentRef} className="lg:w-1/2">
            <div className="eyebrow mb-4">SLAS & REMINDERS</div>
            <h2 className="headline-display text-glue-text mb-6">
              Stay on time. Every time.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              Set deadlines, automate reminders, and escalate late approvals with one click.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              Learn about SLAs
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Visual - Left */}
          <div ref={visualRef} className="lg:w-1/2">
            <div className="glue-card p-8">
              {/* Mini calendar header */}
              <div className="flex items-center justify-between mb-6">
                <div className="font-semibold text-glue-text">October 2024</div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-glue-bg flex items-center justify-center text-sm">
                      {15 + i}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {timelineItems.map((item, i) => (
                  <div
                    key={i}
                    className={`timeline-item flex items-center gap-4 p-4 rounded-2xl ${
                      item.status === 'done' ? 'bg-glue-accent/10' : 'bg-glue-bg'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'done' ? 'bg-glue-accent text-white' : 'bg-white text-glue-text-secondary'
                    }`}>
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-glue-text">{item.label}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === 'done' 
                        ? 'bg-glue-accent text-white' 
                        : 'bg-white text-glue-text-secondary'
                    }`}>
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
