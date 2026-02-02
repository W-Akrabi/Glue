import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FeatureSectionProps {
  index: number;
  eyebrow: string;
  headline: string;
  body: string;
  linkText: string;
  imageSrc: string;
  imagePosition: 'left' | 'right';
  showLogos?: boolean;
  note?: string;
}

export default function FeatureSection({
  index,
  eyebrow,
  headline,
  body,
  linkText,
  imageSrc,
  imagePosition,
  showLogos,
  note,
}: FeatureSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textCardRef = useRef<HTMLDivElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.8,
        },
      });

      const textCard = textCardRef.current;
      const imageCard = imageCardRef.current;

      // Text card animation - smoother entrance from further away
      const textEntranceX = imagePosition === 'right' ? '-50vw' : '50vw';
      const textExitX = imagePosition === 'right' ? '-30vw' : '30vw';

      // ENTRANCE: 0% - 40% (content enters smoothly)
      scrollTl.fromTo(
        textCard,
        { x: textEntranceX, opacity: 0, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      // SETTLE: 40% - 70% (content stays fully visible)
      // EXIT: 70% - 100% (content exits smoothly)
      scrollTl.to(
        textCard,
        { x: textExitX, opacity: 0.25, scale: 0.96, ease: 'power2.in' },
        0.7
      );

      // Image card animation
      const imageEntranceX = imagePosition === 'right' ? '50vw' : '-50vw';
      const imageExitX = imagePosition === 'right' ? '30vw' : '-30vw';

      // ENTRANCE: 0% - 40%
      scrollTl.fromTo(
        imageCard,
        { x: imageEntranceX, opacity: 0, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      // EXIT: 70% - 100%
      scrollTl.to(
        imageCard,
        { x: imageExitX, opacity: 0.25, scale: 0.96, ease: 'power2.in' },
        0.7
      );

      // Headline words animation - staggered entrance
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        
        // ENTRANCE: words fade in with stagger (5% - 35%)
        scrollTl.fromTo(
          words,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
          0.05
        );
        
        // EXIT: words fade out (72% - 95%)
        scrollTl.to(
          words,
          { y: -15, opacity: 0, stagger: 0.015, ease: 'power2.in' },
          0.72
        );
      }

      // Content (body, link) animation
      if (contentRef.current) {
        const contentElements = contentRef.current.querySelectorAll('.animate-item');
        
        // ENTRANCE
        scrollTl.fromTo(
          contentElements,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.03, ease: 'none' },
          0.15
        );
        
        // EXIT
        scrollTl.to(
          contentElements,
          { y: -10, opacity: 0, stagger: 0.02, ease: 'power2.in' },
          0.75
        );
      }

    }, section);

    return () => ctx.revert();
  }, [imagePosition]);

  const headlineWords = headline.split(' ');
  const zIndex = 100 + index;

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-glue-bg dot-grid"
      style={{ zIndex }}
    >
      <div className="scene absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-[6vw]">
          {/* Text Card */}
          <div
            ref={textCardRef}
            className={`glue-card absolute top-[18vh] w-[44vw] h-[64vh] p-8 lg:p-10 flex flex-col justify-center ${
              imagePosition === 'right'
                ? 'left-[6vw]'
                : 'left-[52vw]'
            }`}
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="eyebrow mb-6 animate-item">{eyebrow}</div>

            <h2
              ref={headlineRef}
              className="headline-display text-glue-text mb-6"
            >
              {headlineWords.map((word, i) => (
                <span key={i} className="word inline-block mr-[0.25em]">
                  {word}
                </span>
              ))}
            </h2>

            <div ref={contentRef}>
              <p className="text-base lg:text-lg text-glue-text-secondary leading-relaxed max-w-[95%] animate-item">
                {body}
              </p>

              <a
                href="#"
                className="link-underline inline-flex items-center gap-2 mt-6 text-glue-accent font-medium animate-item"
              >
                {linkText}
                <ArrowRight size={18} />
              </a>

              {note && (
                <p className="mt-6 font-mono text-xs text-glue-text-secondary animate-item">
                  {note}
                </p>
              )}

              {showLogos && (
                <div className="flex items-center gap-6 mt-8 opacity-50 animate-item">
                  <div className="w-20 h-8 bg-glue-text/10 rounded" />
                  <div className="w-20 h-8 bg-glue-text/10 rounded" />
                  <div className="w-20 h-8 bg-glue-text/10 rounded" />
                </div>
              )}
            </div>
          </div>

          {/* Image Card */}
          <div
            ref={imageCardRef}
            className={`glue-card absolute top-[18vh] w-[42vw] h-[64vh] overflow-hidden ${
              imagePosition === 'right'
                ? 'left-[52vw]'
                : 'left-[6vw]'
            }`}
            style={{ willChange: 'transform, opacity' }}
          >
            <img
              src={imageSrc}
              alt={headline}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
