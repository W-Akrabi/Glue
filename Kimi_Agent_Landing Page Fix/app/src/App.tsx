import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import HeroSection from './sections/HeroSection';
import FeatureSection from './sections/FeatureSection';
import AssignmentSection from './sections/AssignmentSection';
import SLASection from './sections/SLASection';
import VisibilitySection from './sections/VisibilitySection';
import IntegrationsSection from './sections/IntegrationsSection';
import SecuritySection from './sections/SecuritySection';
import TestimonialsSection from './sections/TestimonialsSection';
import PricingSection from './sections/PricingSection';
import ContactSection from './sections/ContactSection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Global snap for pinned sections - only hero and first feature
    const setupGlobalSnap = () => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => {
        const start = st.start / maxScroll;
        const end = (st.end ?? st.start) / maxScroll;
        const settleCenter = start + (end - start) * 0.55;
        return { start, end, settleCenter };
      });

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.03 && value <= r.end + 0.03
            );
            if (!inPinned) return value;

            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.settleCenter - value) < Math.abs(closest - value)
                  ? r.settleCenter
                  : closest,
              pinnedRanges[0]?.settleCenter ?? 0
            );
            return target;
          },
          duration: { min: 0.2, max: 0.5 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    };

    const timer = setTimeout(setupGlobalSnap, 800);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="grain-overlay">
      <Navigation />
      
      {/* Hero Section - Pinned */}
      <HeroSection />
      
      {/* Workflow Builder - Pinned */}
      <FeatureSection
        index={2}
        eyebrow="WORKFLOW BUILDER"
        headline="Build the flow once. Use it everywhere."
        body="Map steps, set assignees, and add conditional rules so requests always reach the right people."
        linkText="See how it works"
        imageSrc="/workflow_builder_ui.jpg"
        imagePosition="right"
      />
      
      {/* Assignment Rules - Flowing with coded animation */}
      <AssignmentSection />
      
      {/* SLAs - Flowing with coded animation */}
      <SLASection />
      
      {/* Visibility - Flowing with coded animation */}
      <VisibilitySection />
      
      {/* Integrations - Flowing with coded animation */}
      <IntegrationsSection />
      
      {/* Security - Flowing with coded animation */}
      <SecuritySection />
      
      {/* Testimonials - Flowing with coded animation */}
      <TestimonialsSection />
      
      {/* Pricing - Flowing with coded animation */}
      <PricingSection />
      
      {/* Contact Section - Flowing */}
      <ContactSection />
    </div>
  );
}

export default App;
