import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Plus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function AssignmentSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Content fades in from left
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

      // Visual fades in from right with stagger for avatars
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

      // Stagger avatar animations
      const avatars = visualRef.current?.querySelectorAll('.avatar-item');
      if (avatars) {
        gsap.fromTo(
          avatars,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const avatars = [
    { initials: 'JD', color: 'bg-emerald-500' },
    { initials: 'AM', color: 'bg-blue-500' },
    { initials: 'SK', color: 'bg-purple-500' },
    { initials: 'RL', color: 'bg-orange-500' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
      style={{ zIndex: 103 }}
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content - Left */}
          <div ref={contentRef} className="lg:w-1/2">
            <div className="eyebrow mb-4">ASSIGNMENT RULES</div>
            <h2 className="headline-display text-glue-text mb-6">
              Assign with confidence.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              Add multiple assignees per step, set backups, and define role gates so nothing gets stuck.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              Explore assignment options
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Visual - Right */}
          <div ref={visualRef} className="lg:w-1/2">
            <div className="glue-card p-8 lg:p-12">
              <div className="flex items-center gap-4 flex-wrap">
                {avatars.map((avatar, i) => (
                  <div
                    key={i}
                    className={`avatar-item w-14 h-14 rounded-full ${avatar.color} flex items-center justify-center text-white font-semibold shadow-lg`}
                  >
                    {avatar.initials}
                  </div>
                ))}
                <div className="avatar-item w-14 h-14 rounded-full bg-glue-accent flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
              </div>
              
              {/* Connector lines */}
              <div className="mt-8 flex items-center gap-2">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-glue-accent" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-glue-accent" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full" />
              </div>

              {/* Role tags */}
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-glue-bg rounded-full text-sm font-medium text-glue-text">
                  Manager approval
                </span>
                <span className="px-4 py-2 bg-glue-bg rounded-full text-sm font-medium text-glue-text">
                  Finance review
                </span>
                <span className="px-4 py-2 bg-glue-accent/10 rounded-full text-sm font-medium text-glue-accent">
                  + Add role
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
