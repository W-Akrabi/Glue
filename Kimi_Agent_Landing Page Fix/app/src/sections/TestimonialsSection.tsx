import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Star, Quote, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function TestimonialsSection() {
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

      // Testimonial card animation
      const card = visualRef.current?.querySelector('.testimonial-card');
      if (card) {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
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

  const testimonials = [
    { name: 'Sarah Chen', role: 'VP of Operations', company: 'TechCorp', avatar: 'SC' },
    { name: 'Marcus Johnson', role: 'Head of Finance', company: 'StartupXYZ', avatar: 'MJ' },
    { name: 'Emily Davis', role: 'COO', company: 'ScaleUp Inc', avatar: 'ED' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
      style={{ zIndex: 108 }}
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          {/* Content - Right */}
          <div ref={contentRef} className="lg:w-1/2">
            <div className="eyebrow mb-4">CUSTOMERS</div>
            <h2 className="headline-display text-glue-text mb-6">
              Loved by fast-moving teams.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              From startups to enterprises—teams use Glue to ship decisions faster.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              Read customer stories
              <ArrowRight size={18} />
            </a>

            {/* Company logos */}
            <div className="flex items-center gap-6 mt-8">
              {testimonials.map((t, i) => (
                <div key={i} className="flex items-center gap-2 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-glue-text/20 flex items-center justify-center text-xs font-bold text-glue-text">
                    {t.avatar}
                  </div>
                  <span className="text-sm font-medium text-glue-text">{t.company}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual - Left */}
          <div ref={visualRef} className="lg:w-1/2">
            <div className="testimonial-card glue-card p-8 relative">
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-glue-accent flex items-center justify-center">
                <Quote size={24} className="text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl lg:text-2xl text-glue-text leading-relaxed mb-6">
                "Glue transformed our approval process. What used to take days now takes hours. The visibility alone is worth it."
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-glue-accent to-purple-500 flex items-center justify-center text-white font-bold">
                  SC
                </div>
                <div>
                  <div className="font-semibold text-glue-text">Sarah Chen</div>
                  <div className="text-sm text-glue-text-secondary">VP of Operations, TechCorp</div>
                </div>
                <div className="ml-auto w-6 h-6 rounded-full bg-glue-accent flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
