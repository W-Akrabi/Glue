import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function VisibilitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

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

      // Stats counter animation
      const stats = visualRef.current?.querySelectorAll('.stat-number');
      if (stats) {
        stats.forEach((stat) => {
          const target = parseInt(stat.getAttribute('data-target') || '0');
          gsap.fromTo(
            stat,
            { innerText: 0 },
            {
              innerText: target,
              duration: 1.5,
              ease: 'power2.out',
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: section,
                start: 'top 60%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const records = [
    { name: 'Q4 Budget Request', date: 'Oct 24', status: 'approved', amount: '$12,500' },
    { name: 'Vendor Contract', date: 'Oct 23', status: 'pending', amount: '$8,200' },
    { name: 'Team Expansion', date: 'Oct 22', status: 'approved', amount: '$45,000' },
    { name: 'Software License', date: 'Oct 21', status: 'rejected', amount: '$3,400' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
      style={{ zIndex: 105 }}
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content - Left */}
          <div ref={contentRef} className="lg:w-1/2">
            <div className="eyebrow mb-4">VISIBILITY</div>
            <h2 className="headline-display text-glue-text mb-6">
              See the full picture.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              Live status, audit trails, and decision history—all in one place.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              View dashboards
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Visual - Right */}
          <div ref={visualRef} className="lg:w-1/2">
            <div className="glue-card p-6">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-glue-bg rounded-2xl p-4 text-center">
                  <div className="stat-number text-2xl font-bold text-glue-accent" data-target="24">
                    0
                  </div>
                  <div className="text-xs text-glue-text-secondary mt-1">Pending</div>
                </div>
                <div className="bg-glue-bg rounded-2xl p-4 text-center">
                  <div className="stat-number text-2xl font-bold text-emerald-500" data-target="156">
                    0
                  </div>
                  <div className="text-xs text-glue-text-secondary mt-1">Approved</div>
                </div>
                <div className="bg-glue-bg rounded-2xl p-4 text-center">
                  <div className="stat-number text-2xl font-bold text-glue-text" data-target="12">
                    0
                  </div>
                  <div className="text-xs text-glue-text-secondary mt-1">This week</div>
                </div>
              </div>

              {/* Records list */}
              <div className="space-y-3">
                {records.map((record, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl bg-glue-bg hover:bg-white transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      record.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                      record.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {record.status === 'approved' ? <CheckCircle size={16} /> :
                       record.status === 'pending' ? <Clock size={16} /> :
                       <XCircle size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-glue-text text-sm">{record.name}</div>
                      <div className="text-xs text-glue-text-secondary">{record.date}</div>
                    </div>
                    <div className="font-semibold text-glue-text">{record.amount}</div>
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
