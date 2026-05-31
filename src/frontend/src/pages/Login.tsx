import { useSession } from "@/hooks/useSession";
import { generateSalt, hashPassword } from "@/utils/crypto";
import { localLogin, localRegister, resetAccount } from "@/utils/localAuth";
import { validatePassword } from "@/utils/validation";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, User as UserIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { createActor } from "../backend";

/* ─── Star particle generation ───────────────────────────── */
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}
function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));
}

/* ─── Earth SVG Globe ─────────────────────────────────────── */
function EarthGlobe() {
  return (
    <svg
      viewBox="0 0 200 200"
      width="200"
      height="200"
      aria-label="Earth globe"
      role="img"
    >
      <defs>
        <radialGradient id="globe-bg" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#1a6baf" />
          <stop offset="40%" stopColor="#0d4a8a" />
          <stop offset="100%" stopColor="#061a3a" />
        </radialGradient>
        <radialGradient id="globe-glow-inner" cx="40%" cy="30%" r="50%">
          <stop offset="0%" stopColor="rgba(0,212,255,0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <clipPath id="circle-clip">
          <circle cx="100" cy="100" r="92" />
        </clipPath>
        <filter id="globe-shadow">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="12"
            floodColor="#00d4ff"
            floodOpacity="0.5"
          />
        </filter>
      </defs>
      {/* Base sphere */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="url(#globe-bg)"
        filter="url(#globe-shadow)"
      />
      {/* Inner glow highlight */}
      <circle cx="100" cy="100" r="92" fill="url(#globe-glow-inner)" />
      {/* Grid lines (latitude) */}
      <g
        clipPath="url(#circle-clip)"
        stroke="rgba(0,212,255,0.2)"
        strokeWidth="0.8"
        fill="none"
      >
        <ellipse cx="100" cy="100" rx="92" ry="20" />
        <ellipse cx="100" cy="100" rx="92" ry="46" />
        <ellipse cx="100" cy="100" rx="92" ry="68" />
        <ellipse cx="100" cy="100" rx="92" ry="84" />
        {/* Meridians */}
        <ellipse cx="100" cy="100" rx="20" ry="92" />
        <ellipse cx="100" cy="100" rx="46" ry="92" />
        <ellipse cx="100" cy="100" rx="68" ry="92" />
        <ellipse cx="100" cy="100" rx="84" ry="92" />
      </g>
      {/* Continent shapes (stylized) */}
      <g clipPath="url(#circle-clip)" fill="rgba(0,212,255,0.35)" opacity="0.9">
        {/* North America */}
        <path d="M40 55 Q50 42 68 45 Q78 48 82 60 Q85 72 78 80 Q70 88 58 85 Q44 78 38 68 Z" />
        {/* South America */}
        <path d="M58 95 Q68 90 76 96 Q82 105 78 122 Q74 138 65 140 Q54 138 50 125 Q47 110 52 100 Z" />
        {/* Europe */}
        <path d="M100 48 Q112 44 118 50 Q124 58 120 66 Q114 72 106 70 Q98 65 96 56 Z" />
        {/* Africa */}
        <path d="M104 78 Q116 76 122 86 Q128 98 124 116 Q118 132 108 134 Q98 132 95 118 Q92 102 96 88 Z" />
        {/* Asia */}
        <path d="M118 44 Q138 38 152 46 Q166 56 164 72 Q160 86 148 88 Q132 88 122 78 Q114 68 116 56 Z" />
        {/* Australia */}
        <path d="M148 110 Q160 106 168 114 Q174 124 170 134 Q164 142 154 140 Q144 136 142 126 Q140 116 146 112 Z" />
      </g>
      {/* Atmosphere rim */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="rgba(0,212,255,0.4)"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="100"
        r="96"
        fill="none"
        stroke="rgba(0,212,255,0.15)"
        strokeWidth="2"
      />
    </svg>
  );
}

/* ─── Airplane SVG ────────────────────────────────────────── */
function AirplaneSVG() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="airplane"
      role="img"
    >
      <path
        d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
        fill="#00d4ff"
      />
    </svg>
  );
}

