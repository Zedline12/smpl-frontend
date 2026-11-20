"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  AtSign,
  ChevronLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  login,
  requestLoginCode,
  verifyLoginCode,
  type SignInResult,
} from "../actions/auth";
import { GoogleLoginButton } from "./google-login-button";
import { MicrosoftLoginButton } from "./microsoft-login-button";
import { OtpInput } from "./OtpInput";
import { TurnstileWidget } from "./TurnstileWidget";

type Method = "google" | "microsoft" | "email";
/** "create-password": a new account's first password, right after its code. */
type Step = "choose" | "code" | "password" | "create-password";

const MIN_PASSWORD = 8;

const LAST_METHOD_KEY = "auth:last-method";
/** Where a Google / Microsoft sign-in returns to (read by /auth_success). */
export const AUTH_RETURN_KEY = "auth:return";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Readable messages for the errors the backend puts in `?error=`. */
const ERROR_TEXT: Record<string, string> = {
  google_failed: "Google sign-in didn't finish. Please try again.",
  microsoft_failed: "Microsoft sign-in didn't finish. Please try again.",
  microsoft_unavailable:
    "Microsoft sign-in isn't available yet. Use Google or your email.",
  microsoft_no_email:
    "Your Microsoft account has no email address. Use Google or your email.",
};

export function authErrorText(code: string | null | undefined): string | null {
  if (!code) return null;
  return ERROR_TEXT[code] ?? code;
}

