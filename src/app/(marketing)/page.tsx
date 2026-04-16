import Link from "next/link";
import { Dumbbell, CheckCircle2, QrCode, CalendarDays, BarChart3, Users, Shield, ChevronDown } from "lucide-react";

const FEATURES = [
    { icon: Users, title: "Member Management", desc: "Full CRUD, CSV import, role-based access, and member profiles." },
    { icon: CalendarDays, title: "Class Scheduling", desc: "Recurring classes, trainer assignment, and member booking." },
    { icon: QrCode, title: "QR Check-In", desc: "Scan member QR codes or use manual search for fast check-ins." },
    { icon: BarChart3, title: "Analytics", desc: "MRR, ARR, churn rate, member growth, and check-in trends." },
    { icon: Shield, title: "Waivers & Forms", desc: "Custom signup forms with legal waivers and Authorize.net payments." },
    { icon: Dumbbell, title: "Multi-Tenant SaaS", desc: "Each gym gets their own subdomain, data, and branding." },
];

const PRICING = [
    { name: "Starter", price: "49", period: "/mo", features: ["Up to 100 members", "1 location", "QR check-in", "Basic analytics"], cta: "Get Started" },
    { name: "Growth", price: "99", period: "/mo", features: ["Up to 500 members", "3 locations", "Class scheduling", "Email/SMS reminders", "Custom domain"], cta: "Get Started", popular: true },
    { name: "Pro", price: "199", period: "/mo", features: ["Unlimited members", "Unlimited locations", "Full analytics", "Priority support", "API access"], cta: "Contact Sales" },
];

const TESTIMONIALS = [
    { name: "Sarah M.", gym: "Iron Fitness", quote: "GymSaaS cut our admin time in half. The QR check-in alone is worth it." },
    { name: "James T.", gym: "Peak Performance", quote: "Our members love the self-service portal. Cancellations and billing are seamless." },
    { name: "Lisa K.", gym: "Flex Studio", quote: "Setup took 20 minutes. We were taking payments the same day." },
];

const FAQS = [
    { q: "Can I import my existing members?", a: "Yes — upload a CSV with member details including Authorize.net customer IDs to migrate instantly." },
    { q: "Does it support recurring memberships?", a: "Yes — monthly, yearly, weekly, and daily billing intervals with Authorize.net subscriptions." },
    { q: "Can members book classes online?", a: "Yes — members get a dashboard where they can view and book available classes." },
    { q: "Is there a free trial?", a: "Yes — 14-day free trial, no credit card required." },
    { q: "Can I use my own domain?", a: "Yes — each gym gets a yourname.thinkauric.com subdomain, with custom domain support." },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Nav */}
            <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                        <Dumbbell size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-white">GymSaaS</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
                    <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
                    <Link href="/signup" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                        Start Free Trial
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-6 py-24 text-center">
                <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400 mb-6">
                    The modern gym management platform
                </span>
                <h1 className="text-5xl font-bold leading-tight mb-6">
                    Run your gym.<br />
                    <span className="text-indigo-400">Not spreadsheets.</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
                    GymSaaS handles member management, class scheduling, QR check-ins, payments, and analytics — all in one platform built for modern fitness businesses.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/signup" className="rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white hover:bg-indigo-500 transition-colors">
                        Start Free Trial
                    </Link>
                    <Link href="#features" className="rounded-xl border border-gray-700 px-8 py-3.5 font-semibold text-gray-300 hover:bg-gray-800 transition-colors">
                        See Features
                    </Link>
                </div>
                <p className="mt-4 text-xs text-gray-600">14-day free trial · No credit card required</p>
            </section>

            {/* Features */}
            <section id="features" className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold mb-3">Everything your gym needs</h2>
                    <p className="text-gray-400">Built for gym owners, managers, trainers, and members.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 mb-4">
                                <f.icon size={20} className="text-indigo-400" />
                            </div>
                            <p className="font-semibold text-white mb-2">{f.title}</p>
                            <p className="text-sm text-gray-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">Loved by gym owners</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                                <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                                <div>
                                    <p className="text-sm font-semibold text-white">{t.name}</p>
                                    <p className="text-xs text-gray-500">{t.gym}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing</h2>
                    <p className="text-gray-400">No hidden fees. Cancel anytime.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {PRICING.map((p) => (
                        <div key={p.name} className={`rounded-2xl border p-8 flex flex-col ${p.popular ? "border-indigo-500 bg-indigo-500/5" : "border-gray-800 bg-gray-900"}`}>
                            {p.popular && (
                                <span className="self-start rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white mb-4">Most Popular</span>
                            )}
                            <p className="text-lg font-bold text-white">{p.name}</p>
                            <div className="flex items-end gap-1 mt-2 mb-6">
                                <span className="text-4xl font-bold text-white">${p.price}</span>
                                <span className="text-gray-400 mb-1">{p.period}</span>
                            </div>
                            <ul className="space-y-3 flex-1 mb-8">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                        <CheckCircle2 size={15} className="text-indigo-400 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/signup"
                                className={`rounded-xl py-3 text-center text-sm font-semibold transition-colors ${p.popular ? "bg-indigo-600 text-white hover:bg-indigo-500" : "border border-gray-700 text-gray-300 hover:bg-gray-800"}`}>
                                {p.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">Frequently asked questions</h2>
                    </div>
                    <div className="space-y-4">
                        {FAQS.map((faq) => (
                            <details key={faq.q} className="group rounded-xl border border-gray-800 bg-gray-950">
                                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-white list-none">
                                    {faq.q}
                                    <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
                                </summary>
                                <p className="px-6 pb-4 text-sm text-gray-400">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-3xl mx-auto px-6 py-24 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to modernize your gym?</h2>
                <p className="text-gray-400 mb-8">Join hundreds of gym owners who switched to GymSaaS.</p>
                <Link href="/signup" className="rounded-xl bg-indigo-600 px-10 py-4 font-semibold text-white hover:bg-indigo-500 transition-colors">
                    Start Your Free Trial
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-600">
                © {new Date().getFullYear()} GymSaaS. All rights reserved.
            </footer>
        </div>
    );
}
