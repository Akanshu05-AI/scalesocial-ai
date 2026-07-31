"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending } = useLogin(setError);

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