const readStorage = (
  store: "local" | "session",
  key: string,
): string | null => {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (
  store: "local" | "session",
  key: string,
  value: string,
) => {
  try {
    (store === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    /* storage blocked */
  }
};

/** "bedomohame…@gmail.com": long names are cut so the row stays one line. */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.length > 10 ? `${local.slice(0, 10)}…` : local}@${domain}`;
}

/** Only same-site paths, so `?next=` can't send people elsewhere. */
function safeNext(value: string | null): string | null {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : null;
}

const noSubscribe = () => () => {};

/**
 * Sign in or sign up, in the modal and on the /sign-in and /sign-up pages:
 * Google, Microsoft, or an email code (with a password as the other way in).
 * A new email gets an account once its code is confirmed.
 */
export function AuthFlow({
  variant,
  mode,
  onSignedIn,
}: {
  variant: "modal" | "page";
  mode: "sign-in" | "sign-up";
  /** The modal closes itself here. */
  onSignedIn?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  // A new widget (and token) for each request: Turnstile tokens work once.
  const [captchaKey, setCaptchaKey] = useState(0);
  // "verify": checking the code; "set-password": saving a new account's password;
  // "avatar": waiting for the new account's avatar after that.
  const [busy, setBusy] = useState<
    Method | "verify" | "set-password" | "avatar" | "resend" | null
  >(null);
  // New account (email code): its first password, and its avatar being made meanwhile.
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarReady, setAvatarReady] = useState(true);
  const avatarJob = useRef<Promise<void> | null>(null);
  const pendingSignIn = useRef<SignInResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The page's ?error= (from a failed Google / Microsoft sign-in) until the user acts.
  const [queryErrorSeen, setQueryErrorSeen] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  // Read on the client only (the server has no storage).
  const lastMethod = useSyncExternalStore(
    noSubscribe,
    () => readStorage("local", LAST_METHOD_KEY),
    () => null,
  );
  const verifiedFor = useRef<string | null>(null);
  const shownError =
    error ??
    (variant === "page" && !queryErrorSeen
      ? authErrorText(searchParams.get("error"))
      : null);
  const clearError = () => {
    setError(null);
    setQueryErrorSeen(true);
  };

  // The "Resend code in 0:22" countdown.
  useEffect(() => {
    if (step !== "code" || now >= resendAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step, now, resendAt]);

  const resetCaptcha = () => {
    setCaptcha(null);
    setCaptchaKey((k) => k + 1);
  };

  const remember = (method: Method) =>
    writeStorage("local", LAST_METHOD_KEY, method);

  const done = (result: SignInResult) => {
    if (!result.ok) {
      setQueryErrorSeen(true);
      setError(result.message);
      return false;
    }
    const next = variant === "page" ? safeNext(searchParams.get("next")) : null;
    if (result.redirectTo || variant === "page") {
      router.replace(result.redirectTo ?? next ?? "/");
    }
    onSignedIn?.();
    // The server layouts read the new session cookie.
    router.refresh();
    void queryClient.invalidateQueries({ queryKey: ["current-user"] });
    return true;
  };

  const social = (provider: "google" | "microsoft") => {
    setBusy(provider);
    remember(provider);
    const back =
      variant === "page"
        ? (safeNext(searchParams.get("next")) ?? "/")
        : `${window.location.pathname}${window.location.search}`;
    writeStorage("session", AUTH_RETURN_KEY, back);
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}/user`,
    );
    const refToken = searchParams.get("refToken");
    if (refToken) url.searchParams.set("refToken", refToken);
    window.location.href = url.toString();
  };

  const sendCode = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!EMAIL_RE.test(email.trim()) || !captcha) return;
    setBusy(step === "code" ? "resend" : "email");
    clearError();
    const result = await requestLoginCode(email.trim().toLowerCase(), captcha);
    setBusy(null);
    resetCaptcha();
    if (!result.ok) {
      setError(result.message);
      return;
    }
    remember("email");
    setCode("");
    verifiedFor.current = null;
    setResendAt(Date.now() + result.resendInSeconds * 1000);
    setNow(Date.now());
    setStep("code");
  };

  const verify = async (value: string) => {
    if (value.length !== 6 || verifiedFor.current === value) return;
    verifiedFor.current = value;
    setBusy("verify");
    clearError();
    const result = await verifyLoginCode(
      email.trim().toLowerCase(),
      value,
      searchParams.get("refToken"),
    );
    setBusy(null);
    // A new account (created now the code is confirmed): start its avatar right away and
    // ask for a password meanwhile. Sign-in finishes after both (createPassword).
    if (result.ok && result.isNewUser) {
      setAvatarReady(false);
      avatarJob.current = fetch("/api/users/me/avatar", { method: "POST" })
        .then(() => undefined)
        // A failed avatar just leaves the account without one; it never blocks sign-up.
        .catch(() => undefined)
        .finally(() => setAvatarReady(true));
      pendingSignIn.current = result;
      setStep("create-password");
      return;
    }
    if (!done(result)) setCode("");
  };

  const passwordTooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD;
  const passwordsDiffer = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canCreatePassword =
    newPassword.length >= MIN_PASSWORD && confirmPassword === newPassword && !busy;

  const createPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!canCreatePassword) return;
    setBusy("set-password");
    clearError();
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    }).catch(() => null);
    if (!res?.ok) {
      const json = await res?.json().catch(() => null);
      setBusy(null);
      setError(typeof json?.message === "string" ? json.message : "Couldn't save your password. Try again.");
      return;
    }
    // Still drawing the avatar: say so and wait for it.
    if (!avatarReady) {
      setBusy("avatar");
      await avatarJob.current;
    }
    setBusy(null);
    if (pendingSignIn.current) done(pendingSignIn.current);
  };

  const signInWithPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!password || !captcha) return;
    setBusy("email");
    clearError();
    const result = await login(
      { email: email.trim().toLowerCase(), password },
      captcha,
    );
    setBusy(null);
    resetCaptcha();
    done(result);
  };

  const back = () => {
    clearError();
    setStep("choose");
  };

  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const emailValid = EMAIL_RE.test(email.trim());

  return (
    <div className="tw-fields flex w-full flex-col">
      {/* No Back once the account exists (create-password). */}
      {step !== "choose" && step !== "create-password" && (
        <button
          type="button"
          onClick={back}
          className={cn(
            "flex w-fit items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white",
            variant === "modal" ? "mb-6" : "mb-10",
          )}
        >
          <ChevronLeft className="size-4" />
          Back
        </button>
      )}

      {step === "choose" && (
        <>
          <h1 className="mb-8 text-center text-[28px] leading-tight font-bold tracking-tight text-white">
            {mode === "sign-in" ? "Welcome back" : "Get started"}
            <span className="mt-1 flex items-center justify-center gap-2">
              {mode === "sign-in" ? "to" : "with"}
              <Image
                src="/logo.png"
                alt="SMPL"
                width={771}
                height={302}
                className="h-8 w-auto"
                priority
              />
            </span>
          </h1>

          {shownError && <ErrorBox text={shownError} />}

          <div className="flex flex-col gap-3">
            <GoogleLoginButton
              onClick={() => social("google")}
              isLoading={busy === "google"}
              lastUsed={lastMethod === "google"}
            />
            <MicrosoftLoginButton
              onClick={() => social("microsoft")}
              isLoading={busy === "microsoft"}
              lastUsed={lastMethod === "microsoft"}
            />
          </div>

          <Divider text="or continue with email" />

          <form onSubmit={sendCode} className="flex flex-col gap-3">
            <label className="relative flex h-12 items-center rounded-xl bg-white/[0.07] focus-within:ring-1 focus-within:ring-white/30">
              <AtSign className="absolute left-4 size-[18px] text-white/45" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (shownError) clearError();
                }}
                placeholder="Email"
                autoComplete="email"
                aria-label="Email"
                className="h-full w-full bg-transparent px-12 text-center text-[15px] text-white outline-none placeholder:text-white/40"
              />
              {lastMethod === "email" && (
                <span className="bg-primary absolute -top-2 -right-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Last used
                </span>
              )}
            </label>
            {emailValid && (
              <>
                <div className="flex justify-center">
                  <TurnstileWidget
                    key={captchaKey}
                    onVerify={setCaptcha}
                    onExpire={() => setCaptcha(null)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!captcha || busy === "email"}
                  className="bg-primary hover:bg-primary/90 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === "email" && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Continue with email
                </button>
              </>
            )}
          </form>

          <Terms className="mt-8" />
        </>
      )}

      {step === "code" && (
        <>
          <h1 className="text-center text-[28px] font-bold tracking-tight text-white">
            Enter the code
          </h1>
          <p className="mt-2 mb-8 text-center text-sm text-white/55">
            We sent a 6-digit code to your email.
          </p>

          {shownError && <ErrorBox text={shownError} />}

          <div
            className={cn(
              busy === "verify" && "pointer-events-none opacity-60",
            )}
          >
            <OtpInput
              value={code}
              onChange={(value) => {
                setCode(value);
                if (shownError) clearError();
                if (value.length === 6) void verify(value);
              }}
            />
          </div>
          {busy === "verify" && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-white/55">
              <Loader2 className="size-4 animate-spin" /> Confirming code…
            </p>
          )}

          <div className="mt-6 flex flex-col items-center gap-3">
            {resendIn > 0 ? (
              <p className="flex items-center gap-1.5 text-sm font-medium text-white/55">
                <RotateCcw className="size-3.5" />
                Resend code in 0:{String(resendIn).padStart(2, "0")}
              </p>
            ) : (
              <>
                <TurnstileWidget
                  key={captchaKey}
                  onVerify={setCaptcha}
                  onExpire={() => setCaptcha(null)}
                />
                <button
                  type="button"
                  onClick={() => void sendCode()}
                  disabled={!captcha || busy === "resend"}
                  className="flex items-center gap-1.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                >
                  {busy === "resend" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="size-3.5" />
                  )}
                  Resend code
                </button>
              </>
            )}
          </div>

          <EmailRow email={email} onEdit={back} className="mt-10" />
          <Divider text="or" />
          <button
            type="button"
            onClick={() => {
              clearError();
              resetCaptcha();
              setStep("password");
            }}
            className="relative flex h-12 w-full items-center justify-center rounded-xl bg-white/[0.07] text-[15px] font-semibold text-white transition-colors hover:bg-white/[0.11]"
          >
            <KeyRound className="absolute left-4 size-[18px] text-white/70" />
            Continue with a password
          </button>
        </>
      )}

      {step === "create-password" && (
        <form onSubmit={createPassword} className="flex flex-col">
          <p className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="size-4" /> Code confirmed
          </p>
          <h1 className="text-center text-[28px] font-bold tracking-tight text-white">
            Create a password
          </h1>
          <p className="mt-2 mb-8 text-center text-sm text-white/55">
            So you can also sign in with your email and password.
          </p>

          {shownError && <ErrorBox text={shownError} />}

          <PasswordField
            value={newPassword}
            onChange={setNewPassword}
            placeholder="New password"
            autoComplete="new-password"
            show={showPassword}
            onToggleShow={() => setShowPassword((s) => !s)}
            autoFocus
          />
          {passwordTooShort && (
            <p className="mt-1.5 px-1 text-xs text-amber-300/90">Use at least {MIN_PASSWORD} characters.</p>
          )}
          <div className="mt-3">
            <PasswordField
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm password"
              autoComplete="new-password"
              show={showPassword}
              onToggleShow={() => setShowPassword((s) => !s)}
            />
          </div>
          {passwordsDiffer && (
            <p className="mt-1.5 px-1 text-xs text-amber-300/90">The passwords don&apos;t match.</p>
          )}

          <button
            type="submit"
            disabled={!canCreatePassword}
            className="bg-primary hover:bg-primary/90 mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(busy === "set-password" || busy === "avatar") && <Loader2 className="size-4 animate-spin" />}
            Continue
          </button>

          {busy === "avatar" && (
            <div className="mt-4 flex flex-col items-center gap-1 text-center" aria-live="polite">
              <p className="flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="size-4 animate-spin" /> Generating your avatar picture…
              </p>
              <p className="text-xs text-white/40">This takes less than 30 seconds.</p>
            </div>
          )}
        </form>
      )}

      {step === "password" && (
        <form onSubmit={signInWithPassword} className="flex flex-col">
          <h1 className="text-center text-[28px] font-bold tracking-tight text-white">
            Enter your password
          </h1>
          <p className="mt-2 mb-8 text-center text-sm text-white/55">
            For accounts that have one.
          </p>

          {shownError && <ErrorBox text={shownError} />}

          <EmailRow email={email} onEdit={back} />
          <label className="relative mt-3 flex h-12 items-center rounded-xl bg-white/[0.07] focus-within:ring-1 focus-within:ring-white/30">
            <KeyRound className="absolute left-4 size-[18px] text-white/45" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Password"
              autoFocus
              className="h-full w-full bg-transparent px-12 text-[15px] text-white outline-none placeholder:text-white/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 flex size-8 items-center justify-center rounded-lg text-white/50 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </label>
          <Link
            href="/forgot-password"
            className="mt-2 self-end text-xs text-white/50 transition-colors hover:text-white"
          >
            Forgot password?
          </Link>
          <div className="mt-4 flex justify-center">
            <TurnstileWidget
              key={captchaKey}
              onVerify={setCaptcha}
              onExpire={() => setCaptcha(null)}
            />
          </div>
          <button
            type="submit"
            disabled={!password || !captcha || busy === "email"}
            className="bg-primary hover:bg-primary/90 mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "email" && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              clearError();
              setStep(resendAt ? "code" : "choose");
            }}
            className="mt-4 text-sm text-white/55 transition-colors hover:text-white"
          >
            Use an email code instead
          </button>
        </form>
      )}
    </div>
  );
}

