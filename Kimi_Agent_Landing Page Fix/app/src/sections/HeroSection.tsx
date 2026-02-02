import { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Load animation (auto-play on mount)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Initial states
      gsap.set(leftCardRef.current, { x: '-40vw', opacity: 0, scale: 0.95 });
      gsap.set(rightCardRef.current, { x: '40vw', opacity: 0, scale: 0.95 });
      gsap.set(eyebrowRef.current, { y: 20, opacity: 0 });
      gsap.set(bodyRef.current, { y: 20, opacity: 0 });
      gsap.set(ctaRef.current, { y: 20, opacity: 0 });

      // Animate cards in with stagger
      tl.to(leftCardRef.current, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
      }, 0);

      tl.to(rightCardRef.current, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
      }, 0.15);

      // Animate headline words
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        gsap.set(words, { y: 30, opacity: 0 });
        tl.to(words, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.03,
        }, 0.4);
      }

      // Animate other elements
      tl.to(eyebrowRef.current, { y: 0, opacity: 1, duration: 0.6 }, 0.6);
      tl.to(bodyRef.current, { y: 0, opacity: 1, duration: 0.6 }, 0.7);
      tl.to(ctaRef.current, { y: 0, opacity: 1, duration: 0.6 }, 0.8);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Scroll-driven exit animation - smoother, exits later
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
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back to top
            gsap.to(leftCardRef.current, { x: 0, opacity: 1, scale: 1, duration: 0.3 });
            gsap.to(rightCardRef.current, { x: 0, opacity: 1, scale: 1, duration: 0.3 });
            if (headlineRef.current) {
              gsap.to(headlineRef.current.querySelectorAll('.word'), { y: 0, opacity: 1, duration: 0.3 });
            }
            gsap.to(eyebrowRef.current, { y: 0, opacity: 1, duration: 0.3 });
            gsap.to(bodyRef.current, { y: 0, opacity: 1, duration: 0.3 });
            gsap.to(ctaRef.current, { y: 0, opacity: 1, duration: 0.3 });
          },
        },
      });

      // SETTLE phase: 0% - 60% (content stays fully visible)
      // EXIT phase: 60% - 100% (content exits smoothly)
      
      // Left card exits to the left
      scrollTl.fromTo(
        leftCardRef.current,
        { x: 0, opacity: 1, scale: 1 },
        { x: '-35vw', opacity: 0.3, scale: 0.95, ease: 'power2.in' },
        0.6
      );

      // Right card exits to the right
      scrollTl.fromTo(
        rightCardRef.current,
        { x: 0, opacity: 1, scale: 1 },
        { x: '35vw', opacity: 0.3, scale: 0.95, ease: 'power2.in' },
        0.6
      );

      // Headline fades out with slight upward movement
      if (headlineRef.current) {
        scrollTl.fromTo(
          headlineRef.current.querySelectorAll('.word'),
          { y: 0, opacity: 1 },
          { y: -20, opacity: 0, stagger: 0.02, ease: 'power2.in' },
          0.65
        );
      }

      // Other elements fade out
      scrollTl.fromTo(
        eyebrowRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.62
      );

      scrollTl.fromTo(
        bodyRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.64
      );

      scrollTl.fromTo(
        ctaRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.66
      );

    }, section);

    return () => ctx.revert();
  }, []);

  const headlineWords = 'approvals that move as fast as your team'.split(' ');

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-glue-bg dot-grid z-[100]"
    >
      <div className="scene absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-[6vw]">
          {/* Left Card - Text */}
          <div
            ref={leftCardRef}
            className="glue-card absolute left-[6vw] top-[18vh] w-[42vw] h-[64vh] p-8 lg:p-10 flex flex-col justify-center"
            style={{ willChange: 'transform, opacity' }}
          >
            <div ref={eyebrowRef} className="eyebrow mb-6">
              GLUE / WORKFLOW PLATFORM
            </div>

            <h1
              ref={headlineRef}
              className="headline-display text-glue-text mb-6"
            >
              {headlineWords.map((word, i) => (
                <span key={i} className="word inline-block mr-[0.3em]">
                  {word}
                </span>
              ))}
            </h1>

            <p
              ref={bodyRef}
              className="text-base lg:text-lg text-glue-text-secondary leading-relaxed max-w-[90%]"
            >
              Design approval flows per record type, assign the right people at each step, and track every decision with clear SLAs.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4 mt-8">
              <Button
                className="bg-glue-accent hover:bg-glue-accent/90 text-white font-medium px-6 py-3 rounded-full btn-hover flex items-center gap-2"
              >
                Request demo
                <ArrowRight size={18} />
              </Button>
              <Button
                variant="outline"
                className="border-glue-text/20 text-glue-text hover:bg-glue-text/5 font-medium px-6 py-3 rounded-full btn-hover flex items-center gap-2"
              >
                <Play size={18} />
                Watch overview
              </Button>
            </div>
          </div>

          {/* Right Card - Image */}
          <div
            ref={rightCardRef}
            className="glue-card absolute left-[52vw] top-[18vh] w-[42vw] h-[64vh] overflow-hidden"
            style={{ willChange: 'transform, opacity' }}
          >
            <img
              src="/workflow_builder_ui.jpg"
              alt="Workflow Builder Interface"
              className="w-full h-full object-cover"
            />
            {/* Status dot */}
            <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-glue-accent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
