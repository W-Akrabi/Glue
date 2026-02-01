"use client";

import { useState } from "react";

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
);

const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 11 14 9 22 21 10 13 10 13 2" />
  </svg>
);

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="14 7 21 7 21 14" />
  </svg>
);

const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </svg>
);

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-white">
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-white/10">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-xl font-bold tracking-tight">Glue</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm hover:text-gray-300 transition">Home</a>
            <a href="#platform" className="text-sm hover:text-gray-300 transition">Platform</a>
            <a href="#workflow" className="text-sm hover:text-gray-300 transition">Workflows</a>
            <a href="#security" className="text-sm hover:text-gray-300 transition">Security</a>
            <a href="#pricing" className="text-sm hover:text-gray-300 transition">Pricing</a>
            <a href="/login" className="text-sm hover:text-gray-300 transition">Sign in</a>
            <a href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-full text-sm font-medium transition">
              Start a Record
            </a>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation">
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="md:hidden border-t border-white/10 bg-card/95">
            <div className="px-6 py-4 flex flex-col gap-4 text-sm">
              <a href="#home" className="hover:text-gray-300 transition">Home</a>
              <a href="#platform" className="hover:text-gray-300 transition">Platform</a>
              <a href="#workflow" className="hover:text-gray-300 transition">Workflows</a>
              <a href="#security" className="hover:text-gray-300 transition">Security</a>
              <a href="#pricing" className="hover:text-gray-300 transition">Pricing</a>
              <a href="/login" className="hover:text-gray-300 transition">Sign in</a>
              <a href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-full text-center font-medium transition">
                Start a Record
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-emerald-500/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center px-6 w-full">
          <div className="mb-8 inline-block">
            <span className="bg-emerald-500/15 text-emerald-300 px-4 py-2 rounded-full text-sm border border-emerald-400/30">
              Approval workflows, finally unblocked
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Move approvals forward<br />
            without chasing people.
          </h1>

          <p className="text-gray-400 text-lg mb-10 w-full">
            Glue centralizes intake, routing, and audit trails so every request is clear, trackable, and approved on time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-full font-medium transition inline-flex items-center justify-center gap-2">
              Create your first workflow
            </a>
            <a href="/login" className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-medium transition">
              View the dashboard
            </a>
          </div>

          <div className="absolute right-8 top-1/3 hidden lg:block">
            <div className="text-xs text-gray-500 mt-2 text-center">
              Built for fast-moving teams ✓
            </div>
          </div>

          <div className="mt-20">
            <p className="text-gray-500 text-sm mb-8">Trusted by teams in finance, IT, HR, and operations</p>
            <div className="flex flex-wrap justify-center items-center gap-12 text-gray-200">
              <div className="flex items-center gap-2">
                <MessageSquareIcon className="w-6 h-6 text-emerald-300" />
                <span className="font-semibold">Policy Desk</span>
              </div>
              <div className="flex items-center gap-2">
                <TargetIcon className="w-6 h-6 text-emerald-300" />
                <span className="font-semibold">Ops Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <ZapIcon className="w-6 h-6 text-emerald-300" />
                <span className="font-semibold">FastTrack</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="py-32 px-6">
        <div className="w-full">
          <div className="text-center mb-20">
            <p className="text-emerald-300 mb-4">Glue Platform</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Everything you need to design<br />
              and scale approval workflows
            </h2>
            <p className="text-gray-400 w-full">
              Route requests by role, automate step-by-step reviews, and keep stakeholders aligned with clear timelines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-32">
            <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl p-8">
              <div className="mb-8">
                <div className="bg-card/60 rounded-xl p-6 mb-6 border border-white/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckIcon className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm">Purchase request submitted</span>
                      <span className="ml-auto text-xs text-gray-500">1/4</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-5 h-5 border border-white/15 rounded"></div>
                      <span className="text-sm">Manager approval</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-5 h-5 border border-white/15 rounded"></div>
                      <span className="text-sm">Finance review</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-5 h-5 border border-white/15 rounded"></div>
                      <span className="text-sm">Final sign-off</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Every step is logged with owner, role, and timestamp.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl p-8">
              <p className="text-emerald-300 mb-4 text-sm">Intake & routing</p>
              <h3 className="text-3xl font-bold mb-4">Automate request handoffs</h3>
              <p className="text-gray-400 mb-6">
                Convert Slack/email requests into structured intake forms, route by role, and notify the right approvers instantly.
              </p>
              <div className="flex gap-4">
                <button className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-white/40 transition">
                  Email intake
                </button>
                <button className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-white/40 transition">
                  Slack intake
                </button>
              </div>
            </div>
          </div>

          <div id="workflow" className="grid md:grid-cols-2 gap-8 mb-32">
            <div>
              <p className="text-emerald-300 mb-4 text-sm">Workflow builder</p>
              <h3 className="text-4xl font-bold mb-6">Delegate approvals in minutes</h3>
              <p className="text-gray-400 mb-8">
                Set step owners, escalation rules, and SLAs so requests never stall and everyone knows what comes next.
              </p>
              <div className="flex gap-4">
                <button className="text-sm bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition font-medium">
                  Workflow templates
                </button>
                <button className="text-sm border border-white/20 px-6 py-3 rounded-full hover:border-white/40 transition">
                  Role routing
                </button>
                <button className="text-sm border border-white/20 px-6 py-3 rounded-full hover:border-white/40 transition">
                  Escalations
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl p-8">
              <h4 className="font-semibold mb-4">Instant approval summary</h4>
              <p className="text-gray-400 text-sm mb-6">
                “We need a new vendor contract approved by Friday and aligned with security requirements.”
              </p>
              <div className="bg-card/60 rounded-lg p-6 border border-white/10">
                <p className="text-sm leading-relaxed text-gray-300">
                  Summary: Security + Legal approvals required.<br />
                  Owner: Ops team • SLA: 24 hours.<br />
                  Status: Pending at Step 2.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-32">
            <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-emerald-300" />
                  <span className="text-sm font-semibold">Approval velocity</span>
                </div>
                <div className="bg-card/60 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Median time to approve</span>
                    <span className="text-emerald-300">↓ 38%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Records auto-routed</span>
                    <span className="text-emerald-300">↑ 62%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">SLA compliance</span>
                    <span className="text-emerald-300">↑ 91%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-emerald-300 mb-4 text-sm">Analytics</p>
              <h3 className="text-4xl font-bold mb-6">Track every approval touchpoint</h3>
              <p className="text-gray-400 mb-8">
                Monitor bottlenecks, export audit logs, and share performance insights with leadership in real time.
              </p>
              <div className="flex gap-4">
                <button className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-white/40 transition">
                  Audit logs
                </button>
                <button className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-white/40 transition">
                  SLA reports
                </button>
                <button className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-white/40 transition">
                  Export data
                </button>
              </div>
            </div>
          </div>

          <div id="security" className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-emerald-300 mb-4 text-sm">Security</p>
              <h3 className="text-4xl font-bold mb-6">Keep approvals compliant</h3>
              <p className="text-gray-400 mb-8">
                Role-based access, immutable audit trails, and secure notifications keep your approvals aligned with policy.
              </p>
              <div className="flex gap-4">
                <button className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-white/40 transition">
                  Role permissions
                </button>
                <button className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-white/40 transition">
                  Audit trail
                </button>
                <button className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-white/40 transition">
                  Notifications
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-card/60 rounded-lg p-4 border border-white/10">
                  <MailIcon className="w-5 h-5 text-emerald-300" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Approval emails</div>
                    <div className="text-xs text-gray-500">Instant action links</div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-3 bg-card/60 rounded-lg p-4 border border-white/10">
                  <CalendarIcon className="w-5 h-5 text-emerald-300" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">SLA reminders</div>
                    <div className="text-xs text-gray-500">On-time escalations</div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-3 bg-card/60 rounded-lg p-4 border border-white/10">
                  <MessageSquareIcon className="w-5 h-5 text-emerald-300" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Slack approvals</div>
                    <div className="text-xs text-gray-500">Approve without leaving chat</div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-white/10">
        <div className="w-full text-center">
          <p className="text-emerald-300 mb-4">How Glue Works</p>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Simple intake.<br />
            Clear decisions. Faster approvals.
          </h2>
          <p className="text-gray-400 w-full">
            Centralize requests, assign owners, and track every decision in a single place that scales with your organization.
          </p>
        </div>
      </section>

      <section id="pricing" className="py-32 px-6 border-t border-white/10">
        <div className="w-full">
          <div className="text-center mb-16">
            <p className="text-emerald-300 mb-4">Get started</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Launch your org in minutes</h2>
            <p className="text-gray-400 w-full">
              No billing required. Create an org, invite your team, and start running approvals.
            </p>
          </div>

          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-black p-10">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200 mb-4">Core Features</p>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-5xl font-bold">Free</span>
                <span className="text-gray-400 text-sm mb-2">for now</span>
              </div>
              <p className="text-gray-300 mb-8">
                Unlimited workflows, approvers, and audit logs with SLA reminders built in.
              </p>
              <div className="grid gap-4 text-sm text-gray-200">
                {[
                  "Unlimited approval workflows",
                  "Custom SLA timers + escalations",
                  "In-app notifications",
                  "Audit trail and exports",
                  "Granular permissions",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-card/70 p-10">
              <p className="text-sm text-gray-400 mb-4">Ready to start?</p>
              <h3 className="text-2xl font-semibold mb-4">Activate in minutes</h3>
              <p className="text-gray-400 mb-8">
                Create an org and invite your team. Join existing orgs instantly.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="/signup"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-full text-sm font-medium text-center transition"
                >
                  Create an org
                </a>
                <a
                  href="/login"
                  className="border border-white/20 hover:border-white/40 px-6 py-3 rounded-full text-sm font-medium text-center transition"
                >
                  Join existing org
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-xl font-bold">Glue</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2025 Glue. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
