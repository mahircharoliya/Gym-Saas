import Link from "next/link";
import { Dumbbell, CheckCircle2, QrCode, CalendarDays, BarChart3, Users, Shield, ChevronDown, ArrowRight, Zap } from "lucide-react";

const FEATURES = [
    { icon: Users, title: "Member Management", desc: "Full CRUD, CSV import, role-based access, and member profiles.", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: CalendarDays, title: "Class Scheduling", desc: "Recurring classes, trainer assignment, and member booking.", color: "text-violet-600", bg: "bg-violet-50" },
    { icon: QrCode, title: "QR Check-In", desc: "Scan member QR codes or use manual search for fast check-ins.", color: "text-sky-600", bg: "bg-sky-50" },
    { icon: BarChart3, title: "Analytics", desc: "MRR, ARR, churn rate, member growth, and check-in trends.", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Shield, title: "Waivers & Forms", desc: "Custom signup forms with legal waivers and Authorize.net payments.", color: "text-amber-600", bg: "bg-amber-50" },
    { icon: Dumbbell, title: "Multi-Tenant SaaS", desc: "Each gym gets their own subdomain, data, and branding.", color: "text-rose-600", bg: "bg-rose-50" },
];

const PRICING = [
    { name: "Starter", price: "49", period: "/mo", features: ["Up to 100 members", "1 location", "QR check-in", "Basic analytics"], cta: "Get Started" },
    { name: "Growth", price: "99", period: "/mo", features: ["Up to 500 members", "3 locations", "Class scheduling", "Email/SMS reminders", "Custom domain"], cta: "Get Started", popular: true },
    { name: "Pro", price: "199", period: "/mo", features: ["Unlimited members", "Unlimited locations", "Full analytics", "Priority support", "API access"], cta: "Contact Sales" },
];

const TESTIMONIALS = [
    { name: "Sarah M.", gym: "Iron Fitness", quote: "GymSaaS cut our admin time in half. The QR check-in alone is worth it.", initials: "SM" },
    { name: "James T.", gym: "Peak Performance", quote: "Our members love the self-service portal. Cancellations and billing are seamless.", initials: "JT" },
    { name: "Lisa K.", gym: "Flex Studio", quote: "Setup took 20 minutes. We were taking payments the same day.", initials: "LK" },
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
        <div className="min-h-screen bg-white text-black">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
                            <Dumbbell size={15} className="text-black" />
                        </div>
                        <span className="font-bold text-black tracking-tight">GymSaaS</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="#features" className="hidden sm:block text-sm text-slate-500 hover:text-black transition-colors">Features</Link>
                        <Link href="#pricing" className="hidden sm:block text-sm text-slate-500 hover:text-black transition-colors">Pricing</Link>
                        <Link href="/login" className="text-sm text-slate-500 hover:text-black transition-colors">Sign In</Link>
                        <Link href="/signup" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95">
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-100/60 blur-[120px] rounded-full" />
                </div>
                <div className="mx-auto max-w-4xl px-6 py-28 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-600 mb-8">
                        <Zap size={11} className="fill-blue-500" />
                        The modern gym management platform
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight text-black mb-6">
                        Run your gym.<br />
                        <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                            Not spreadsheets.
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        GymSaaS handles member management, class scheduling, QR check-ins, payments, and analytics — all in one platform built for modern fitness businesses.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-semibold text-black shadow-xl shadow-blue-500/25 hover:bg-blue-500 transition-all active:scale-95">
                            Start Free Trial <ArrowRight size={16} />
                        </Link>
                        <Link href="#features" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                            See Features
                        </Link>
                    </div>
                    <p className="mt-5 text-xs text-slate-400">14-day free trial · No credit card required · Cancel anytime</p>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="mx-auto max-w-6xl px-6 py-24">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Features</p>
                    <h2 className="text-3xl font-bold text-black mb-3">Everything your gym needs</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">Built for gym owners, managers, trainers, and members.</p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="card-premium">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.bg} mb-5`}>
                                <f.icon size={20} className={f.color} />
                            </div>
                            <p className="font-semibold text-black mb-2">{f.title}</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="border-y border-slate-100 bg-slate-50 py-24">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Testimonials</p>
                        <h2 className="text-3xl font-bold text-black">Loved by gym owners</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className="card-premium">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-amber-400 text-sm">★</span>
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-black shrink-0">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black">{t.name}</p>
                                        <p className="text-xs text-slate-400">{t.gym}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Pricing</p>
                    <h2 className="text-3xl font-bold text-black mb-3">Simple, transparent pricing</h2>
                    <p className="text-slate-500">No hidden fees. Cancel anytime.</p>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {PRICING.map((p) => (
                        <div key={p.name} className={`relative rounded-[2rem] border p-8 flex flex-col transition-all duration-300 ${p.popular
                                ? "border-blue-200 bg-gradient-to-b from-blue-50/50 to-white shadow-2xl shadow-blue-100 -translate-y-2"
                                : "border-slate-100 bg-white shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:shadow-xl"
                            }`}>
                            {p.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1 text-xs font-semibold text-black shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <p className="text-base font-bold text-black">{p.name}</p>
                            <div className="flex items-end gap-1 mt-3 mb-7">
                                <span className="text-4xl font-bold text-black">${p.price}</span>
                                <span className="text-slate-400 mb-1 text-sm">{p.period}</span>
                            </div>
                            <ul className="space-y-3 flex-1 mb-8">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                                        <CheckCircle2 size={14} className="text-blue-500 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/signup"
                                className={`rounded-xl py-3 text-center text-sm font-semibold transition-all active:scale-95 ${p.popular
                                        ? "bg-blue-600 text-black shadow-lg shadow-blue-500/20 hover:bg-blue-500"
                                        : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                    }`}>
                                {p.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="border-t border-slate-100 bg-slate-50 py-24">
                <div className="mx-auto max-w-3xl px-6">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">FAQ</p>
                        <h2 className="text-3xl font-bold text-black">Frequently asked questions</h2>
                    </div>
                    <div className="space-y-3">
                        {FAQS.map((faq) => (
                            <details key={faq.q} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
                                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-black list-none">
                                    {faq.q}
                                    <ChevronDown size={15} className="text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-4" />
                                </summary>
                                <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden py-28 bg-gradient-to-b from-white to-slate-50">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-100/60 blur-[100px] rounded-full" />
                </div>
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-4xl font-bold text-black mb-4">Ready to modernize your gym?</h2>
                    <p className="text-slate-500 mb-10 text-lg">Join hundreds of gym owners who switched to GymSaaS.</p>
                    <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-4 font-semibold text-black shadow-xl shadow-blue-500/25 hover:bg-blue-500 transition-all active:scale-95">
                        Start Your Free Trial <ArrowRight size={16} />
                    </Link>
                    <p className="mt-4 text-xs text-slate-400">No credit card required · 14-day free trial</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-8 bg-white">
                <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                            <Dumbbell size={11} className="text-black" />
                        </div>
                        <span className="text-sm font-semibold text-slate-500">GymSaaS</span>
                    </div>
                    <p className="text-xs text-slate-400">© {new Date().getFullYear()} GymSaaS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

