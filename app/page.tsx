"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  AlertCircle,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Lock,
  Mail,
  Menu,
  Play,
  Plus,
  Quote,
  Shield,
  Star,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const splitVariants = {
  hidden: (direction: number) => ({ x: direction * 60, opacity: 0 }),
  visible: { x: 0, opacity: 1 },
};

const splitTransition = { duration: 0.7, ease: "easeOut" as const };

interface FeatureSectionProps {
  eyebrow: string;
  headline: string;
  body: string;
  linkText: string;
  imageSrc: string;
  imagePosition: "left" | "right";
  showLogos?: boolean;
  note?: string;
  id?: string;
}

export default function Home() {
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.dataset.theme;
    root.dataset.theme = "light";

    return () => {
      if (previousTheme) {
        root.dataset.theme = previousTheme;
      } else {
        delete root.dataset.theme;
      }
    };
  }, []);

  return (
    <div
      className={`${inter.className} ${spaceGrotesk.variable} ${plexMono.variable} grain-overlay bg-glue-bg text-glue-text`}
    >
      <Navigation />
      <main>
        <HeroSection />
        <FeatureSection
          eyebrow="WORKFLOW BUILDER"
          headline="Build the flow once. Use it everywhere."
          body="Map steps, set assignees, and add conditional rules so requests always reach the right people."
          linkText="See how it works"
          imageSrc="/workflow_builder_ui.mp4"
          imagePosition="right"
        />
        <AssignmentSection />
        <SLASection />
        <VisibilitySection />
        <IntegrationsSection />
        <SecuritySection />
        <TestimonialsSection />
        <PricingSection />
        <ContactSection />
      </main>
    </div>
  );
}

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-[rgba(11,13,16,0.08)]"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <a
              href="#"
              className="font-display font-bold text-xl lg:text-2xl text-glue-text tracking-tight"
            >
              Glue
            </a>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-glue-text-secondary hover:text-glue-text transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:block">
              <Button className="bg-gradient-to-r from-[#4F6AFA] to-[#6B7CFF] hover:from-[#445DF2] hover:to-[#5F73FF] text-white font-medium px-5 py-2.5 rounded-full btn-hover shadow-[0_10px_30px_rgba(79,106,250,0.25)]">
                Request demo
              </Button>
            </div>

            <button
              className="lg:hidden p-2 text-glue-text"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[999] bg-glue-bg transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-display text-2xl font-semibold text-glue-text"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Button
            className="mt-4 bg-gradient-to-r from-[#4F6AFA] to-[#6B7CFF] hover:from-[#445DF2] hover:to-[#5F73FF] text-white font-medium px-8 py-3 rounded-full shadow-[0_10px_30px_rgba(79,106,250,0.25)]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get started
          </Button>
        </div>
      </div>
    </>
  );
}