type TabMode = "login" | "signup";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useSession();
  // actor may be null when canister ID is unavailable — local auth is the primary path
  const { actor, isFetching } = useActor(createActor);

  const [tab, setTab] = useState<TabMode>("login");
  const [panelOpen, setPanelOpen] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Stars — generated once
  const stars = useMemo(() => generateStars(70), []);

  // Orbit animation via CSS — we use a wrapper ref for the orbit path
  const orbitRef = useRef<HTMLDivElement>(null);

  function openPanel(mode: TabMode) {
    setTab(mode);
    setPanelOpen(true);
    setLoginError("");
    setLoginErrors({});
    setSignupErrors({});
    setSignupError("");
    setShowResetOption(false);
  }

  function switchTab(mode: TabMode) {
    setTab(mode);
    setLoginError("");
    setLoginErrors({});
    setSignupErrors({});
    setSignupError("");
    setShowResetOption(false);
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ─── Login handler — local-first, actor as fallback ──────── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!EMAIL_RE.test(loginEmail)) errs.email = "Enter a valid email address";
    if (!loginPassword) errs.password = "Password is required";
    if (Object.keys(errs).length > 0) {
      setLoginErrors(errs);
      setLoginError("");
      return;
    }
    setLoginErrors({});
    setLoginError("");
    setLoginLoading(true);

    try {
      // PRIMARY PATH: try local auth first — always works offline
      const localResult = await localLogin(loginEmail, loginPassword);

      if ("ok" in localResult) {
        // Local auth succeeded
        const { userId, name, email } = localResult.ok;
        login(userId, name, email);
        navigate({ to: "/" });
        return;
      }

      // Local auth failed — check if actor is available as a fallback
      // (handles users registered from a different device/session via backend)
      if (actor && !isFetching) {
        try {
          // Get salt from backend — use (salt, password) canonical order
          const salt = await actor.getUserSalt(loginEmail.trim().toLowerCase());
          if (salt) {
            const hashed = await hashPassword(salt, loginPassword);
            const result = await actor.loginUser(
              loginEmail.trim().toLowerCase(),
              hashed,
            );
            if ("ok" in result && result.ok) {
              const { userId, name, email } = result.ok as {
                userId: string;
                name: string;
                email: string;
              };
              login(String(userId), name, email);
              navigate({ to: "/" });
              return;
            }
          }
        } catch {
          // Actor fallback failed — fall through to show error
        }
      }

      // Both paths failed — detect hash-mismatch to show recovery option
      if (localResult.err === "__HASH_MISMATCH__") {
        setLoginError(
          "Incorrect password. If you registered before a recent update, your account may need to be reset.",
        );
        setShowResetOption(true);
      } else {
        setLoginError(localResult.err);
        setShowResetOption(false);
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  /* ─── Signup handler — local-first, actor as fire-and-forget sync ── */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (signupName.trim().length < 2)
      errors.name = "Name must be at least 2 characters";
    if (!EMAIL_RE.test(signupEmail))
      errors.email = "Enter a valid email address";

    // Password strength validation — show all unmet rules at once
    const pwIssues = validatePassword(signupPassword);
    if (pwIssues.length > 0) {
      errors.password = pwIssues.join(". ");
    }
    if (signupConfirm !== signupPassword)
      errors.confirm = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }
    setSignupErrors({});
    setSignupError("");
    setSignupLoading(true);

    try {
      // PRIMARY PATH: register locally first — always works offline
      const localResult = await localRegister(
        signupName,
        signupEmail,
        signupPassword,
      );

      if ("err" in localResult) {
        // Specific error: email taken, password too weak, etc.
        if (localResult.err.includes("already registered")) {
          setSignupErrors({ email: localResult.err });
        } else if (
          localResult.err.includes("uppercase") ||
          localResult.err.includes("character") ||
          localResult.err.includes("digit") ||
          localResult.err.includes("symbol")
        ) {
          setSignupErrors({ password: localResult.err });
        } else {
          setSignupError(localResult.err);
        }
        return;
      }

      // Local registration succeeded — auto-login immediately
      const userId = localResult.ok;
      login(userId, signupName.trim(), signupEmail.trim().toLowerCase());

      // SECONDARY PATH (fire-and-forget): sync to backend actor if available
      // This does NOT block the UI or affect the user experience
      if (actor && !isFetching) {
        (async () => {
          try {
            const salt = generateSalt();
            // Use canonical (salt, password) order
            const hashedPassword = await hashPassword(salt, signupPassword);
            await actor.registerUser(
              signupName.trim(),
              signupEmail.trim().toLowerCase(),
              hashedPassword,
              salt,
            );
          } catch {
            // Silently ignore — local auth is the source of truth
          }
        })();
      }

      navigate({ to: "/" });
    } catch {
      setSignupError("Registration failed. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  }

  // Password strength indicator (based on validatePassword rules)
  const pwRulesUnmet =
    signupPassword.length > 0 ? validatePassword(signupPassword) : null;
  const pwStrength =
    pwRulesUnmet === null
      ? null
      : pwRulesUnmet.length === 0
        ? "strong"
        : pwRulesUnmet.length <= 2
          ? "medium"
          : "weak";

  return (
    <>
      {/* ─── Inline keyframes ─────────────────────────────── */}
      <style>{`
        @keyframes orbit {
          0%   { transform: rotate(0deg)   translateX(var(--orbit-r)) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
        }
        @keyframes globe-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes globe-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(0,212,255,0.55)) drop-shadow(0 0 40px rgba(0,150,255,0.3)); }
          50%       { filter: drop-shadow(0 0 32px rgba(0,212,255,0.85)) drop-shadow(0 0 60px rgba(0,150,255,0.5)); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.9; }
        }
        .globe-glow {
          animation: globe-glow-pulse 3s ease-in-out infinite;
        }
        .orbit-wrapper {
          position: absolute;
          top: 50%; left: 50%;
          width: 0; height: 0;
          --orbit-r: 120px;
          animation: orbit 4s linear infinite;
        }
        .orbit-wrapper-sm {
          --orbit-r: 85px;
        }
        .orbit-icon {
          position: absolute;
          top: -11px; left: -11px;
          transform: rotate(45deg);
        }
      `}</style>

      {/* ─── Full-screen container ────────────────────────── */}
      <div
        className="fixed inset-0 overflow-hidden flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at center, #0d1b2a 0%, #0a0e1a 100%)",
        }}
      >
        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {stars.map((s) => (
            <div
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* ─── Globe + CTA wrapper ──────────────────────── */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={panelOpen ? { x: "-30%" } : { x: "0%" }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {/* Globe entrance */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
            {/* Outer glow rings */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 280,
                height: 280,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background:
                  "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 340,
                height: 340,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background:
                  "radial-gradient(circle, rgba(0,150,255,0.05) 0%, transparent 70%)",
              }}
            />

            {/* Globe SVG with glow + slow grid rotation */}
            <div
              className="relative globe-glow"
              style={{ width: 200, height: 200 }}
            >
              <EarthGlobe />
              {/* Orbiting airplane */}
              <div ref={orbitRef} className="orbit-wrapper" aria-hidden>
                <div className="orbit-icon">
                  <AirplaneSVG />
                </div>
              </div>
            </div>

            {/* Brand name below globe */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  color: "#ffffff",
                  textTransform: "uppercase",
                }}
              >
                Wander<span style={{ color: "#00d4ff" }}>Assist</span>
              </h1>
              <p
                style={{
                  color: "rgba(0,212,255,0.6)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                Travel Smart · Travel Safe
              </p>
            </motion.div>

            {/* CTA buttons — visible only when panel is closed */}
            <AnimatePresence>
              {!panelOpen && (
                <motion.div
                  className="flex gap-4 mt-8"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <button
                    type="button"
                    onClick={() => openPanel("login")}
                    className="px-7 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      background:
                        "linear-gradient(135deg, #0080cc 0%, #00d4ff 100%)",
                      boxShadow: "0 0 20px rgba(0,212,255,0.4)",
                    }}
                    data-ocid="login-open-panel"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => openPanel("signup")}
                    className="px-7 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(0,212,255,0.4)",
                      color: "#00d4ff",
                    }}
                    data-ocid="register-open-panel"
                  >
                    Register
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* ─── Glassmorphism Panel ──────────────────────── */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              key="auth-panel"
              className="absolute right-0 top-0 bottom-0 flex items-center"
              style={{ width: "min(420px, 100vw)", padding: "1.5rem" }}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="w-full rounded-2xl p-7 relative"
                style={{
                  background: "rgba(10,20,40,0.6)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
                data-ocid="auth-panel"
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  aria-label="Close panel"
                  data-ocid="auth-panel.close_button"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* Globe icon small */}
                <div className="flex justify-center mb-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(0,212,255,0.1)",
                      border: "1px solid rgba(0,212,255,0.3)",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 200 200"
                      aria-hidden="true"
                    >
                      <circle cx="100" cy="100" r="92" fill="#0d4a8a" />
                      <ellipse
                        cx="100"
                        cy="100"
                        rx="92"
                        ry="40"
                        stroke="rgba(0,212,255,0.4)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <ellipse
                        cx="100"
                        cy="100"
                        rx="46"
                        ry="92"
                        stroke="rgba(0,212,255,0.3)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="92"
                        fill="none"
                        stroke="rgba(0,212,255,0.5)"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                {/* Tabs */}
                <div
                  className="flex mb-6 relative"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {(["login", "signup"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => switchTab(t)}
                      className="flex-1 pb-3 text-sm font-bold tracking-wide transition-all relative"
                      style={{
                        color: tab === t ? "#00d4ff" : "rgba(255,255,255,0.35)",
                        background: "none",
                        border: "none",
                      }}
                      data-ocid={`auth.${t}.tab`}
                    >
                      {t === "login" ? "Login" : "Register"}
                      {tab === t && (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg, #0080cc, #00d4ff)",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Form area */}
                <AnimatePresence mode="wait">
                  {tab === "login" ? (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.22 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                      noValidate
                    >
                      {/* Email */}
                      <GlassField
                        id="login-email"
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(v) => {
                          setLoginEmail(v);
                          setLoginErrors((p) => ({ ...p, email: "" }));
                        }}
                        error={loginErrors.email}
                        icon={<Mail className="w-4 h-4" />}
                        autoComplete="email"
                        ocid="login.email.input"
                        errorOcid="login.email.field_error"
                      />
                      {/* Password */}
                      <GlassField
                        id="login-password"
                        label="Password"
                        type={showLoginPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(v) => {
                          setLoginPassword(v);
                          setLoginErrors((p) => ({ ...p, password: "" }));
                        }}
                        error={loginErrors.password}
                        icon={<Lock className="w-4 h-4" />}
                        autoComplete="current-password"
                        ocid="login.password.input"
                        errorOcid="login.password.field_error"
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowLoginPass(!showLoginPass)}
                            className="transition-colors"
                            style={{ color: "rgba(255,255,255,0.35)" }}
                            aria-label={
                              showLoginPass ? "Hide password" : "Show password"
                            }
                          >
                            {showLoginPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        }
                      />

                      {/* General error */}
                      <AnimatePresence>
                        {loginError && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-3 py-2 rounded-lg space-y-1.5"
                            style={{
                              background: "rgba(239,68,68,0.15)",
                              border: "1px solid rgba(239,68,68,0.3)",
                            }}
                            data-ocid="login.error_state"
                          >
                            <p className="text-xs" style={{ color: "#f87171" }}>
                              {loginError}
                            </p>
                            {showResetOption && (
                              <p
                                className="text-xs"
                                style={{ color: "rgba(255,255,255,0.5)" }}
                              >
                                If you just registered, please{" "}
                                <button
                                  type="button"
                                  onClick={() => {
                                    resetAccount(loginEmail);
                                    setLoginError("");
                                    setShowResetOption(false);
                                    setLoginPassword("");
                                    switchTab("signup");
                                  }}
                                  className="font-bold underline cursor-pointer"
                                  style={{ color: "#00d4ff" }}
                                  data-ocid="login.reset_account_button"
                                >
                                  reset your account
                                </button>{" "}
                                and register again — your email is preserved.
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <GlowButton
                        type="submit"
                        ocid="login.submit_button"
                        loading={loginLoading}
                      >
                        {loginLoading ? "Signing in…" : "Login"}
                      </GlowButton>

                      {/* Switch link */}
                      <p
                        className="text-center text-xs"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchTab("signup")}
                          className="font-bold hover:underline"
                          style={{ color: "#00d4ff" }}
                          data-ocid="login.switch_to_register"
                        >
                          Register
                        </button>
                      </p>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.22 }}
                      onSubmit={handleSignup}
                      className="space-y-3"
                      noValidate
                    >
                      {/* Name */}
                      <GlassField
                        id="signup-name"
                        label="Full Name"
                        type="text"
                        placeholder="Priya Sharma"
                        value={signupName}
                        onChange={(v) => {
                          setSignupName(v);
                          setSignupErrors((p) => ({ ...p, name: "" }));
                        }}
                        error={signupErrors.name}
                        icon={<UserIcon className="w-4 h-4" />}
                        autoComplete="name"
                        ocid="signup.name.input"
                        errorOcid="signup.name.field_error"
                      />
                      {/* Email */}
                      <GlassField
                        id="signup-email"
                        label="Email"
                        type="email"
                        placeholder="priya@example.com"
                        value={signupEmail}
                        onChange={(v) => {
                          setSignupEmail(v);
                          setSignupErrors((p) => ({ ...p, email: "" }));
                        }}
                        error={signupErrors.email}
                        icon={<Mail className="w-4 h-4" />}
                        autoComplete="email"
                        ocid="signup.email.input"
                        errorOcid="signup.email.field_error"
                      />
                      {/* Password */}
                      <GlassField
                        id="signup-password"
                        label="Password"
                        type={showSignupPass ? "text" : "password"}
                        placeholder="Min. 8 chars, uppercase, symbol, digit"
                        value={signupPassword}
                        onChange={(v) => {
                          setSignupPassword(v);
                          setSignupErrors((p) => ({ ...p, password: "" }));
                        }}
                        error={signupErrors.password}
                        icon={<Lock className="w-4 h-4" />}
                        autoComplete="new-password"
                        ocid="signup.password.input"
                        errorOcid="signup.password.field_error"
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowSignupPass(!showSignupPass)}
                            className="transition-colors"
                            style={{ color: "rgba(255,255,255,0.35)" }}
                            aria-label={
                              showSignupPass ? "Hide password" : "Show password"
                            }
                          >
                            {showSignupPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        }
                        below={
                          pwStrength && (
                            <div className="flex gap-1 mt-1">
                              {["weak", "medium", "strong"].map((level, i) => (
                                <div
                                  key={level}
                                  className="h-1 flex-1 rounded-full transition-all"
                                  style={{
                                    background:
                                      i <
                                      (pwStrength === "weak"
                                        ? 1
                                        : pwStrength === "medium"
                                          ? 2
                                          : 3)
                                        ? pwStrength === "strong"
                                          ? "#22c55e"
                                          : pwStrength === "medium"
                                            ? "#f59e0b"
                                            : "#ef4444"
                                        : "rgba(255,255,255,0.12)",
                                  }}
                                />
                              ))}
                            </div>
                          )
                        }
                      />
                      {/* Confirm */}
                      <GlassField
                        id="signup-confirm"
                        label="Confirm Password"
                        type="password"
                        placeholder="Repeat your password"
                        value={signupConfirm}
                        onChange={(v) => {
                          setSignupConfirm(v);
                          setSignupErrors((p) => ({ ...p, confirm: "" }));
                        }}
                        error={signupErrors.confirm}
                        icon={<Lock className="w-4 h-4" />}
                        autoComplete="new-password"
                        ocid="signup.confirm.input"
                        errorOcid="signup.confirm.field_error"
                      />

                      {/* General signup error */}
                      <AnimatePresence>
                        {signupError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs px-3 py-2 rounded-lg"
                            style={{
                              background: "rgba(239,68,68,0.15)",
                              color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.3)",
                            }}
                            data-ocid="signup.error_state"
                          >
                            {signupError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <GlowButton
                        type="submit"
                        ocid="signup.submit_button"
                        loading={signupLoading}
                      >
                        {signupLoading ? "Creating account…" : "Create Account"}
                      </GlowButton>

                      <p
                        className="text-center text-xs"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchTab("login")}
                          className="font-bold hover:underline"
                          style={{ color: "#00d4ff" }}
                          data-ocid="signup.switch_to_login"
                        >
                          Login
                        </button>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─── Reusable glass input field ──────────────────────────── */
interface GlassFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  below?: React.ReactNode;
  autoComplete?: string;
  ocid: string;
  errorOcid: string;
}

function GlassField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  icon,
  suffix,
  below,
  autoComplete,
  ocid,
  errorOcid,
}: GlassFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-widest block"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <span
            className="absolute left-3 pointer-events-none"
            style={{ color: error ? "#f87171" : "rgba(0,212,255,0.5)" }}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full h-11 rounded-xl text-sm outline-none transition-all"
          style={{
            paddingLeft: icon ? "2.5rem" : "1rem",
            paddingRight: suffix ? "2.8rem" : "1rem",
            background: "rgba(255,255,255,0.07)",
            border: `1px solid ${error ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.14)"}`,
            color: "#ffffff",
            caretColor: "#00d4ff",
          }}
          onFocus={(e) => {
            e.target.style.border = `1px solid ${error ? "rgba(248,113,113,0.8)" : "rgba(0,212,255,0.6)"}`;
            e.target.style.boxShadow = error
              ? "0 0 0 3px rgba(248,113,113,0.1)"
              : "0 0 0 3px rgba(0,212,255,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.border = `1px solid ${error ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.14)"}`;
            e.target.style.boxShadow = "none";
          }}
          data-ocid={ocid}
        />
        {suffix && <span className="absolute right-3">{suffix}</span>}
      </div>
      {below}
      {error && (
        <p
          className="text-xs mt-0.5"
          style={{ color: "#f87171" }}
          data-ocid={errorOcid}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Glow submit button ──────────────────────────────────── */
function GlowButton({
  children,
  type,
  ocid,
  loading,
}: {
  children: React.ReactNode;
  type?: "submit" | "button";
  ocid: string;
  loading?: boolean;
}) {
  return (
    <button
      type={type ?? "button"}
      disabled={loading}
      className="w-full h-11 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      style={{
        background: "linear-gradient(135deg, #0080cc 0%, #00d4ff 100%)",
        boxShadow: "0 0 24px rgba(0,212,255,0.35), 0 4px 12px rgba(0,0,0,0.3)",
        marginTop: "0.25rem",
      }}
      data-ocid={ocid}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
