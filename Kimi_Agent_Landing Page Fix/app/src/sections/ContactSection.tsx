import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Mail, Clock, Calendar } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0.2, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 75%',
            end: 'top 40%',
            scrub: 0.5,
          },
        }
      );

      // Left column animation
      gsap.fromTo(
        leftColRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: leftColRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.5,
          },
        }
      );

      // Form card animation
      gsap.fromTo(
        formCardRef.current,
        { x: 40, opacity: 0, scale: 0.98 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formCardRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.5,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative bg-glue-dark dot-grid-dark py-20 lg:py-32"
      style={{ zIndex: 1100 }}
    >
      <div className="w-full px-6 lg:px-[6vw]">
        {/* Headline */}
        <h2
          ref={headlineRef}
          className="headline-display headline-outline mb-12 lg:mb-16"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
        >
          Ready to ship faster decisions?
        </h2>

        {/* Two column layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left Column - Contact Info */}
          <div
            ref={leftColRef}
            className="lg:w-[40vw] lg:max-w-[520px]"
          >
            <p className="text-lg lg:text-xl text-glue-text-muted-dark leading-relaxed mb-10">
              Tell us what you are building. We will reply within one business day.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-glue-accent/20 flex items-center justify-center">
                  <Mail size={20} className="text-glue-accent" />
                </div>
                <div>
                  <p className="font-mono text-xs text-glue-text-muted-dark uppercase tracking-wider">
                    Email
                  </p>
                  <a
                    href="mailto:sales@glue-workflow.com"
                    className="text-glue-bg hover:text-glue-accent transition-colors"
                  >
                    sales@glue-workflow.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-glue-accent/20 flex items-center justify-center">
                  <Clock size={20} className="text-glue-accent" />
                </div>
                <div>
                  <p className="font-mono text-xs text-glue-text-muted-dark uppercase tracking-wider">
                    Sales Hours
                  </p>
                  <p className="text-glue-bg">
                    Mon–Fri, 9am–6pm EST
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="bg-glue-accent hover:bg-glue-accent/90 text-white font-medium px-6 py-3 rounded-full btn-hover flex items-center gap-2"
                >
                  <Calendar size={18} />
                  Book a 15-min call
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div
            ref={formCardRef}
            className="lg:w-[44vw] lg:max-w-[640px] lg:ml-auto"
          >
            <div className="glue-card p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs text-glue-text-secondary uppercase tracking-wider mb-2">
                      Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-glue-text/10 bg-glue-bg focus:border-glue-accent focus:ring-1 focus:ring-glue-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-glue-text-secondary uppercase tracking-wider mb-2">
                      Work Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-glue-text/10 bg-glue-bg focus:border-glue-accent focus:ring-1 focus:ring-glue-accent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-glue-text-secondary uppercase tracking-wider mb-2">
                    Company
                  </label>
                  <Input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company name"
                    className="w-full px-4 py-3 rounded-xl border border-glue-text/10 bg-glue-bg focus:border-glue-accent focus:ring-1 focus:ring-glue-accent"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-glue-text-secondary uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your workflow needs..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-glue-text/10 bg-glue-bg focus:border-glue-accent focus:ring-1 focus:ring-glue-accent resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-glue-accent hover:bg-glue-accent/90 text-white font-medium px-6 py-3 rounded-full btn-hover"
                >
                  Send message
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 lg:mt-32 pt-8 border-t border-glue-text/10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="font-display font-bold text-2xl text-glue-bg">
              Glue
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm text-glue-text-muted-dark hover:text-glue-bg transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-glue-text-muted-dark hover:text-glue-bg transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-glue-text-muted-dark hover:text-glue-bg transition-colors">
                Security
              </a>
            </div>
            <p className="text-sm text-glue-text-muted-dark">
              © 2026 Glue. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
