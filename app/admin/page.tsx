"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BarChart2, Eye, ArrowLeft, Mail, Loader2, ShieldCheck, RefreshCw,
  Settings, Layers, Briefcase, FolderOpen, LogOut, Plus, Trash2,
  Save, X, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, ImagePlus,
  Lock, KeyRound, MapPin, Monitor, UserPlus, ExternalLink,
  Award, FileText, UserCircle, Check, Trophy, MessageSquare,
  HardDrive, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import type { Skill, SkillGroup, ExperienceItem, Project, Certification, Profile, AwardItem, Testimonial, Settings as SettingsType } from "@/lib/content";
import { DEFAULT_PROFILE, asEducation, PALETTES } from "@/lib/content";
import { applyPalette } from "@/components/PaletteProvider";
import { PDFDocument } from "pdf-lib";
import type { VisitorRecord } from "@/lib/visitor";
import type { Lead } from "@/lib/lead";

// ─── OTP input boxes ─────────────────────────────────────────────────────────

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const update = (i: number, char: string) => {
    if (!/^[0-9]?$/.test(char)) return;
    const next = [...value]; next[i] = char; onChange(next);
    if (char && i < 5) refs.current[i + 1]?.focus();
  };
  const onKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (d.length === 6) { onChange(d.split("")); refs.current[5]?.focus(); }
  };
  return (
    <div className="flex gap-2.5" onPaste={onPaste}>
      {value.map((digit, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => update(i, e.target.value)} onKeyDown={e => onKeyDown(i, e)}
          onFocus={e => e.target.select()}
          className="w-11 h-12 text-center text-xl font-bold rounded-lg border bg-[var(--surface-2)] focus:outline-none transition-colors"
          style={{ borderColor: digit ? "var(--accent)" : "var(--border)", color: "var(--foreground)" }}
        />
      ))}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(date: string) {
  const [, m, d] = date.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${parseInt(d)}`;
}

function relTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Icon uploader ────────────────────────────────────────────────────────────

function IconUploader({
  currentUrl,
  onUpload,
  uploadFn,
}: {
  currentUrl?: string;
  onUpload: (url: string) => void;
  uploadFn: (file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFn(file);
      onUpload(url);
    } catch { /* silent */ }
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="icon" className="w-8 h-8 rounded object-contain border border-[var(--border)]" />
      ) : (
        <div className="w-8 h-8 rounded border border-dashed border-[var(--border)] flex items-center justify-center">
          <ImagePlus size={13} style={{ color: "var(--muted)" }} />
        </div>
      )}
      <button onClick={() => inputRef.current?.click()} disabled={uploading}
        className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50"
        style={{ color: "var(--muted)" }}>
        {uploading ? <Loader2 size={11} className="animate-spin inline" /> : "Upload"}
      </button>
      {currentUrl && (
        <button onClick={() => onUpload("")} className="text-xs text-red-400 hover:text-red-500 cursor-pointer transition-colors">
          <X size={12} />
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

function card(children: React.ReactNode, className = "") {
  return (
    <div className={`rounded-xl border border-[var(--border)] p-5 ${className}`}
      style={{ background: "var(--surface-1)" }}>
      {children}
    </div>
  );
}

// ─── Tab types ───────────────────────────────────────────────────────────────

type Tab = "overview" | "profile" | "settings" | "skills" | "experience" | "projects" | "certifications" | "awards" | "testimonials" | "storage";
type AuthStep = "login" | "forgot" | "done";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",       label: "Overview",       icon: <BarChart2 size={15} /> },
  { id: "profile",        label: "Profile",        icon: <UserCircle size={15} /> },
  { id: "settings",       label: "Settings",       icon: <Settings size={15} /> },
  { id: "skills",         label: "Skills",         icon: <Layers size={15} /> },
  { id: "experience",     label: "Experience",     icon: <Briefcase size={15} /> },
  { id: "projects",       label: "Projects",       icon: <FolderOpen size={15} /> },
  { id: "certifications", label: "Certifications", icon: <Award size={15} /> },
  { id: "awards",         label: "Awards",         icon: <Trophy size={15} /> },
  { id: "testimonials",   label: "Testimonials",   icon: <MessageSquare size={15} /> },
  { id: "storage",        label: "Storage",        icon: <HardDrive size={15} /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authStep, setAuthStep] = useState<AuthStep>("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken]       = useState<string | null>(null);
  const [tab, setTab]           = useState<Tab>("overview");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  // Forgot-password (login-screen) flow
  const [forgotStep, setForgotStep]       = useState<"email" | "reset">("email");
  const [forgotOtp, setForgotOtp]         = useState(Array(6).fill(""));
  const [forgotNewPw, setForgotNewPw]     = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotDone, setForgotDone]       = useState(false);

  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const t = setTimeout(() => setForgotCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [forgotCooldown]);

  // content states
  const [stats, setStats]           = useState<{ data: {date:string;visits:number}[]; total:number; today:number } | null>(null);
  const [activity, setActivity]     = useState<{ leads: Lead[]; visitors: VisitorRecord[] } | null>(null);
  const [settings, setSettings]     = useState<SettingsType | null>(null);
  const [skills, setSkills]         = useState<SkillGroup[] | null>(null);
  const [experience, setExperience] = useState<ExperienceItem[] | null>(null);
  const [projects, setProjects]     = useState<Project[] | null>(null);
  const [certs, setCerts]           = useState<Certification[] | null>(null);
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [awards, setAwards]         = useState<AwardItem[] | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin_token");
    if (saved) {
      fetch("/api/admin/session", { headers: { Authorization: `Bearer ${saved}` } })
        .then(r => r.json())
        .then(d => { if (d.valid) { setToken(saved); setAuthStep("done"); } else { localStorage.removeItem("admin_token"); } })
        .catch(() => {});
    }
  }, []);

  // Re-fetch all content sections from Redis (used on login + after Storage edits)
  const reloadContent = useCallback(() => {
    const load = (type: string, setter: (d: unknown) => void) =>
      fetch(`/api/content?type=${type}`)
        .then(r => r.json()).then(d => setter(d.data)).catch(() => {});
    load("settings", setSettings as (d: unknown) => void);
    load("skills", setSkills as (d: unknown) => void);
    load("experience", setExperience as (d: unknown) => void);
    load("projects", setProjects as (d: unknown) => void);
    load("certifications", setCerts as (d: unknown) => void);
    load("profile", setProfile as (d: unknown) => void);
    load("awards", setAwards as (d: unknown) => void);
    load("testimonials", setTestimonials as (d: unknown) => void);
  }, []);

  // load content when authenticated
  useEffect(() => {
    if (!token) return;
    reloadContent();
    // load stats
    fetch("/api/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (!d.error) setStats(d); }).catch(() => {});
    // load recent leads + visitors
    fetch("/api/admin/activity", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (!d.error) setActivity(d); }).catch(() => {});
  }, [token, reloadContent]);

  const uploadIcon = useCallback(async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url;
  }, [token]);

  const save = useCallback(async (type: string, data: unknown) => {
    const res = await fetch(`/api/content?type=${type}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.ok;
  }, [token]);

  const signOut = () => {
    localStorage.removeItem("admin_token");
    setToken(null); setAuthStep("login"); setEmail(""); setPassword("");
  };

  // ── Auth: password login ──
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Invalid credentials."); }
      else {
        localStorage.setItem("admin_token", json.token);
        setToken(json.token); setAuthStep("done");
      }
    } catch { setError("Network error."); }
    setLoading(false);
  }, [email, password]);

  // ── Forgot password: request reset OTP ──
  const sendForgotOtp = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to send OTP."); }
      else { setForgotStep("reset"); setForgotCooldown(60); }
    } catch { setError("Network error."); }
    setLoading(false);
  }, [email]);

  // ── Forgot password: verify OTP + set new password ──
  const resetPassword = useCallback(async () => {
    if (forgotNewPw !== forgotConfirm) { setError("Passwords do not match."); return; }
    if (forgotNewPw.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: forgotOtp.join(""), newPassword: forgotNewPw }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed."); setForgotOtp(Array(6).fill("")); }
      else {
        // Success → go back to login, pre-fill nothing, show a hint
        setForgotDone(true);
        setForgotStep("email"); setForgotOtp(Array(6).fill(""));
        setForgotNewPw(""); setForgotConfirm(""); setPassword("");
        setAuthStep("login");
        setTimeout(() => setForgotDone(false), 4000);
      }
    } catch { setError("Network error."); }
    setLoading(false);
  }, [email, forgotOtp, forgotNewPw, forgotConfirm]);

  const backToLogin = () => {
    setAuthStep("login"); setForgotStep("email");
    setForgotOtp(Array(6).fill("")); setForgotNewPw(""); setForgotConfirm("");
    setError("");
  };

  // ── Layout shell ──
  return (
    <main className="min-h-screen px-4 py-12" style={{ background: "var(--background)" }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm hover:text-[var(--accent)] transition-colors" style={{ color: "var(--muted)" }}>
            <ArrowLeft size={14} /> Back to portfolio
          </Link>
          {authStep === "done" && (
            <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs hover:text-red-400 transition-colors cursor-pointer" style={{ color: "var(--muted)" }}>
              <LogOut size={13} /> Sign out
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)" }}>
            <Settings size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Admin Console</h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>portfolio.dev · manage without redeploying</p>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Login step ── */}
          {authStep === "login" && (
            <motion.div key="login" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="rounded-xl border border-[var(--border)] p-8 max-w-sm" style={{ background: "var(--surface-1)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
                <Lock size={20} style={{ color: "var(--accent)" }} />
              </div>
              <h2 className="font-heading text-lg font-semibold mb-1">Sign in</h2>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Enter your admin credentials to continue.</p>
              {forgotDone && (
                <p className="text-xs mb-3" style={{ color: "#22c55e" }}>
                  Password reset. Sign in with your new password.
                </p>
              )}
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address" autoFocus required
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                  style={{ color: "var(--foreground)" }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                  style={{ color: "var(--foreground)" }} />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                  style={{ background: "var(--accent)" }}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
              <button
                onClick={() => { setError(""); setAuthStep("forgot"); setForgotStep("email"); }}
                className="w-full text-center text-xs mt-4 cursor-pointer hover:text-[var(--accent)] transition-colors"
                style={{ color: "var(--muted)" }}
              >
                Forgot password?
              </button>
            </motion.div>
          )}

          {/* ── Forgot-password step ── */}
          {authStep === "forgot" && (
            <motion.div key="forgot" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="rounded-xl border border-[var(--border)] p-8 max-w-sm" style={{ background: "var(--surface-1)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
                <KeyRound size={20} style={{ color: "var(--accent)" }} />
              </div>
              <h2 className="font-heading text-lg font-semibold mb-1">Reset password</h2>

              {forgotStep === "email" ? (
                <>
                  <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                    Enter your admin email — we&apos;ll send a one-time code to reset it.
                  </p>
                  <form onSubmit={e => { e.preventDefault(); sendForgotOtp(); }} className="space-y-3">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Email address" autoFocus required
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                      style={{ color: "var(--foreground)" }} />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                      style={{ background: "var(--accent)" }}>
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                      {loading ? "Sending…" : "Send reset code"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                    Enter the code sent to <strong>{email}</strong> and choose a new password.
                  </p>
                  <div className="space-y-3">
                    <OtpInput value={forgotOtp} onChange={setForgotOtp} />
                    <input type="password" value={forgotNewPw} onChange={e => setForgotNewPw(e.target.value)}
                      placeholder="New password (min 8 chars)"
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                      style={{ color: "var(--foreground)" }} />
                    <input type="password" value={forgotConfirm} onChange={e => setForgotConfirm(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                      style={{ color: "var(--foreground)" }} />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <button onClick={resetPassword} disabled={loading || forgotOtp.some(d => !d) || !forgotNewPw || !forgotConfirm}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                      style={{ background: "var(--accent)" }}>
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                      {loading ? "Resetting…" : "Reset password"}
                    </button>
                    <button onClick={sendForgotOtp} disabled={forgotCooldown > 0 || loading}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs disabled:opacity-40 cursor-pointer transition-colors hover:text-[var(--accent)]"
                      style={{ color: "var(--muted)" }}>
                      <RefreshCw size={11} />
                      {forgotCooldown > 0 ? `Resend in ${forgotCooldown}s` : "Resend code"}
                    </button>
                  </div>
                </>
              )}

              <button onClick={backToLogin}
                className="w-full text-center text-xs mt-4 cursor-pointer hover:text-[var(--accent)] transition-colors"
                style={{ color: "var(--muted)" }}>
                ← Back to sign in
              </button>
            </motion.div>
          )}

          {/* ── Dashboard ── */}
          {authStep === "done" && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Tab bar */}
              <div className="mb-6 border-b border-[var(--border)]">
                <div className="flex gap-0.5 overflow-x-auto admin-tabs">
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors shrink-0"
                      style={{
                        color: tab === t.id ? "var(--accent)" : "var(--muted)",
                        borderBottom: `2px solid ${tab === t.id ? "var(--accent)" : "transparent"}`,
                        marginBottom: "-1px",
                        background: "transparent",
                      }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Overview tab ── */}
              {tab === "overview" && (
                <div className="space-y-4">
                  {!stats ? (
                    <div className="text-sm text-center py-12" style={{ color: "var(--muted)" }}>Loading stats…</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {[{ label: "Today", value: stats.today }, { label: "Total visits", value: stats.total }].map(({ label, value }) => (
                          <div key={label} className="rounded-xl border border-[var(--border)] p-5" style={{ background: "var(--surface-1)" }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Eye size={13} style={{ color: "var(--accent)" }} />
                              <span className="text-xs" style={{ color: "var(--muted)" }}>{label}</span>
                            </div>
                            <p className="font-heading text-3xl font-bold">{value.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      {card(
                        <>
                          <p className="text-sm font-medium mb-6">Daily Visitors — Last 30 Days</p>
                          {mounted && (
                            <ResponsiveContainer width="100%" height={220}>
                              <AreaChart data={stats.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
                                <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--foreground)" }}
                                  labelFormatter={l => fmtDate(String(l))} formatter={v => [v, "visits"]}
                                  cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "4 2" }} />
                                <Area type="monotone" dataKey="visits" stroke="var(--accent)" strokeWidth={2} fill="url(#ag)" dot={false} activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }} />
                              </AreaChart>
                            </ResponsiveContainer>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Recent leads */}
                  {card(
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <UserPlus size={15} style={{ color: "var(--accent)" }} />
                        <p className="text-sm font-medium">Recent Leads</p>
                        {activity && (
                          <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>
                            {activity.leads.length} total
                          </span>
                        )}
                      </div>
                      {!activity ? (
                        <p className="text-xs py-4 text-center" style={{ color: "var(--muted)" }}>Loading…</p>
                      ) : activity.leads.length === 0 ? (
                        <p className="text-xs py-4 text-center" style={{ color: "var(--muted)" }}>No leads yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {activity.leads.map((l) => (
                            <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)]" style={{ background: "var(--surface-2)" }}>
                              <Mail size={14} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium truncate">{l.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                                    style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                                    {l.source === "contact" ? "Contact form" : "Hiring widget"}
                                  </span>
                                </div>
                                <a href={`mailto:${l.email}`} className="text-xs hover:text-[var(--accent)] transition-colors break-all" style={{ color: "var(--muted)" }}>
                                  {l.email}
                                </a>
                                {l.message && (
                                  <p className="text-xs mt-1 italic" style={{ color: "var(--muted)" }}>“{l.message}”</p>
                                )}
                              </div>
                              <span className="text-[10px] shrink-0" style={{ color: "var(--muted)" }}>{relTime(l.ts)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Recent visitors */}
                  {card(
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin size={15} style={{ color: "var(--accent)" }} />
                        <p className="text-sm font-medium">Recent Visitors</p>
                        {activity && (
                          <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>
                            last {activity.visitors.length}
                          </span>
                        )}
                      </div>
                      {!activity ? (
                        <p className="text-xs py-4 text-center" style={{ color: "var(--muted)" }}>Loading…</p>
                      ) : activity.visitors.length === 0 ? (
                        <p className="text-xs py-4 text-center" style={{ color: "var(--muted)" }}>No visitors tracked yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {activity.visitors.map((v) => (
                            <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]" style={{ background: "var(--surface-2)" }}>
                              <span className="text-base shrink-0" aria-hidden>{v.flag}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {v.country}{v.city ? `, ${v.city}` : ""}
                                </p>
                                <p className="text-xs flex items-center gap-1.5 flex-wrap" style={{ color: "var(--muted)" }}>
                                  <Monitor size={11} />
                                  {v.browser} · {v.os} · {v.device}
                                  {v.ref && v.ref !== "Direct" && (
                                    <span className="inline-flex items-center gap-0.5">
                                      <ExternalLink size={10} /> {v.ref}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span className="text-[10px] shrink-0" style={{ color: "var(--muted)" }}>{relTime(v.ts)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── Profile tab ── */}
              {tab === "profile" && (
                <ProfileTab profile={profile} onSave={async (p) => {
                  if (await save("profile", p)) setProfile(p);
                }} />
              )}

              {/* ── Settings tab ── */}
              {tab === "settings" && (
                <SettingsTab settings={settings} uploadIcon={uploadIcon} token={token} onSave={async (s) => {
                  if (await save("settings", s)) setSettings(s);
                }} />
              )}

              {/* ── Skills tab ── */}
              {tab === "skills" && (
                <SkillsTab skills={skills} uploadIcon={uploadIcon} onSave={async (s) => {
                  if (await save("skills", s)) setSkills(s);
                }} />
              )}

              {/* ── Experience tab ── */}
              {tab === "experience" && (
                <ExperienceTab experience={experience} uploadIcon={uploadIcon} onSave={async (e) => {
                  if (await save("experience", e)) setExperience(e);
                }} />
              )}

              {/* ── Projects tab ── */}
              {tab === "projects" && (
                <ProjectsTab projects={projects} uploadIcon={uploadIcon} onSave={async (p) => {
                  if (await save("projects", p)) setProjects(p);
                }} />
              )}

              {/* ── Certifications tab ── */}
              {tab === "certifications" && (
                <CertificationsTab certs={certs} onSave={async (c) => {
                  if (await save("certifications", c)) setCerts(c);
                }} />
              )}

              {/* ── Awards tab ── */}
              {tab === "awards" && (
                <AwardsTab awards={awards} onSave={async (a) => {
                  if (await save("awards", a)) setAwards(a);
                }} />
              )}

              {/* ── Testimonials tab ── */}
              {tab === "testimonials" && (
                <TestimonialsTab items={testimonials} uploadIcon={uploadIcon} onSave={async (t) => {
                  if (await save("testimonials", t)) setTestimonials(t);
                }} />
              )}

              {/* ── Storage tab ── */}
              {tab === "storage" && (
                <StorageTab token={token} onChanged={reloadContent} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Storage tab ──────────────────────────────────────────────────────────────

type BlobFile = { url: string; pathname: string; size: number; uploadedAt: string; proxyUrl: string };

const RESET_SECTIONS: { id: string; label: string }[] = [
  { id: "profile",        label: "Profile" },
  { id: "settings",       label: "Settings" },
  { id: "skills",         label: "Skills" },
  { id: "experience",     label: "Experience" },
  { id: "projects",       label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "awards",         label: "Awards" },
  { id: "testimonials",   label: "Testimonials" },
];

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isImage(pathname: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif|ico)$/i.test(pathname);
}

function StorageTab({ token, onChanged }: { token: string | null; onChanged: () => void }) {
  const [files, setFiles] = useState<BlobFile[] | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [resetSection, setResetSection] = useState("settings");
  const [resetting, setResetting] = useState(false);

  const load = useCallback(() => {
    setFiles(null); setError("");
    fetch("/api/admin/blobs", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setFiles(d.files); })
      .catch(() => setError("Failed to load files."));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const deleteFile = async (f: BlobFile) => {
    if (!window.confirm(`Delete "${f.pathname.replace("portfolio-icons/", "")}"?\n\nThis permanently removes the file from Vercel Blob and clears any reference to it in your content.`)) return;
    setDeleting(f.url); setMsg(""); setError("");
    try {
      const res = await fetch("/api/admin/blobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: f.url }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Delete failed."); }
      else {
        setFiles(prev => prev ? prev.filter(x => x.url !== f.url) : prev);
        const cleared = (d.clearedFrom ?? []) as string[];
        setMsg(cleared.length ? `File deleted. Cleared its reference in: ${cleared.join(", ")}.` : "File deleted.");
        if (cleared.length) onChanged();
      }
    } catch { setError("Network error."); }
    setDeleting(null);
  };

  const resetSectionToDefaults = async () => {
    const label = RESET_SECTIONS.find(s => s.id === resetSection)?.label ?? resetSection;
    if (!window.confirm(`Reset "${label}" to built-in defaults?\n\nThis overwrites the current content in Redis and cannot be undone.`)) return;
    setResetting(true); setMsg(""); setError("");
    try {
      const res = await fetch(`/api/content?type=${resetSection}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Reset failed."); }
      else { setMsg(`"${label}" reset to defaults.`); onChanged(); }
    } catch { setError("Network error."); }
    setResetting(false);
  };

  return (
    <div className="space-y-8">
      {/* Vercel Blob files */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
            <HardDrive size={18} style={{ color: "var(--accent)" }} /> Uploaded files
          </h3>
          <button onClick={load} className="inline-flex items-center gap-1.5 text-xs hover:text-[var(--accent)] transition-colors cursor-pointer" style={{ color: "var(--muted)" }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {msg && <p className="text-xs mb-3" style={{ color: "var(--accent)" }}>{msg}</p>}
        {error && <p className="text-xs mb-3 text-red-400">{error}</p>}

        {files === null ? (
          <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: "var(--muted)" }}>
            <Loader2 size={16} className="animate-spin" /> Loading files…
          </div>
        ) : files.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>No files in Vercel Blob.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map(f => (
              <div key={f.url} className="rounded-lg border border-[var(--border)] overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <div className="h-28 flex items-center justify-center overflow-hidden" style={{ background: "var(--background)" }}>
                  {isImage(f.pathname) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.proxyUrl} alt={f.pathname} className="w-full h-full object-contain" />
                  ) : (
                    <FileText size={32} style={{ color: "var(--muted)" }} />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium truncate" title={f.pathname}>{f.pathname.replace("portfolio-icons/", "")}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{fmtSize(f.size)} · {new Date(f.uploadedAt).toLocaleDateString()}</p>
                  <button
                    onClick={() => deleteFile(f)}
                    disabled={deleting === f.url}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deleting === f.url ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset content section */}
      <div className="rounded-lg border border-[var(--border)] p-4" style={{ background: "var(--surface-2)" }}>
        <h3 className="font-heading text-sm font-semibold flex items-center gap-2 mb-1">
          <AlertTriangle size={15} className="text-amber-500" /> Reset a content section
        </h3>
        <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
          Overwrites the chosen section in Redis with its built-in defaults. Useful for clearing out test data.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={resetSection}
            onChange={e => setResetSection(e.target.value)}
            className="px-3 py-2 rounded-md text-sm border border-[var(--border)] bg-[var(--background)] cursor-pointer"
            style={{ color: "var(--foreground)" }}
          >
            {RESET_SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button
            onClick={resetSectionToDefaults}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {resetting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab({ settings, onSave, uploadIcon, token }: {
  settings: SettingsType | null;
  onSave: (s: SettingsType) => Promise<void>;
  uploadIcon: (f: File) => Promise<string>;
  token: string | null;
}) {
  const [available, setAvailable] = useState(settings?.available ?? true);
  const [photoUrl, setPhotoUrl] = useState(settings?.photoUrl ?? "");
  const [resumeUrl, setResumeUrl] = useState(settings?.resumeUrl ?? "");
  const [palette, setPalette] = useState(settings?.palette ?? "default");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeInfo, setResumeInfo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Change password state
  const [pwStep, setPwStep]       = useState<"idle" | "otp-sent">("idle");
  const [pwOtp, setPwOtp]         = useState(Array(6).fill(""));
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwCooldown, setPwCooldown] = useState(0);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState("");
  const [pwDone, setPwDone]       = useState(false);

  useEffect(() => {
    if (settings) {
      setAvailable(settings.available);
      setPhotoUrl(settings.photoUrl ?? "");
      setResumeUrl(settings.resumeUrl ?? "");
      setPalette(settings.palette ?? "default");
    }
  }, [settings]);

  useEffect(() => {
    if (pwCooldown <= 0) return;
    const t = setTimeout(() => setPwCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [pwCooldown]);

  const sendPwOtp = async () => {
    setPwLoading(true); setPwError("");
    const res = await fetch("/api/admin/otp", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) { setPwError(json.error ?? "Failed to send OTP."); }
    else { setPwStep("otp-sent"); setPwCooldown(60); }
    setPwLoading(false);
  };

  const changePw = async () => {
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwLoading(true); setPwError("");
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ otp: pwOtp.join(""), newPassword: newPw }),
    });
    const json = await res.json();
    if (!res.ok) { setPwError(json.error ?? "Failed."); setPwOtp(Array(6).fill("")); }
    else {
      setPwDone(true); setPwStep("idle");
      setNewPw(""); setConfirmPw(""); setPwOtp(Array(6).fill(""));
      setTimeout(() => setPwDone(false), 3000);
    }
    setPwLoading(false);
  };

  // Auto-submit when all 6 OTP digits filled
  useEffect(() => {
    if (pwStep === "otp-sent" && !pwLoading && pwOtp.every(d => d !== "")) changePw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pwOtp]);

  const persist = async (patch: Partial<SettingsType>) => {
    setSaving(true);
    const next = { available, photoUrl: photoUrl || undefined, resumeUrl: resumeUrl || undefined, palette, ...patch };
    await onSave(next);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const choosePalette = async (id: string) => {
    setPalette(id);
    applyPalette(id);          // live preview
    await persist({ palette: id });
  };

  // Compress a PDF client-side (pdf-lib object streams), keep whichever is smaller, then upload
  const handleResumeUpload = async (file: File) => {
    setResumeError(""); setResumeInfo("");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) { setResumeError("Please upload a PDF file."); return; }
    setResumeUploading(true);
    try {
      const original = new Uint8Array(await file.arrayBuffer());
      let out: Uint8Array = original;
      try {
        const doc = await PDFDocument.load(original, { ignoreEncryption: true });
        const compressed = await doc.save({ useObjectStreams: true });
        if (compressed.byteLength < original.byteLength) out = compressed;
      } catch { /* compression failed — fall back to original bytes */ }

      const origKB = Math.round(original.byteLength / 1024);
      const finalKB = Math.round(out.byteLength / 1024);
      const savedBytes = original.byteLength - out.byteLength;
      const pct = savedBytes > 0 ? Math.round((savedBytes / original.byteLength) * 100) : 0;

      const uploadFile = new File([out as BlobPart], "resume.pdf", { type: "application/pdf" });
      const url = await uploadIcon(uploadFile);
      setResumeUrl(url);
      await persist({ resumeUrl: url });
      setResumeInfo(
        pct > 0
          ? `Compressed ${origKB}KB → ${finalKB}KB (−${pct}%)`
          : `Uploaded (${finalKB}KB — already optimised)`
      );
    } catch {
      setResumeError("Upload failed. Try again.");
    }
    setResumeUploading(false);
  };

  const toggle = async () => {
    const next = !available;
    setAvailable(next);
    await persist({ available: next });
  };

  return (
    <div className="space-y-4">
      {/* Profile photo */}
      {card(
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-0.5">Profile Photo</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Replaces the hero photo. Recommended: square, min 400×400px.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--border)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl || "/SAM.JPG"}
                alt="Profile"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="space-y-2">
              <IconUploader
                currentUrl={photoUrl || undefined}
                uploadFn={uploadIcon}
                onUpload={async (url) => {
                  setPhotoUrl(url);
                  await persist({ photoUrl: url || undefined });
                }}
              />
              {photoUrl && (
                <button
                  onClick={async () => { setPhotoUrl(""); await persist({ photoUrl: undefined }); }}
                  className="text-xs text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Revert to original photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume */}
      {card(
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-0.5">Resume (PDF)</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Replaces the downloadable resume. Automatically compressed on upload.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
              <FileText size={20} style={{ color: "var(--accent)" }} />
            </div>
            <input id="resume-input" type="file" accept="application/pdf,.pdf" className="hidden"
              onChange={e => e.target.files?.[0] && handleResumeUpload(e.target.files[0])} />
            <label htmlFor="resume-input"
              className="text-xs px-3 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer inline-flex items-center gap-2"
              style={{ color: "var(--muted)" }}>
              {resumeUploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
              {resumeUploading ? "Processing…" : "Upload PDF"}
            </label>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors" style={{ color: "var(--muted)" }}>
                <ExternalLink size={12} /> View current
              </a>
            )}
            {resumeUrl && (
              <button onClick={async () => { setResumeUrl(""); setResumeInfo(""); await persist({ resumeUrl: undefined }); }}
                className="text-xs text-red-400 hover:text-red-500 transition-colors cursor-pointer">
                Revert to default
              </button>
            )}
          </div>
          {resumeInfo && <p className="text-xs" style={{ color: "#22c55e" }}>{resumeInfo}</p>}
          {resumeError && <p className="text-xs text-red-400">{resumeError}</p>}
        </div>
      )}

      {/* Color palette */}
      {card(
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-0.5">Color Palette</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Changes the accent colour across the whole site (light &amp; dark modes).
            </p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {PALETTES.map((pal) => {
              const active = palette === pal.id;
              return (
                <button
                  key={pal.id}
                  onClick={() => choosePalette(pal.id)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors cursor-pointer"
                  style={{
                    borderColor: active ? pal.dark : "var(--border)",
                    background: active ? `color-mix(in srgb, ${pal.dark} 10%, transparent)` : "transparent",
                  }}
                  title={pal.name}
                >
                  <span className="relative w-8 h-8 rounded-full shrink-0"
                    style={{ background: `linear-gradient(135deg, ${pal.light}, ${pal.dark})` }}>
                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center text-white">
                        <Check size={14} />
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] truncate w-full text-center"
                    style={{ color: active ? "var(--foreground)" : "var(--muted)" }}>
                    {pal.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Open to Work */}
      {card(
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Open to Work</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Shows the availability badge in the hero section
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saving && <Loader2 size={14} className="animate-spin" style={{ color: "var(--muted)" }} />}
            {saved && <span className="text-xs" style={{ color: "#22c55e" }}>Saved</span>}
            <button onClick={toggle} disabled={saving} className="cursor-pointer" aria-label="Toggle availability">
              {available
                ? <ToggleRight size={36} style={{ color: "var(--accent)" }} />
                : <ToggleLeft size={36} style={{ color: "var(--muted)" }} />}
            </button>
          </div>
        </div>
      )}

      {/* Change Password */}
      {card(
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound size={15} style={{ color: "var(--accent)" }} />
              <p className="text-sm font-medium">Change Password</p>
            </div>
            {pwDone && <span className="text-xs" style={{ color: "#22c55e" }}>Password updated!</span>}
          </div>

          {pwStep === "idle" && (
            <button onClick={sendPwOtp} disabled={pwLoading || pwCooldown > 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50"
              style={{ color: "var(--muted)" }}>
              {pwLoading ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
              {pwCooldown > 0 ? `Resend in ${pwCooldown}s` : "Send OTP to admin email"}
            </button>
          )}

          {pwStep === "otp-sent" && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Enter the OTP sent to your admin email, then set your new password.
              </p>
              <OtpInput value={pwOtp} onChange={setPwOtp} />
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]"
                style={{ color: "var(--foreground)" }} />
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]"
                style={{ color: "var(--foreground)" }} />
              {pwError && <p className="text-xs text-red-400">{pwError}</p>}
              <div className="flex gap-2">
                <button onClick={changePw} disabled={pwLoading || !newPw || !confirmPw}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
                  style={{ background: "var(--accent)" }}>
                  {pwLoading ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                  Update Password
                </button>
                <button onClick={() => { setPwStep("idle"); setPwOtp(Array(6).fill("")); setPwError(""); }}
                  className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-colors"
                  style={{ color: "var(--muted)" }}>
                  Cancel
                </button>
                <button onClick={sendPwOtp} disabled={pwCooldown > 0 || pwLoading}
                  className="ml-auto flex items-center gap-1 text-xs disabled:opacity-40 cursor-pointer hover:text-[var(--accent)] transition-colors"
                  style={{ color: "var(--muted)" }}>
                  <RefreshCw size={11} />
                  {pwCooldown > 0 ? `${pwCooldown}s` : "Resend"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skills tab ───────────────────────────────────────────────────────────────

function SkillsTab({ skills, onSave, uploadIcon }: { skills: SkillGroup[] | null; onSave: (s: SkillGroup[]) => Promise<void>; uploadIcon: (f: File) => Promise<string> }) {
  const [groups, setGroups] = useState<SkillGroup[]>(skills ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => { if (skills) setGroups(skills); }, [skills]);

  const doSave = async () => {
    setSaving(true);
    await onSave(groups);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const addGroup = () => {
    if (!newCategory.trim()) return;
    setGroups(g => [...g, { category: newCategory.trim(), skills: [] }]);
    setNewCategory("");
  };

  const removeGroup = (gi: number) => setGroups(g => g.filter((_, i) => i !== gi));

  const addSkill = (gi: number, name: string, note: string) => {
    if (!name.trim()) return;
    setGroups(g => g.map((grp, i) => i === gi
      ? { ...grp, skills: [...grp.skills, { name: name.trim(), ...(note.trim() ? { note: note.trim() } : {}) }] }
      : grp));
  };

  const removeSkill = (gi: number, si: number) =>
    setGroups(g => g.map((grp, i) => i === gi
      ? { ...grp, skills: grp.skills.filter((_, j) => j !== si) }
      : grp));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Manage skill categories and icons (icon resolves from skill name).</p>
        <button onClick={doSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saved ? "Saved!" : "Save"}
        </button>
      </div>

      {groups.map((grp, gi) => (
        <SkillGroupEditor key={gi} group={grp} uploadIcon={uploadIcon}
          onRemoveGroup={() => removeGroup(gi)}
          onAddSkill={(n, note) => addSkill(gi, n, note)}
          onRemoveSkill={si => removeSkill(gi, si)}
          onUpdateSkillIcon={(si, url) => setGroups(g => g.map((gr, i) => i === gi
            ? { ...gr, skills: gr.skills.map((s, j) => j === si ? { ...s, iconUrl: url || undefined } : s) }
            : gr))} />
      ))}

      {card(
        <div className="flex gap-2">
          <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addGroup()}
            placeholder="New category name" className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]"
            style={{ color: "var(--foreground)" }} />
          <button onClick={addGroup} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer" style={{ background: "var(--accent)" }}>
            <Plus size={14} /> Add Group
          </button>
        </div>
      )}
    </div>
  );
}

function SkillGroupEditor({ group, onRemoveGroup, onAddSkill, onRemoveSkill, onUpdateSkillIcon, uploadIcon }:
  { group: SkillGroup; onRemoveGroup: () => void; onAddSkill: (name: string, note: string) => void; onRemoveSkill: (i: number) => void; onUpdateSkillIcon: (i: number, url: string) => void; uploadIcon: (f: File) => Promise<string> }) {
  const [open, setOpen] = useState(true);
  const [newName, setNewName] = useState(""); const [newNote, setNewNote] = useState("");

  const add = () => { onAddSkill(newName, newNote); setNewName(""); setNewNote(""); };

  return card(
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 text-sm font-semibold cursor-pointer hover:text-[var(--accent)] transition-colors">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {group.category}
        </button>
        <button onClick={onRemoveGroup} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
      </div>
      {open && (
        <>
          <div className="space-y-2 mb-3">
            {group.skills.map((s: Skill, i: number) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                <span className="flex-1 text-xs" style={{ color: "var(--foreground)" }}>
                  {s.name}{s.note ? ` · ${s.note}` : ""}
                </span>
                <IconUploader currentUrl={s.iconUrl} uploadFn={uploadIcon}
                  onUpload={url => onUpdateSkillIcon(i, url)} />
                <button onClick={() => onRemoveSkill(i)} className="cursor-pointer hover:text-red-400 transition-colors ml-1"><Trash2 size={12} style={{ color: "var(--muted)" }} /></button>
              </div>
            ))}
            {group.skills.length === 0 && <span className="text-xs" style={{ color: "var(--muted)" }}>No skills yet.</span>}
          </div>
          <div className="flex gap-2">
            <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
              placeholder="Skill name" className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]"
              style={{ color: "var(--foreground)" }} />
            <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
              placeholder="Note (optional)" className="w-32 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]"
              style={{ color: "var(--foreground)" }} />
            <button onClick={add} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer" style={{ background: "var(--accent)" }}>
              <Plus size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Experience tab ────────────────────────────────────────────────────────────

function ExperienceTab({ experience, onSave, uploadIcon }: { experience: ExperienceItem[] | null; onSave: (e: ExperienceItem[]) => Promise<void>; uploadIcon: (f: File) => Promise<string> }) {
  const [items, setItems] = useState<ExperienceItem[]>(experience ?? []);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (experience) setItems(experience); }, [experience]);

  const doSave = async () => {
    setSaving(true); await onSave(items);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const update = (i: number, item: ExperienceItem) =>
    setItems(arr => arr.map((x, j) => j === i ? item : x));
  const remove = (i: number) => { setItems(arr => arr.filter((_, j) => j !== i)); setEditing(null); };
  const add = () => {
    const blank: ExperienceItem = { role: "", company: "", period: "", type: "devops", current: false, bullets: [""], tags: [] };
    setItems(arr => [blank, ...arr]); setEditing(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer" style={{ color: "var(--muted)" }}>
          <Plus size={14} /> Add Entry
        </button>
        <button onClick={doSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)]" style={{ background: "var(--surface-1)" }}>
          <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div>
              <p className="text-sm font-semibold">{item.role || <span style={{ color: "var(--muted)" }}>Untitled role</span>}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.company} {item.period && `· ${item.period}`}</p>
            </div>
            <div className="flex items-center gap-3">
              {item.current && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, #22c55e 15%, transparent)", color: "#22c55e" }}>Current</span>}
              <button onClick={e => { e.stopPropagation(); remove(i); }} className="cursor-pointer hover:text-red-400 transition-colors" style={{ color: "var(--muted)" }}><Trash2 size={14} /></button>
              {editing === i ? <ChevronUp size={14} style={{ color: "var(--muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted)" }} />}
            </div>
          </div>

          {editing === i && (
            <div className="px-5 pb-5 pt-0 space-y-3 border-t border-[var(--border)]" style={{ marginTop: 0, paddingTop: 16 }}>
              <ExperienceForm item={item} onChange={v => update(i, v)} uploadIcon={uploadIcon} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExperienceForm({ item, onChange, uploadIcon }: { item: ExperienceItem; onChange: (v: ExperienceItem) => void; uploadIcon: (f: File) => Promise<string> }) {
  const set = (k: keyof ExperienceItem, v: unknown) => onChange({ ...item, [k]: v });
  const inp = "w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]";
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Role icon (overrides default)</p>
        <IconUploader currentUrl={item.iconUrl} uploadFn={uploadIcon}
          onUpload={url => set("iconUrl", url || undefined)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input value={item.role} onChange={e => set("role", e.target.value)} placeholder="Role" className={inp} style={{ color: "var(--foreground)" }} />
        <input value={item.company} onChange={e => set("company", e.target.value)} placeholder="Company" className={inp} style={{ color: "var(--foreground)" }} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input value={item.period} onChange={e => set("period", e.target.value)} placeholder="Period" className={inp} style={{ color: "var(--foreground)" }} />
        <select value={item.type} onChange={e => set("type", e.target.value)} className={inp} style={{ color: "var(--foreground)" }}>
          <option value="devops">DevOps</option>
          <option value="design">Design</option>
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--muted)" }}>
          <input type="checkbox" checked={item.current} onChange={e => set("current", e.target.checked)} className="accent-[var(--accent)]" />
          Current role
        </label>
      </div>
      <div>
        <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Bullets (one per line)</p>
        <textarea value={item.bullets.join("\n")} onChange={e => set("bullets", e.target.value.split("\n"))}
          rows={3} className={`${inp} resize-none`} style={{ color: "var(--foreground)" }} />
      </div>
      <div>
        <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Tags (comma-separated)</p>
        <input value={item.tags.join(", ")} onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
          placeholder="Kubernetes, Docker, Azure" className={inp} style={{ color: "var(--foreground)" }} />
      </div>
    </div>
  );
}

// ─── Projects tab ──────────────────────────────────────────────────────────────

function ProjectsTab({ projects, onSave, uploadIcon }: { projects: Project[] | null; onSave: (p: Project[]) => Promise<void>; uploadIcon: (f: File) => Promise<string> }) {
  const [items, setItems] = useState<Project[]>(projects ?? []);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (projects) setItems(projects); }, [projects]);

  const doSave = async () => {
    setSaving(true); await onSave(items);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const update = (i: number, item: Project) =>
    setItems(arr => arr.map((x, j) => j === i ? item : x));
  const remove = (i: number) => { setItems(arr => arr.filter((_, j) => j !== i)); setEditing(null); };
  const add = () => {
    const blank: Project = { title: "", period: "", description: "", tech: [], link: null, linkLabel: null, type: "web", color: "#00C8D7", featured: false };
    setItems(arr => [blank, ...arr]); setEditing(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer" style={{ color: "var(--muted)" }}>
          <Plus size={14} /> Add Project
        </button>
        <button onClick={doSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)]" style={{ background: "var(--surface-1)" }}>
          <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full" style={{ background: item.color }} />
              <div>
                <p className="text-sm font-semibold">{item.title || <span style={{ color: "var(--muted)" }}>Untitled</span>}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.period} · {item.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {item.featured && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>Featured</span>}
              <button onClick={e => { e.stopPropagation(); remove(i); }} className="cursor-pointer hover:text-red-400 transition-colors" style={{ color: "var(--muted)" }}><Trash2 size={14} /></button>
              {editing === i ? <ChevronUp size={14} style={{ color: "var(--muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted)" }} />}
            </div>
          </div>

          {editing === i && (
            <div className="px-5 pb-5 border-t border-[var(--border)]" style={{ paddingTop: 16 }}>
              <ProjectForm item={item} onChange={v => update(i, v)} uploadIcon={uploadIcon} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectForm({ item, onChange, uploadIcon }: { item: Project; onChange: (v: Project) => void; uploadIcon: (f: File) => Promise<string> }) {
  const set = (k: keyof Project, v: unknown) => onChange({ ...item, [k]: v });
  const inp = "w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]";
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Project icon (overrides default)</p>
        <IconUploader currentUrl={item.iconUrl} uploadFn={uploadIcon}
          onUpload={url => set("iconUrl", url || undefined)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input value={item.title} onChange={e => set("title", e.target.value)} placeholder="Title" className={inp} style={{ color: "var(--foreground)" }} />
        <input value={item.period} onChange={e => set("period", e.target.value)} placeholder="Period" className={inp} style={{ color: "var(--foreground)" }} />
      </div>
      <textarea value={item.description} onChange={e => set("description", e.target.value)} placeholder="Description" rows={3} className={`${inp} resize-none`} style={{ color: "var(--foreground)" }} />
      <div className="grid grid-cols-3 gap-3">
        <select value={item.type} onChange={e => set("type", e.target.value)} className={inp} style={{ color: "var(--foreground)" }}>
          <option value="web">Web</option><option value="devops">DevOps</option><option value="design">Design</option>
        </select>
        <div className="flex items-center gap-2">
          <input type="color" value={item.color} onChange={e => set("color", e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer bg-transparent" />
          <input value={item.color} onChange={e => set("color", e.target.value)} className={`${inp} flex-1`} style={{ color: "var(--foreground)" }} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--muted)" }}>
          <input type="checkbox" checked={item.featured} onChange={e => set("featured", e.target.checked)} className="accent-[var(--accent)]" />
          Featured
        </label>
      </div>
      <div>
        <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Tech stack (comma-separated)</p>
        <input value={item.tech.join(", ")} onChange={e => set("tech", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
          placeholder="Next.js, TypeScript, Vercel" className={inp} style={{ color: "var(--foreground)" }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input value={item.link ?? ""} onChange={e => set("link", e.target.value || null)} placeholder="Link URL (optional)" className={inp} style={{ color: "var(--foreground)" }} />
        <input value={item.linkLabel ?? ""} onChange={e => set("linkLabel", e.target.value || null)} placeholder="Link label (optional)" className={inp} style={{ color: "var(--foreground)" }} />
      </div>
    </div>
  );
}

// ─── Certifications tab ────────────────────────────────────────────────────────

function CertificationsTab({ certs, onSave }: { certs: Certification[] | null; onSave: (c: Certification[]) => Promise<void> }) {
  const [items, setItems] = useState<Certification[]>(certs ?? []);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (certs) setItems(certs); }, [certs]);

  const doSave = async () => {
    setSaving(true); await onSave(items);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const update = (i: number, item: Certification) => setItems(arr => arr.map((x, j) => j === i ? item : x));
  const remove = (i: number) => { setItems(arr => arr.filter((_, j) => j !== i)); setEditing(null); };
  const add = () => {
    const blank: Certification = { title: "", badge: "", issuer: "", date: "", status: "issued", color: "#0078D4" };
    setItems(arr => [blank, ...arr]); setEditing(0);
  };

  const inp = "w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer" style={{ color: "var(--muted)" }}>
          <Plus size={14} /> Add Certification
        </button>
        <button onClick={doSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)]" style={{ background: "var(--surface-1)" }}>
          <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: `color-mix(in srgb, ${item.color} 20%, transparent)`, color: item.color }}>
                {item.badge || "—"}
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title || <span style={{ color: "var(--muted)" }}>Untitled</span>}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.issuer} {item.date && `· ${item.date}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: item.status === "issued" ? "color-mix(in srgb, #22c55e 15%, transparent)" : "color-mix(in srgb, #f59e0b 15%, transparent)",
                  color: item.status === "issued" ? "#22c55e" : "#f59e0b",
                }}>
                {item.status === "issued" ? "Issued" : "In Progress"}
              </span>
              <button onClick={e => { e.stopPropagation(); remove(i); }} className="cursor-pointer hover:text-red-400 transition-colors" style={{ color: "var(--muted)" }}><Trash2 size={14} /></button>
              {editing === i ? <ChevronUp size={14} style={{ color: "var(--muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted)" }} />}
            </div>
          </div>

          {editing === i && (
            <div className="px-5 pb-5 border-t border-[var(--border)] space-y-3" style={{ paddingTop: 16 }}>
              <div className="grid grid-cols-2 gap-3">
                <input value={item.title} onChange={e => update(i, { ...item, title: e.target.value })} placeholder="Title" className={inp} style={{ color: "var(--foreground)" }} />
                <input value={item.issuer} onChange={e => update(i, { ...item, issuer: e.target.value })} placeholder="Issuer" className={inp} style={{ color: "var(--foreground)" }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input value={item.badge} onChange={e => update(i, { ...item, badge: e.target.value })} placeholder="Badge (e.g. AZ-900)" className={inp} style={{ color: "var(--foreground)" }} />
                <input value={item.date} onChange={e => update(i, { ...item, date: e.target.value })} placeholder="Date / In Progress" className={inp} style={{ color: "var(--foreground)" }} />
                <select value={item.status} onChange={e => update(i, { ...item, status: e.target.value as Certification["status"] })} className={inp} style={{ color: "var(--foreground)" }}>
                  <option value="issued">Issued</option>
                  <option value="progress">In Progress</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--muted)" }}>Accent colour</span>
                <input type="color" value={item.color} onChange={e => update(i, { ...item, color: e.target.value })} className="w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer bg-transparent" />
                <input value={item.color} onChange={e => update(i, { ...item, color: e.target.value })} className={`${inp} flex-1`} style={{ color: "var(--foreground)" }} />
              </div>
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>No certifications yet.</p>
      )}
    </div>
  );
}

// ─── Profile tab ───────────────────────────────────────────────────────────────

function ProfileTab({ profile, onSave }: { profile: Profile | null; onSave: (p: Profile) => Promise<void> }) {
  const [p, setP] = useState<Profile>(profile ?? DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (profile) setP(profile); }, [profile]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP(prev => ({ ...prev, [k]: v }));

  const doSave = async () => {
    setSaving(true); await onSave(p);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const inp = "w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]";
  const lbl = "text-xs mb-1.5 block";

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) =>
    card(
      <div className="space-y-3">
        <p className="text-sm font-semibold mb-1">{title}</p>
        {children}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between sticky top-0 z-10 pb-2">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Edit the text shown across the site.</p>
        <button onClick={doSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {/* Hero */}
      <Group title="Hero">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><span className={lbl} style={{ color: "var(--muted)" }}>Name</span>
            <input value={p.name} onChange={e => set("name", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
          <div><span className={lbl} style={{ color: "var(--muted)" }}>Tagline</span>
            <input value={p.tagline} onChange={e => set("tagline", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
        </div>
        <div><span className={lbl} style={{ color: "var(--muted)" }}>Rotating roles (comma-separated)</span>
          <input value={p.roles.join(", ")} onChange={e => set("roles", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className={inp} style={{ color: "var(--foreground)" }} /></div>
        <div><span className={lbl} style={{ color: "var(--muted)" }}>Achievement badge</span>
          <input value={p.heroBadge} onChange={e => set("heroBadge", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><span className={lbl} style={{ color: "var(--muted)" }}>Stat card value</span>
            <input value={p.statValue} onChange={e => set("statValue", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
          <div><span className={lbl} style={{ color: "var(--muted)" }}>Stat card label</span>
            <input value={p.statLabel} onChange={e => set("statLabel", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><span className={lbl} style={{ color: "var(--muted)" }}>Available badge text</span>
            <input value={p.availableText} onChange={e => set("availableText", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
          <div><span className={lbl} style={{ color: "var(--muted)" }}>Unavailable badge text</span>
            <input value={p.unavailableText} onChange={e => set("unavailableText", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
        </div>
      </Group>

      {/* About */}
      <Group title="About">
        <div><span className={lbl} style={{ color: "var(--muted)" }}>Subtitle (under name)</span>
          <input value={p.aboutTitle} onChange={e => set("aboutTitle", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
        <div><span className={lbl} style={{ color: "var(--muted)" }}>Bio paragraphs (blank line between paras). Markup: **text** = bold, ==text== = blue pill</span>
          <textarea value={p.bio.join("\n\n")} onChange={e => set("bio", e.target.value.split(/\n\n+/).map(s => s.trim()).filter(Boolean))}
            rows={8} className={`${inp} resize-none`} style={{ color: "var(--foreground)" }} /></div>
        <div><span className={lbl} style={{ color: "var(--muted)" }}>Quick info lines (one per line)</span>
          <textarea value={p.quickInfo.join("\n")} onChange={e => set("quickInfo", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
            rows={3} className={`${inp} resize-none`} style={{ color: "var(--foreground)" }} /></div>

        <span className={lbl} style={{ color: "var(--muted)" }}>Stats (4 cards)</span>
        {p.stats.map((s, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <input value={s.prefix} onChange={e => set("stats", p.stats.map((x, j) => j === i ? { ...x, prefix: e.target.value } : x))} placeholder="prefix" className={inp} style={{ color: "var(--foreground)" }} />
            <input type="number" value={s.value} onChange={e => set("stats", p.stats.map((x, j) => j === i ? { ...x, value: Number(e.target.value) } : x))} placeholder="value" className={inp} style={{ color: "var(--foreground)" }} />
            <input value={s.suffix} onChange={e => set("stats", p.stats.map((x, j) => j === i ? { ...x, suffix: e.target.value } : x))} placeholder="suffix" className={inp} style={{ color: "var(--foreground)" }} />
            <input value={s.label} onChange={e => set("stats", p.stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="label" className={inp} style={{ color: "var(--foreground)" }} />
          </div>
        ))}

        <div className="flex items-center justify-between">
          <span className={lbl} style={{ color: "var(--muted)" }}>Education</span>
          <button
            onClick={() => set("education", [...asEducation(p), { degree: "", school: "", score: "", years: "" }])}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {asEducation(p).map((edu, i) => (
          <div key={i} className="rounded-lg border border-[var(--border)] p-3 space-y-2" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>#{i + 1}</span>
              <button onClick={() => set("education", asEducation(p).filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-500 cursor-pointer transition-colors"><Trash2 size={12} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <input value={edu.degree} onChange={e => set("education", asEducation(p).map((x, j) => j === i ? { ...x, degree: e.target.value } : x))} placeholder="Degree" className={inp} style={{ color: "var(--foreground)" }} />
              <input value={edu.school} onChange={e => set("education", asEducation(p).map((x, j) => j === i ? { ...x, school: e.target.value } : x))} placeholder="School" className={inp} style={{ color: "var(--foreground)" }} />
              <input value={edu.score} onChange={e => set("education", asEducation(p).map((x, j) => j === i ? { ...x, score: e.target.value } : x))} placeholder="Score (optional)" className={inp} style={{ color: "var(--foreground)" }} />
              <input value={edu.years} onChange={e => set("education", asEducation(p).map((x, j) => j === i ? { ...x, years: e.target.value } : x))} placeholder="Years" className={inp} style={{ color: "var(--foreground)" }} />
            </div>
          </div>
        ))}
      </Group>

      {/* Contact */}
      <Group title="Contact & Social">
        <div><span className={lbl} style={{ color: "var(--muted)" }}>Contact line (under heading)</span>
          <input value={p.contactLine} onChange={e => set("contactLine", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><span className={lbl} style={{ color: "var(--muted)" }}>Email</span>
            <input value={p.email} onChange={e => set("email", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
          <div><span className={lbl} style={{ color: "var(--muted)" }}>LinkedIn URL</span>
            <input value={p.linkedin} onChange={e => set("linkedin", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
        </div>
        <div><span className={lbl} style={{ color: "var(--muted)" }}>GitHub URL</span>
          <input value={p.github} onChange={e => set("github", e.target.value)} className={inp} style={{ color: "var(--foreground)" }} /></div>
      </Group>
    </div>
  );
}

// ─── Awards tab ────────────────────────────────────────────────────────────────

function AwardsTab({ awards, onSave }: { awards: AwardItem[] | null; onSave: (a: AwardItem[]) => Promise<void> }) {
  const [items, setItems] = useState<AwardItem[]>(awards ?? []);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (awards) setItems(awards); }, [awards]);

  const doSave = async () => {
    setSaving(true); await onSave(items);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const update = (i: number, v: AwardItem) => setItems(arr => arr.map((x, j) => j === i ? v : x));
  const remove = (i: number) => { setItems(arr => arr.filter((_, j) => j !== i)); setEditing(null); };
  const add = () => { setItems(arr => [{ title: "", issuer: "", date: "", description: "" }, ...arr]); setEditing(0); };

  const inp = "w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer" style={{ color: "var(--muted)" }}>
          <Plus size={14} /> Add Award
        </button>
        <button onClick={doSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)]" style={{ background: "var(--surface-1)" }}>
          <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}>
                <Trophy size={16} style={{ color: "var(--accent)" }} />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title || <span style={{ color: "var(--muted)" }}>Untitled</span>}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{item.issuer} {item.date && `· ${item.date}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={e => { e.stopPropagation(); remove(i); }} className="cursor-pointer hover:text-red-400 transition-colors" style={{ color: "var(--muted)" }}><Trash2 size={14} /></button>
              {editing === i ? <ChevronUp size={14} style={{ color: "var(--muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted)" }} />}
            </div>
          </div>
          {editing === i && (
            <div className="px-5 pb-5 border-t border-[var(--border)] space-y-3" style={{ paddingTop: 16 }}>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={item.title} onChange={e => update(i, { ...item, title: e.target.value })} placeholder="Title" className={inp} style={{ color: "var(--foreground)" }} />
                <input value={item.issuer} onChange={e => update(i, { ...item, issuer: e.target.value })} placeholder="Issuer" className={inp} style={{ color: "var(--foreground)" }} />
              </div>
              <input value={item.date} onChange={e => update(i, { ...item, date: e.target.value })} placeholder="Date / Year" className={inp} style={{ color: "var(--foreground)" }} />
              <textarea value={item.description} onChange={e => update(i, { ...item, description: e.target.value })} placeholder="Description" rows={2} className={`${inp} resize-none`} style={{ color: "var(--foreground)" }} />
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>No awards yet.</p>}
    </div>
  );
}

// ─── Testimonials tab ──────────────────────────────────────────────────────────

function TestimonialsTab({ items: initial, onSave, uploadIcon }: {
  items: Testimonial[] | null;
  onSave: (t: Testimonial[]) => Promise<void>;
  uploadIcon: (f: File) => Promise<string>;
}) {
  const [items, setItems] = useState<Testimonial[]>(initial ?? []);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (initial) setItems(initial); }, [initial]);

  const doSave = async () => {
    setSaving(true); await onSave(items);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const update = (i: number, v: Testimonial) => setItems(arr => arr.map((x, j) => j === i ? v : x));
  const remove = (i: number) => { setItems(arr => arr.filter((_, j) => j !== i)); setEditing(null); };
  const add = () => { setItems(arr => [{ quote: "", author: "", role: "", company: "" }, ...arr]); setEditing(0); };

  const inp = "w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] outline-none focus:border-[var(--accent)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer" style={{ color: "var(--muted)" }}>
          <Plus size={14} /> Add Testimonial
        </button>
        <button onClick={doSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "var(--accent)" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)]" style={{ background: "var(--surface-1)" }}>
          <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: "var(--accent)" }}>
                {(item.author || "?").split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{item.author || <span style={{ color: "var(--muted)" }}>Anonymous</span>}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{item.role} {item.company && `· ${item.company}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={e => { e.stopPropagation(); remove(i); }} className="cursor-pointer hover:text-red-400 transition-colors" style={{ color: "var(--muted)" }}><Trash2 size={14} /></button>
              {editing === i ? <ChevronUp size={14} style={{ color: "var(--muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted)" }} />}
            </div>
          </div>
          {editing === i && (
            <div className="px-5 pb-5 border-t border-[var(--border)] space-y-3" style={{ paddingTop: 16 }}>
              <textarea value={item.quote} onChange={e => update(i, { ...item, quote: e.target.value })} placeholder="Quote" rows={3} className={`${inp} resize-none`} style={{ color: "var(--foreground)" }} />
              <div className="grid sm:grid-cols-3 gap-3">
                <input value={item.author} onChange={e => update(i, { ...item, author: e.target.value })} placeholder="Author" className={inp} style={{ color: "var(--foreground)" }} />
                <input value={item.role} onChange={e => update(i, { ...item, role: e.target.value })} placeholder="Role" className={inp} style={{ color: "var(--foreground)" }} />
                <input value={item.company} onChange={e => update(i, { ...item, company: e.target.value })} placeholder="Company" className={inp} style={{ color: "var(--foreground)" }} />
              </div>
              <div>
                <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Avatar (optional)</p>
                <IconUploader currentUrl={item.avatarUrl} uploadFn={uploadIcon}
                  onUpload={url => update(i, { ...item, avatarUrl: url || undefined })} />
              </div>
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>No testimonials yet.</p>}
    </div>
  );
}