/** A password input with the key icon and a show/hide toggle. */
function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
  show,
  onToggleShow,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  show: boolean;
  onToggleShow: () => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="relative flex h-12 items-center rounded-xl bg-white/[0.07] focus-within:ring-1 focus-within:ring-white/30">
      <KeyRound className="absolute left-4 size-[18px] text-white/45" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={placeholder}
        autoFocus={autoFocus}
        className="h-full w-full bg-transparent px-12 text-[15px] text-white outline-none placeholder:text-white/40"
      />
      <button
        type="button"
        onClick={onToggleShow}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 flex size-8 items-center justify-center rounded-lg text-white/50 hover:text-white"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </label>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <p
      role="alert"
      className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300"
    >
      {text}
    </p>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-white/45">
      <span className="h-px flex-1 bg-white/10" />
      {text}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function EmailRow({
  email,
  onEdit,
  className,
}: {
  email: string;
  onEdit: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-3 rounded-xl bg-white/[0.07] px-4",
        className,
      )}
    >
      <AtSign className="size-[18px] shrink-0 text-white/45" />
      <span className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold text-white">
        {maskEmail(email)}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-sm font-semibold text-white hover:text-white/70"
      >
        Edit
      </button>
    </div>
  );
}

function Terms({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-center text-xs leading-relaxed text-white/45",
        className,
      )}
    >
      By continuing, you agree to the{" "}
      <Link
        href="https://smplcontent.com/terms"
        className="underline hover:text-white/70"
      >
        Terms of Use
      </Link>
      , acknowledge the{" "}
      <Link
        href="https://smplcontent.com/privacy-policy"
        className="underline hover:text-white/70"
      >
        Privacy Policy
      </Link>{" "}
      and confirm that you are at least 18 years old.
    </p>
  );
}
