"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, User, Award, ArrowRight } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();

    const roles = [
        {
            id: "owner",
            title: "Create Your Gym",
            description: "Start your own gym and manage everything from one place",
            icon: Dumbbell,
            color: "from-blue-600 to-cyan-600",
            hoverColor: "hover:border-blue-500",
            path: "/signup/owner",
            features: [
                "Create your gym brand",
                "Manage members & trainers",
                "Full admin control",
                "Analytics & reporting"
            ]
        },
        {
            id: "member",
            title: "Join as Member",
            description: "Book classes, track progress, and achieve your fitness goals",
            icon: User,
            color: "from-emerald-600 to-teal-600",
            hoverColor: "hover:border-emerald-500",
            path: "/signup/member",
            features: [
                "Book unlimited classes",
                "Track your attendance",
                "Manage membership",
                "Connect with trainers"
            ]
        },
        {
            id: "trainer",
            title: "Join as Trainer",
            description: "Lead classes, manage schedules, and inspire members",
            icon: Award,
            color: "from-violet-600 to-indigo-600",
            hoverColor: "hover:border-violet-500",
            path: "/signup/trainer",
            features: [
                "Create & manage classes",
                "Track member progress",
                "Schedule sessions",
                "Build your reputation"
            ]
        }
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 mb-4 shadow-lg">
                            <Dumbbell size={24} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-3">
                            Welcome to GymSaaS
                        </h1>
                        <p className="text-lg text-slate-600">
                            Choose how you want to join
                        </p>
                    </div>

                    {/* Role Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => router.push(role.path)}
                                    className={`group relative rounded-2xl border-2 border-slate-200 bg-white p-8 text-left transition-all hover:shadow-xl hover:-translate-y-1 ${role.hoverColor}`}
                                >
                                    {/* Icon */}
                                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${role.color} mb-6 shadow-lg`}>
                                        <Icon size={28} className="text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                        {role.title}
                                    </h3>
                                    <p className="text-slate-600 mb-6">
                                        {role.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-2 mb-6">
                                        {role.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Arrow */}
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900 group-hover:gap-3 transition-all">
                                        Get Started
                                        <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="text-center space-y-4">
                        <p className="text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                        <p className="text-xs text-slate-400">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
