"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Field, PasswordField } from "./fields";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validation";
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path[0], i.message]),
        ),
      );
      return;
    }
    setBusy(true);
    try {
      const response = await authClient.signIn.email(parsed.data);
      if (response.error)
        throw new Error(
          response.error.message || "Check your email and password.",
        );
      toast.success("Welcome back.");
      router.push(
        new URLSearchParams(window.location.search).get("next") === "/admin"
          ? "/admin"
          : "/careers",
      );
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not sign in. Try again.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="eyebrow">YOUR APPLICANT PORTAL</div>
      <h2>Welcome back.</h2>
      <p className="panel-intro">
        New here? <Link href="/signup">Create your profile</Link>
      </p>
      <form onSubmit={submit} className="form-stack" noValidate>
        <Field
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <PasswordField
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        {errors.form ? (
          <div className="error-box" role="alert">
            {errors.form}
          </div>
        ) : null}
        <button type="submit" className="button accent w-full" disabled={busy}>
          {busy ? (
            <>
              <LoaderCircle size={17} className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Log in <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">
        Need help accessing your account?{" "}
        <a className="underline" href="https://acesintelligence.xyz/inquiry">
          Contact ACES
        </a>
      </p>
    </>
  );
}
