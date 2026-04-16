"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  gymName: string;
  role: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors extends Partial<FormState> {}

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    gymName: "",
    role: "ADMIN",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.gymName.trim()) e.gymName = "Required";
    if (!form.password) e.password = "Required";
    else if (form.password.length < 8) e.password = "Min 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Required";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Something went wrong.");
        return;
      }
      login(json.data.token, json.data.user, json.data.tenant);
      router.push("/dashboard");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
      error: errors[key],
    };
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-indigo-400">GymSaaS</span>
          <p className="mt-1 text-sm text-gray-400">Create your gym account</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                {...field("firstName")}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                {...field("lastName")}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              {...field("email")}
            />
            <Input
              label="Gym Name"
              placeholder="Iron Fitness"
              {...field("gymName")}
            />

            {/* Role */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">Role</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none transition hover:border-gray-600 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ADMIN">Admin — Full access</option>
                <option value="MANAGER">Manager — No invites</option>
                <option value="TRAINER">Trainer — Calendar & settings</option>
                <option value="MEMBER">Member — Limited access</option>
              </select>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none transition hover:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none transition hover:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" loading={loading} className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
