import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ArrowRight, 
  Zap, 
  MessageSquare, 
  Shield, 
  Clock, 
  Users, 
  FileText,
  ChevronRight,
  Layers,
  Workflow,
  Bell,
  Menu,
  X,
  Play,
  BarChart3,
  Lock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Linear-style easing
const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Stagger delays like Linear
const staggerDelay = 0.05;

// Fade in up animation variant
const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: easeOut }
  }
};

// Navigation - Linear style with subtle blur
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Features', href: '#features' },
    { label: 'Workflows', href: '#workflows' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo - Raycast style */}
          <motion.a
            href="#"
            className="flex items-center gap-2.5 group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5e6ad2] to-[#7c8ae8] flex items-center justify-center shadow-lg shadow-[#5e6ad2]/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Glue</span>
          </motion.a>

          {/* Desktop Navigation - Linear style */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-[13px] text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/[0.04]"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-3 py-1.5 text-[13px] text-white/60 hover:text-white transition-colors"
            >
              Log in
            </a>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="h-8 px-4 text-[13px] font-medium bg-[#5e6ad2] hover:bg-[#6b78e0] text-white rounded-md transition-colors">
                Get started
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <div className="py-3 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-2 text-[13px] text-white/60 hover:text-white hover:bg-white/[0.04] rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-1">
                  <a href="/login" className="block px-3 py-2 text-[13px] text-white/60 hover:text-white">
                    Log in
                  </a>
                  <Button className="w-full h-9 text-[13px] bg-[#5e6ad2] hover:bg-[#6b78e0] text-white rounded-md">
                    Get started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

// Hero Section - Linear/Vercel style
function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background - Vercel style gradient */}
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#5e6ad2]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7c8ae8]/5 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge - Linear style */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5e6ad2]" />
          <span className="text-[13px] text-white/70">Now with AI-powered routing</span>
        </motion.div>

        {/* Headline - Vercel style typography */}
        <motion.h1
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.4, delay: staggerDelay, ease: easeOut }
            }
          }}
          className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight mb-6 leading-[1.1]"
        >
          <span className="text-white">Approval workflows</span>
          <br />
          <span className="text-white/50">that just work</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.4, delay: staggerDelay * 2, ease: easeOut }
            }
          }}
          className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Glue turns chaotic approval processes into streamlined workflows. 
          Route requests, track decisions, and never let anything slip through.
        </motion.p>

        {/* CTA Buttons - Stripe style */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.4, delay: staggerDelay * 3, ease: easeOut }
            }
          }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="h-11 px-6 text-[14px] font-medium bg-[#5e6ad2] hover:bg-[#6b78e0] text-white rounded-md transition-all shadow-lg shadow-[#5e6ad2]/25"
            >
              Start for free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-[14px] font-medium border-white/10 hover:bg-white/[0.04] text-white/80 hover:text-white rounded-md transition-all"
            >
              <Play className="mr-2 w-4 h-4" />
              Watch demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview - Linear style UI */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.98 },
            visible: { 
              opacity: 1, 
              y: 0,
              scale: 1,
              transition: { duration: 0.5, delay: staggerDelay * 4, ease: easeOut }
            }
          }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-b from-[#5e6ad2]/20 to-transparent rounded-xl blur-xl opacity-50" />
          
          {/* Main card */}
          <div className="relative rounded-lg overflow-hidden border border-white/[0.08] bg-[#0f0f14] shadow-2xl">
            {/* Window header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 py-1 rounded-md bg-white/[0.04] text-[11px] text-white/40">
                  glue.app/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[14px] font-medium text-white/90">Requests</h3>
                  <p className="text-[12px] text-white/40">Manage your approval workflows</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-md bg-white/[0.04] text-[12px] text-white/60 border border-white/[0.06]">
                    Filter
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-[#5e6ad2] text-[12px] text-white">
                    New request
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Pending', value: '12', color: 'text-yellow-500' },
                  { label: 'Approved', value: '48', color: 'text-[#5e6ad2]' },
                  { label: 'This week', value: '+23%', color: 'text-green-500' },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                    <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[11px] text-white/40">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Request list */}
              <div className="space-y-2">
                {[
                  { title: 'Vendor contract approval', status: 'Pending', assignee: 'Legal', time: '2m' },
                  { title: 'Q4 budget request', status: 'Approved', assignee: 'Finance', time: '1h' },
                  { title: 'New hire requisition', status: 'Pending', assignee: 'HR', time: '3h' },
                ].map((req, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${req.status === 'Approved' ? 'bg-[#5e6ad2]' : 'bg-yellow-500'}`} />
                      <span className="text-[13px] text-white/80 group-hover:text-white transition-colors">{req.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-white/40">{req.assignee}</span>
                      <span className="text-[11px] text-white/30">{req.time}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        req.status === 'Approved' 
                          ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]' 
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social proof - Stripe style */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { duration: 0.4, delay: staggerDelay * 6, ease: easeOut }
            }
          }}
          className="mt-16"
        >
          <p className="text-[12px] text-white/30 mb-6 uppercase tracking-wider">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {['Vercel', 'Linear', 'Notion', 'Stripe', 'Raycast'].map((company) => (
              <span key={company} className="text-[14px] text-white/20 hover:text-white/40 transition-colors cursor-default">
                {company}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Feature Card - Raycast style
function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.4, delay: index * staggerDelay, ease: easeOut }
        }
      }}
      className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
    >
      <div className="w-9 h-9 rounded-lg bg-[#5e6ad2]/10 flex items-center justify-center mb-4 group-hover:bg-[#5e6ad2]/15 transition-colors">
        <feature.icon className="w-4.5 h-4.5 text-[#5e6ad2]" />
      </div>
      <h3 className="text-[14px] font-medium text-white/90 mb-1.5">{feature.title}</h3>
      <p className="text-[13px] text-white/40 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

// Product Section - Linear style
function ProductSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Zap, title: 'Lightning fast', description: 'Create workflows in under 5 minutes. No code required.' },
    { icon: Users, title: 'Smart routing', description: 'AI-powered routing to the right people at the right time.' },
    { icon: Clock, title: 'SLA tracking', description: 'Never miss a deadline with automatic reminders.' },
  ];

  return (
    <section ref={ref} id="product" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-white/50 mb-6">
            The Platform
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
            Everything you need to
            <br />
            <span className="text-white/50">ship approvals faster</span>
          </h2>
          <p className="text-lg text-white/40 max-w-lg mx-auto">
            From intake to final sign-off, Glue gives you the tools to design, run, and optimize workflows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Interactive Demo - Linear style */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5, delay: 0.3, ease: easeOut }
            }
          }}
          className="relative"
        >
          <div className="absolute -inset-px bg-gradient-to-b from-[#5e6ad2]/20 to-transparent rounded-xl blur-xl opacity-30" />
          <div className="relative rounded-lg overflow-hidden border border-white/[0.08] bg-[#0f0f14]">
            <div className="grid lg:grid-cols-5">
              {/* Sidebar */}
              <div className="lg:col-span-1 p-4 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-md bg-[#5e6ad2]/10 flex items-center justify-center">
                    <Workflow className="w-4 h-4 text-[#5e6ad2]" />
                  </div>
                  <span className="text-[13px] font-medium text-white/90">Workflows</span>
                </div>
                <div className="space-y-0.5">
                  {['All requests', 'Pending', 'Approved', 'Rejected'].map((item, i) => (
                    <div
                      key={item}
                      className={`px-3 py-2 rounded-md text-[12px] cursor-pointer transition-colors ${
                        i === 1
                          ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="lg:col-span-4 p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[14px] font-medium text-white/90">Recent Requests</h3>
                  <Button size="sm" className="h-8 text-[12px] bg-[#5e6ad2] hover:bg-[#6b78e0] text-white rounded-md">
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    New Request
                  </Button>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Vendor contract approval', status: 'Pending', step: 'Legal review', time: '2m ago' },
                    { title: 'Q4 budget request', status: 'Approved', step: 'Completed', time: '1h ago' },
                    { title: 'New hire requisition', status: 'Pending', step: 'Manager approval', time: '3h ago' },
                    { title: 'Software purchase', status: 'Approved', step: 'Completed', time: '5h ago' },
                  ].map((req, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                          req.status === 'Approved' ? 'bg-[#5e6ad2]/10' : 'bg-yellow-500/10'
                        }`}>
                          {req.status === 'Approved' ? (
                            <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] text-white/80 group-hover:text-white transition-colors">{req.title}</p>
                          <p className="text-[11px] text-white/40">{req.step}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-white/30">{req.time}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Features Section - Stripe style grid
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: FileText, title: 'Smart Forms', description: 'Dynamic forms with conditional logic' },
    { icon: BarChart3, title: 'Analytics', description: 'Track approval velocity and bottlenecks' },
    { icon: Bell, title: 'Notifications', description: 'In-app, email, and Slack alerts' },
    { icon: Lock, title: 'Permissions', description: 'Granular access controls' },
    { icon: Shield, title: 'Audit Trail', description: 'Complete decision history' },
    { icon: MessageSquare, title: 'Comments', description: 'Inline discussions with @mentions' },
  ];

  return (
    <section ref={ref} id="features" className="py-32 relative border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-white/50 mb-6">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
            Built for modern teams
          </h2>
          <p className="text-lg text-white/40 max-w-lg mx-auto">
            Powerful features that make approval management a breeze.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.4, delay: index * staggerDelay, ease: easeOut }
                }
              }}
              className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#5e6ad2]/10 flex items-center justify-center mb-4 group-hover:bg-[#5e6ad2]/15 transition-colors">
                <feature.icon className="w-4.5 h-4.5 text-[#5e6ad2]" />
              </div>
              <h3 className="text-[14px] font-medium text-white/90 mb-1.5">{feature.title}</h3>
              <p className="text-[13px] text-white/40 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Workflows Section - Linear style
function WorkflowsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    { title: 'Submit', description: 'User submits through smart forms', icon: FileText },
    { title: 'Route', description: 'AI routes to right approvers', icon: Zap },
    { title: 'Review', description: 'Collaborate and decide', icon: Users },
    { title: 'Track', description: 'Real-time visibility', icon: BarChart3 },
  ];

  return (
    <section ref={ref} id="workflows" className="py-32 relative border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-white/50 mb-6">
              Workflows
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Design approvals in
              <br />
              <span className="text-white/50">minutes, not days</span>
            </h2>
            <p className="text-lg text-white/40 mb-10">
              Our visual workflow builder lets you create complex approval processes with drag-and-drop simplicity.
            </p>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { duration: 0.4, delay: index * staggerDelay, ease: easeOut }
                    }
                  }}
                  className="flex gap-4 group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#5e6ad2]/10 flex items-center justify-center">
                      <step.icon className="w-4.5 h-4.5 text-[#5e6ad2]" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-px flex-1 bg-white/[0.08] my-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-[14px] font-medium text-white/90 mb-1">{step.title}</h4>
                    <p className="text-[13px] text-white/40">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, x: 20 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { duration: 0.5, delay: 0.2, ease: easeOut }
              }
            }}
            className="relative"
          >
            <div className="absolute -inset-px bg-gradient-to-b from-[#5e6ad2]/20 to-transparent rounded-xl blur-xl opacity-30" />
            <div className="relative space-y-3">
              {[
                { title: 'Purchase Request', status: 'Active', steps: ['Submit', 'Manager', 'Finance', 'Final'], progress: 2 },
                { title: 'Time Off Request', status: 'Active', steps: ['Submit', 'Manager', 'HR'], progress: 3 },
                { title: 'Security Review', status: 'Draft', steps: ['Submit', 'Security', 'Compliance'], progress: 0 },
              ].map((workflow, i) => (
                <div
                  key={workflow.title}
                  className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      i === 0 ? 'bg-[#5e6ad2]/10' : i === 1 ? 'bg-indigo-500/10' : 'bg-purple-500/10'
                    }`}>
                      <Workflow className={`w-4 h-4 ${
                        i === 0 ? 'text-[#5e6ad2]' : i === 1 ? 'text-indigo-500' : 'text-purple-500'
                      }`} />
                    </div>
                    <span className="text-[13px] font-medium text-white/90">{workflow.title}</span>
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                      workflow.status === 'Active' ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]' : 'bg-white/[0.06] text-white/40'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {workflow.steps.map((step, j) => (
                      <div key={step} className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-1 rounded ${
                          j < workflow.progress
                            ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]'
                            : 'bg-white/[0.04] text-white/30'
                        }`}>
                          {step}
                        </span>
                        {j < workflow.steps.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-white/20" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Security Section
function SecuritySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Shield, title: 'SOC 2 Type II', description: 'Certified security controls' },
    { icon: Lock, title: 'End-to-end encryption', description: 'Data encrypted at rest and in transit' },
    { icon: Users, title: 'SSO & SAML', description: 'Enterprise authentication support' },
    { icon: FileText, title: 'GDPR compliant', description: 'Full data privacy controls' },
  ];

  return (
    <section ref={ref} id="security" className="py-32 relative border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-white/50 mb-6">
            Security
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
            Enterprise-grade
            <br />
            <span className="text-white/50">security built-in</span>
          </h2>
          <p className="text-lg text-white/40 max-w-lg mx-auto">
            Your approval data is sensitive. Security is foundational to everything we build.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.4, delay: index * staggerDelay, ease: easeOut }
                }
              }}
              className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#5e6ad2]/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-[#5e6ad2]" />
              </div>
              <h3 className="text-[14px] font-medium text-white/90 mb-1">{feature.title}</h3>
              <p className="text-[12px] text-white/40">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section - Stripe style
function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    'Unlimited workflows',
    'Unlimited approvers',
    'SLA tracking & reminders',
    'In-app notifications',
    'Audit trail & exports',
    'Granular permissions',
    'API access',
    'Email support',
  ];

  return (
    <section ref={ref} id="pricing" className="py-32 relative border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-white/50 mb-6">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-white/40 max-w-lg mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { duration: 0.4, delay: 0.1, ease: easeOut }
              }
            }}
            className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <p className="text-[12px] font-medium text-white/50 mb-2">Free</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-semibold">$0</span>
              <span className="text-white/40 text-[13px]">/month</span>
            </div>
            <p className="text-[13px] text-white/40 mb-6">
              Perfect for small teams getting started.
            </p>
            <Button
              variant="outline"
              className="w-full h-10 text-[13px] border-white/10 hover:bg-white/[0.04] rounded-md"
            >
              Get started
            </Button>
            <div className="mt-6 space-y-3">
              {features.slice(0, 4).map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#5e6ad2] flex-shrink-0" />
                  <span className="text-[12px] text-white/60">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, x: 10 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { duration: 0.4, delay: 0.2, ease: easeOut }
              }
            }}
            className="relative p-6 rounded-xl bg-[#5e6ad2]/5 border border-[#5e6ad2]/20"
          >
            <div className="absolute -top-2.5 left-6">
              <span className="px-2.5 py-0.5 rounded-full bg-[#5e6ad2] text-white text-[10px] font-medium">
                Most popular
              </span>
            </div>
            <p className="text-[12px] font-medium text-[#5e6ad2] mb-2">Pro</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-semibold">$12</span>
              <span className="text-white/40 text-[13px]">/user/month</span>
            </div>
            <p className="text-[13px] text-white/40 mb-6">
              For growing teams that need advanced features.
            </p>
            <Button className="w-full h-10 text-[13px] bg-[#5e6ad2] hover:bg-[#6b78e0] text-white rounded-md">
              Start free trial
            </Button>
            <div className="mt-6 space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#5e6ad2] flex-shrink-0" />
                  <span className="text-[12px] text-white/60">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 relative">
      <div className="absolute inset-0 bg-radial-glow opacity-50" />
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="relative max-w-2xl mx-auto px-6 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
          Ready to streamline your
          <br />
          <span className="text-white/50">approval workflows?</span>
        </h2>
        <p className="text-lg text-white/40 mb-8">
          Join thousands of teams who have eliminated approval bottlenecks with Glue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="h-11 px-6 text-[14px] font-medium bg-[#5e6ad2] hover:bg-[#6b78e0] text-white rounded-md shadow-lg shadow-[#5e6ad2]/25"
            >
              Start for free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-[14px] font-medium border-white/10 hover:bg-white/[0.04] text-white/80 hover:text-white rounded-md"
            >
              Talk to sales
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Footer - Linear style
function Footer() {
  const links = {
    Product: ['Features', 'Pricing', 'Security', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Resources: ['Docs', 'API', 'Guides', 'Support'],
    Legal: ['Privacy', 'Terms', 'Cookies'],
  };

  return (
    <footer className="py-12 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-10">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5e6ad2] to-[#7c8ae8] flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-semibold">Glue</span>
            </a>
            <p className="text-[12px] text-white/40 max-w-xs mb-4">
              The modern approval workflow platform for fast-moving teams.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-[12px] font-medium text-white/60 mb-3">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-white/30">
            © 2025 Glue. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Status', 'Security', 'Sitemap'].map((item) => (
              <a key={item} href="#" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main App
function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      <Navigation />
      <main>
        <HeroSection />
        <ProductSection />
        <FeaturesSection />
        <WorkflowsSection />
        <SecuritySection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
