import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

      // Pricing cards stagger
      const cards = visualRef.current?.querySelectorAll('.pricing-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.15,
            duration: 0.6,
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

  const plans = [
    {
      name: 'Starter',
      description: 'For small teams getting started',
      price: billingCycle === 'monthly' ? 0 : 0,
      features: [
        'Up to 5 workflows',
        '3 team members',
        'Basic SLA tracking',
        'Email notifications',
      ],
      cta: 'Get started free',
      popular: false,
    },
    {
      name: 'Business',
      description: 'For growing teams',
      price: billingCycle === 'monthly' ? 29 : 24,
      features: [
        'Unlimited workflows',
        'Unlimited team members',
        'Advanced SLA & reminders',
        'All integrations',
        'Priority support',
      ],
      cta: 'Start free trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      price: null,
      features: [
        'Everything in Business',
        'SSO & SCIM',
        'Custom contracts',
        'Dedicated success manager',
        'SLA guarantee',
      ],
      cta: 'Contact sales',
      popular: false,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
      style={{ zIndex: 109 }}
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content - Left */}
          <div ref={contentRef} className="lg:w-1/2">
            <div className="eyebrow mb-4">PRICING</div>
            <h2 className="headline-display text-glue-text mb-6">
              Simple pricing. No surprises.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              Start free, then scale with usage. No hidden fees, no forced annual contracts.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              Compare plans
              <ArrowRight size={18} />
            </a>
            <p className="mt-6 font-mono text-xs text-glue-text-secondary">
              Free for small teams. Enterprise SLAs available.
            </p>
          </div>

          {/* Visual - Right */}
          <div ref={visualRef} className="lg:w-1/2 w-full">
            {/* Billing toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-glue-bg rounded-full p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    billingCycle === 'monthly' ? 'bg-white text-glue-text shadow' : 'text-glue-text-secondary'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    billingCycle === 'yearly' ? 'bg-white text-glue-text shadow' : 'text-glue-text-secondary'
                  }`}
                >
                  Yearly <span className="text-glue-accent">-20%</span>
                </button>
              </div>
            </div>

            {/* Pricing cards */}
            <div className="space-y-4">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`pricing-card glue-card p-6 relative ${
                    plan.popular ? 'ring-2 ring-glue-accent' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-6 px-3 py-1 bg-glue-accent text-white text-xs font-medium rounded-full">
                      Popular
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-glue-text">{plan.name}</h3>
                      <p className="text-sm text-glue-text-secondary">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      {plan.price !== null ? (
                        <>
                          <span className="text-3xl font-bold text-glue-text">${plan.price}</span>
                          <span className="text-glue-text-secondary">/mo</span>
                        </>
                      ) : (
                        <span className="text-xl font-semibold text-glue-text">Custom</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-glue-text">
                        <Check size={16} className="text-glue-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full rounded-full ${
                      plan.popular
                        ? 'bg-glue-accent hover:bg-glue-accent/90 text-white'
                        : 'bg-glue-bg hover:bg-white text-glue-text'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