function HeroSection() {
  const headlineWords = "approvals that move as fast as your team".split(" ");

  return (
    <section id="product" className="relative bg-glue-bg dot-grid pt-28 pb-16">
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            className="glue-card p-8 lg:p-10"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
            <div className="eyebrow mb-6">GLUE / WORKFLOW PLATFORM</div>
            <h1 className="headline-display text-glue-text mb-6">
              {headlineWords.map((word, i) => (
                <span key={`${word}-${i}`} className="inline-block mr-[0.3em]">
                  {word}
                </span>
              ))}
            </h1>
            <p className="text-base lg:text-lg text-glue-text-secondary leading-relaxed max-w-[90%]">
              Design approval flows per record type, assign the right people at each step, and track every decision with clear SLAs.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button className="bg-gradient-to-r from-[#4F6AFA] to-[#6B7CFF] hover:from-[#445DF2] hover:to-[#5F73FF] text-white font-medium px-6 py-3 rounded-full btn-hover flex items-center gap-2 shadow-[0_12px_32px_rgba(79,106,250,0.28)]">
                Request demo
                <ArrowRight size={18} />
              </Button>
              <Button
                variant="outline"
                className="border-[#E3E6F3] bg-white/70 text-[#2B2F3A] hover:bg-white font-medium px-6 py-3 rounded-full btn-hover flex items-center gap-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
              >
                <Play size={18} />
                Watch overview
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="glue-card overflow-hidden relative bg-gradient-to-br from-white to-[#EEF1FA]"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
            <video
              src="/workflow_builder_ui.mp4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-[#4F6AFA] animate-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureSection({
  eyebrow,
  headline,
  body,
  linkText,
  imageSrc,
  imagePosition,
  showLogos,
  note,
  id,
}: FeatureSectionProps) {
  const isVideo = imageSrc.endsWith(".mp4");

  return (
    <section
      id={id}
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            className={`lg:w-1/2 ${
              imagePosition === "right" ? "" : "lg:order-2"
            }`}
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
            <div className="glue-card p-8 lg:p-10 bg-gradient-to-br from-white to-[#EEF1FA]">
              <div className="eyebrow mb-6">{eyebrow}</div>
              <h2 className="headline-display text-glue-text mb-6">
                {headline}
              </h2>
              <p className="text-base lg:text-lg text-glue-text-secondary leading-relaxed max-w-[95%]">
                {body}
              </p>
              <a
                href="#"
                className="link-underline inline-flex items-center gap-2 mt-6 text-[#4F6AFA] font-medium"
              >
                {linkText}
                <ArrowRight size={18} />
              </a>
              {note && (
                <p className="mt-6 font-mono text-xs text-glue-text-secondary">
                  {note}
                </p>
              )}
              {showLogos && (
                <div className="flex items-center gap-6 mt-8 opacity-50">
                  <div className="w-20 h-8 bg-glue-text/10 rounded" />
                  <div className="w-20 h-8 bg-glue-text/10 rounded" />
                  <div className="w-20 h-8 bg-glue-text/10 rounded" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            className={`lg:w-1/2 ${
              imagePosition === "right" ? "" : "lg:order-1"
            }`}
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
            <div className="glue-card overflow-hidden bg-gradient-to-br from-white to-[#EEF1FA]">
              {isVideo ? (
                <video
                  src={imageSrc}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={imageSrc}
                  alt={headline}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AssignmentSection() {
  const avatars = [
    { initials: "JD", color: "bg-emerald-500" },
    { initials: "AM", color: "bg-blue-500" },
    { initials: "SK", color: "bg-purple-500" },
    { initials: "RL", color: "bg-orange-500" },
  ];

  return (
    <section
      id="solutions"
      className="relative bg-glue-bg dot-grid py-24 lg:py-32"
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
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
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
            <div className="glue-card p-8 lg:p-12 bg-gradient-to-br from-white to-[#EEF1FA]">
              <div className="flex items-center gap-4 flex-wrap">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.initials}
                    className={`w-14 h-14 rounded-full ${avatar.color} flex items-center justify-center text-white font-semibold shadow-lg`}
                  >
                    {avatar.initials}
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full bg-glue-accent flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-[#4F6AFA]" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-[#4F6AFA]" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full" />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-glue-bg rounded-full text-sm font-medium text-glue-text">
                  Manager approval
                </span>
                <span className="px-4 py-2 bg-glue-bg rounded-full text-sm font-medium text-glue-text">
                  Finance review
                </span>
                <span className="px-4 py-2 bg-[#4F6AFA]/10 rounded-full text-sm font-medium text-[#4F6AFA]">
                  + Add role
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SLASection() {
  const timelineItems = [
    { icon: CheckCircle, label: "Request submitted", time: "Now", status: "done" },
    { icon: Clock, label: "Manager review", time: "2h", status: "pending" },
    { icon: Bell, label: "Auto-reminder", time: "24h", status: "pending" },
    { icon: AlertCircle, label: "Escalation", time: "48h", status: "pending" },
  ];

  return (
    <section className="relative bg-glue-bg dot-grid py-24 lg:py-32">
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
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
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
            <div className="glue-card p-8 bg-gradient-to-br from-white to-[#EEF1FA]">
              <div className="flex items-center justify-between mb-6">
                <div className="font-semibold text-glue-text">October 2024</div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`day-${i}`}
                      className="w-8 h-8 rounded-lg bg-glue-bg flex items-center justify-center text-sm"
                    >
                      {15 + i}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {timelineItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-4 p-4 rounded-2xl ${
                      item.status === "done" ? "bg-glue-accent/10" : "bg-glue-bg"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.status === "done"
                          ? "bg-[#4F6AFA] text-white"
                          : "bg-white text-glue-text-secondary"
                      }`}
                    >
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-glue-text">
                        {item.label}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === "done"
                          ? "bg-[#4F6AFA] text-white"
                          : "bg-white text-glue-text-secondary"
                      }`}
                    >
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function VisibilitySection() {
  const records = [
    {
      name: "Q4 Budget Request",
      date: "Oct 24",
      status: "approved",
      amount: "$12,500",
    },
    {
      name: "Vendor Contract",
      date: "Oct 23",
      status: "pending",
      amount: "$8,200",
    },
    {
      name: "Team Expansion",
      date: "Oct 22",
      status: "approved",
      amount: "$45,000",
    },
    {
      name: "Software License",
      date: "Oct 21",
      status: "rejected",
      amount: "$3,400",
    },
  ];

  return (
    <section className="relative bg-glue-bg dot-grid py-24 lg:py-32">
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
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
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
            <div className="glue-card p-6 bg-gradient-to-br from-white to-[#EEF1FA] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-white to-[#EEF1FA] rounded-2xl p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                  <div className="text-2xl font-semibold text-[#4F6AFA]">
                    24
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1">Pending</div>
                </div>
                <div className="bg-gradient-to-br from-white to-[#EEF1FA] rounded-2xl p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                  <div className="text-2xl font-semibold text-[#22C55E]">
                    156
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1">Approved</div>
                </div>
                <div className="bg-gradient-to-br from-white to-[#EEF1FA] rounded-2xl p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                  <div className="text-2xl font-semibold text-[#1F2430]">
                    12
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1">
                    This week
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.name}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-white to-[#EEF1FA] shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                        record.status === "approved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : record.status === "pending"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}
                    >
                      {record.status === "approved" ? (
                        <CheckCircle size={16} />
                      ) : record.status === "pending" ? (
                        <Clock size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[#1F2430] text-sm">
                        {record.name}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {record.date}
                      </div>
                    </div>
                    <div className="font-semibold text-[#1F2430]">
                      {record.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  const integrations = [
    { name: "Slack", color: "bg-purple-500", connected: true },
    { name: "Salesforce", color: "bg-blue-500", connected: true },
    { name: "Zendesk", color: "bg-black", connected: false },
    { name: "HubSpot", color: "bg-orange-500", connected: true },
    { name: "Stripe", color: "bg-indigo-500", connected: false },
    { name: "Notion", color: "bg-gray-700", connected: true },
  ];

  return (
    <section className="relative bg-glue-bg dot-grid py-24 lg:py-32">
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
            <div className="eyebrow mb-4">INTEGRATIONS</div>
            <h2 className="headline-display text-glue-text mb-6">
              Connect your stack.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              Sync with the tools your team already uses—no code required.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              Browse integrations
              <ArrowRight size={18} />
            </a>
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
            <div className="glue-card p-8 bg-gradient-to-br from-white to-[#EEF1FA]">
              <div className="grid grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className={`relative p-6 rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 cursor-pointer border ${
                      integration.connected
                        ? "bg-white border-[#4F6AFA]/40 shadow-[0_12px_30px_rgba(79,106,250,0.12)]"
                        : "bg-white/80 border-transparent hover:border-[#E6E9F4]"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center text-white font-bold text-lg`}
                    >
                      {integration.name[0]}
                    </div>
                    <div className="text-sm font-medium text-glue-text">
                      {integration.name}
                    </div>
                    {integration.connected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#4F6AFA] flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="text-[#4F6AFA] font-medium hover:underline">
                  + 47 more integrations
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const [toggles, setToggles] = useState({
    sso: true,
    scim: true,
    audit: true,
    mfa: false,
  });

  const securityFeatures = [
    { key: "sso", label: "Single Sign-On (SSO)", icon: Users },
    { key: "scim", label: "SCIM Provisioning", icon: Shield },
    { key: "audit", label: "Audit Logs", icon: FileText },
    { key: "mfa", label: "Multi-Factor Auth", icon: Lock },
  ];

  const auditLogs = [
    { action: "User login", user: "john@company.com", time: "2m ago" },
    { action: "Policy updated", user: "admin@company.com", time: "1h ago" },
    { action: "Role assigned", user: "sarah@company.com", time: "3h ago" },
  ];

  return (
    <section className="relative bg-glue-bg dot-grid py-24 lg:py-32">
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
            <div className="eyebrow mb-4">SECURITY</div>
            <h2 className="headline-display text-glue-text mb-6">
              Built to be trusted.
            </h2>
            <p className="text-lg text-glue-text-secondary leading-relaxed mb-6">
              SSO, SCIM, audit logs, and granular permissions—enterprise-ready from day one.
            </p>
            <a
              href="#"
              className="link-underline inline-flex items-center gap-2 text-glue-accent font-medium"
            >
              Security overview
              <ArrowRight size={18} />
            </a>
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
            <div className="glue-card p-6 bg-gradient-to-br from-white to-[#EEF1FA]">
              <div className="space-y-4 mb-6">
                {securityFeatures.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-[#E6E9F4]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-glue-text">
                        <feature.icon size={20} />
                      </div>
                      <span className="font-medium text-glue-text">
                        {feature.label}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setToggles((prev) => ({
                          ...prev,
                          [feature.key]: !prev[feature.key as keyof typeof prev],
                        }))
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        toggles[feature.key as keyof typeof toggles]
                          ? "bg-[#4F6AFA]"
                          : "bg-[#D7DCE8]"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles[feature.key as keyof typeof toggles]
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-glue-text/10 pt-4">
                <div className="font-medium text-glue-text mb-3">
                  Recent Activity
                </div>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.action} className="flex items-center gap-3 text-sm">
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-glue-text">{log.action}</span>
                      <span className="text-glue-text-secondary ml-auto">
                        {log.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: "Sarah Chen", role: "VP of Operations", company: "TechCorp", avatar: "SC" },
    { name: "Marcus Johnson", role: "Head of Finance", company: "StartupXYZ", avatar: "MJ" },
    { name: "Emily Davis", role: "COO", company: "ScaleUp Inc", avatar: "ED" },
  ];

  return (
    <section className="relative bg-glue-bg dot-grid py-24 lg:py-32">
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
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

            <div className="flex items-center gap-6 mt-8">
              {testimonials.map((t) => (
                <div key={t.name} className="flex items-center gap-2 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-glue-text/20 flex items-center justify-center text-xs font-bold text-glue-text">
                    {t.avatar}
                  </div>
                  <span className="text-sm font-medium text-glue-text">
                    {t.company}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
            <div className="glue-card p-8 relative bg-gradient-to-br from-white to-[#EEF1FA]">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-glue-accent flex items-center justify-center">
                <Quote size={24} className="text-white" />
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`star-${i}`}
                    size={18}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <blockquote className="text-xl lg:text-2xl text-glue-text leading-relaxed mb-6">
                “Glue transformed our approval process. What used to take days now takes hours. The visibility alone is worth it.”
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-glue-accent to-purple-500 flex items-center justify-center text-white font-bold">
                  SC
                </div>
                <div>
                  <div className="font-semibold text-glue-text">Sarah Chen</div>
                  <div className="text-sm text-glue-text-secondary">
                    VP of Operations, TechCorp
                  </div>
                </div>
                <div className="ml-auto w-6 h-6 rounded-full bg-[#4F6AFA] flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = [
    {
      name: "Starter",
      description: "For small teams getting started",
      price: billingCycle === "monthly" ? 0 : 0,
      features: [
        "Up to 5 workflows",
        "3 team members",
        "Basic SLA tracking",
        "Email notifications",
      ],
      cta: "Get started free",
      popular: false,
    },
    {
      name: "Business",
      description: "For growing teams",
      price: billingCycle === "monthly" ? 29 : 24,
      features: [
        "Unlimited workflows",
        "Unlimited team members",
        "Advanced SLA & reminders",
        "All integrations",
        "Priority support",
      ],
      cta: "Start free trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: null,
      features: [
        "Everything in Business",
        "SSO & SCIM",
        "Custom contracts",
        "Dedicated success manager",
        "SLA guarantee",
      ],
      cta: "Contact sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative bg-glue-bg dot-grid py-24 lg:py-32">
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            className="lg:w-1/2"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
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
          </motion.div>

          <motion.div
            className="lg:w-1/2 w-full"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
          >
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-white/80 border border-[#E6E9F4] rounded-full p-1 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === "monthly"
                      ? "bg-white text-[#1F2430] shadow"
                      : "text-[#6B7280]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === "yearly"
                      ? "bg-white text-[#1F2430] shadow"
                      : "text-[#6B7280]"
                }`}
              >
                Yearly <span className="text-[#4F6AFA]">-20%</span>
              </button>
            </div>
          </div>

            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`glue-card p-6 relative bg-gradient-to-br from-white to-[#EEF1FA] ${
                    plan.popular ? "ring-2 ring-[#4F6AFA]" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-6 px-3 py-1 bg-[#4F6AFA] text-white text-xs font-medium rounded-full">
                      Popular
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-glue-text">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-glue-text-secondary">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      {plan.price !== null ? (
                        <>
                          <span className="text-3xl font-bold text-glue-text">
                            ${plan.price}
                          </span>
                          <span className="text-glue-text-secondary">/mo</span>
                        </>
                      ) : (
                        <span className="text-xl font-semibold text-glue-text">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-glue-text">
                        <Check size={16} className="text-[#4F6AFA]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full rounded-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#4F6AFA] to-[#6B7CFF] hover:from-[#445DF2] hover:to-[#5F73FF] text-white shadow-[0_10px_30px_rgba(79,106,250,0.25)]"
                        : "bg-white/80 hover:bg-white text-[#1F2430] border border-[#E6E9F4]"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  return (
    <section
      id="contact"
      className="relative bg-[#0B0D10] dot-grid-dark py-20 lg:py-32"
    >
      <div className="w-full px-6 lg:px-[6vw]">
        <h2
          className="headline-display headline-outline mb-12 lg:mb-16"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          Ready to ship faster decisions?
        </h2>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <motion.div
            className="lg:w-[40vw] lg:max-w-[520px]"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={-1}
            transition={splitTransition}
          >
            <p className="text-lg lg:text-xl text-white/70 leading-relaxed mb-10">
              Tell us what you are building. We will reply within one business day.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-glue-accent/20 flex items-center justify-center">
                  <Mail size={20} className="text-glue-accent" />
                </div>
                <div>
                  <p className="font-mono text-xs text-white/50 uppercase tracking-wider">
                    Email
                  </p>
                  <a
                    href="mailto:sales@glue-workflow.com"
                    className="text-white/80 hover:text-white transition-colors"
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
                  <p className="font-mono text-xs text-white/50 uppercase tracking-wider">
                    Sales Hours
                  </p>
                  <p className="text-white/80">Mon–Fri, 9am–6pm EST</p>
                </div>
              </div>

              <div className="pt-4">
                <Button className="bg-glue-accent hover:bg-glue-accent/90 text-white font-medium px-6 py-3 rounded-full btn-hover flex items-center gap-2">
                  <Calendar size={18} />
                  Book a 15-min call
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:w-[44vw] lg:max-w-[640px] lg:ml-auto"
            variants={splitVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={1}
            transition={splitTransition}
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
                      onChange={(event) =>
                        setFormData({ ...formData, name: event.target.value })
                      }
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
                      onChange={(event) =>
                        setFormData({ ...formData, email: event.target.value })
                      }
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
                    onChange={(event) =>
                      setFormData({ ...formData, company: event.target.value })
                    }
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
                    onChange={(event) =>
                      setFormData({ ...formData, message: event.target.value })
                    }
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
          </motion.div>
        </div>

        <footer className="mt-20 lg:mt-32 pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="font-display font-bold text-2xl text-white">
              Glue
            </div>
            <div className="flex items-center gap-8">
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Security
              </a>
            </div>
            <p className="text-sm text-white/50">
              © 2026 Glue. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
