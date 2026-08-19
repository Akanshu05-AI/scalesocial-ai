"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending } = useLogin(setError);

  const handleDemoLogin = () => {
    document.cookie = "logged_in=true; path=/; max-age=86400";
    setSession({
      id: "00000000-0000-0000-0000-000000000000",
      email: "demo@scalesocial.ai",
      fullName: "Demo User",
      avatarUrl: null,
    });
    router.push("/overview");
  };

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-4">
      <h1 className="font-display text-xl font-medium text-ink">Sign in</h1>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Email</label>
        <Input type="email" placeholder="you@company.com" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-rose">{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Password</label>
        <Input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="mt-1 text-xs text-rose">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">Or explore the app</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full text-sm font-medium border-emerald-500 text-emerald-700 hover:bg-emerald-50"
        onClick={handleDemoLogin}
      >
        ⚡ Continue as Demo User (Bypass Sign-In)
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
