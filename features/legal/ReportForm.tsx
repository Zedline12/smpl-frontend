"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

const CATEGORIES = [
  { id: "ncii", label: "Intimate image of me shared without my consent", hint: "Removed within 48 hours of a valid report; hidden right away while we review." },
  { id: "child_safety", label: "Child sexual abuse or exploitation", hint: "Hidden right away and reported to the authorities." },
  { id: "impersonation", label: "Deepfake or impersonation of me", hint: "Content using your face, body or voice without consent." },
  { id: "copyright", label: "Copyright infringement", hint: "A DMCA notice: you need to be the owner or act for them." },
  { id: "illegal", label: "Other illegal content", hint: "" },
  { id: "other", label: "Something else", hint: "" },
] as const;

const input = "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-white/30";

/** The public report form (TAKE IT DOWN Act, DSA notice-and-action, DMCA). */
export function ReportForm() {
  const params = useSearchParams();
  const [category, setCategory] = useState<string>(params.get("category") ?? "");
  const [urls, setUrls] = useState(params.get("url") ?? "");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("depicted");
  const [work, setWork] = useState("");
  const [goodFaith, setGoodFaith] = useState(false);
  const [accurate, setAccurate] = useState(false);
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; hidden: boolean } | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          urls: urls.split(/\s+/).map((u) => u.trim()).filter(Boolean),
          description,
          reporter: { name, email, relation },
          ...(category === "copyright" ? { statement: { work, goodFaith, accurate, signature } } : {}),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || json?.message || "Couldn't send the report");
      setDone(json?.data ?? json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <CheckCircle2 className="size-8 text-emerald-400" />
        <h2 className="mt-3 text-xl font-semibold text-white">Report received: {done.code}</h2>
        <p className="mt-2 text-sm text-white/60">
          {done.hidden ? "The content has been hidden while we review it. " : ""}We sent a confirmation to {email} and will email you when we decide.
        </p>
      </div>
    );

  const isCopyright = category === "copyright";
  const ready = category && urls.trim() && email && name && (!isCopyright || (work && goodFaith && accurate && signature));

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-white">What is the problem?</legend>
        {CATEGORIES.map((c) => (
          <label key={c.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${category === c.id ? "border-white/40 bg-white/[0.06]" : "border-white/10"}`}>
            <input type="radio" name="category" checked={category === c.id} onChange={() => setCategory(c.id)} className="mt-1" />
            <span>
              <span className="text-sm text-white">{c.label}</span>
              {c.hint && <span className="block text-xs text-white/45">{c.hint}</span>}
            </span>
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-white">Links to the content</span>
        <textarea value={urls} onChange={(e) => setUrls(e.target.value)} rows={3} placeholder="One link per line (smpl pages or file links)" className={`${input} h-auto py-2`} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-white">What&apos;s wrong (optional)</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={5000} className={`${input} h-auto py-2`} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-white">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-white">Your email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-white">You are</span>
        <select value={relation} onChange={(e) => setRelation(e.target.value)} className={input}>
          <option value="depicted">The person shown or heard</option>
          <option value="representative">Acting for that person (parent, lawyer, agent)</option>
          <option value="rights_holder">The rights holder / acting for them</option>
          <option value="other">Someone else</option>
        </select>
      </label>

      {isCopyright && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 p-4">
          <p className="text-sm font-medium text-white">Copyright notice (DMCA)</p>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-white/70">The copyrighted work (title, link or description)</span>
            <input value={work} onChange={(e) => setWork(e.target.value)} className={input} />
          </label>
          <label className="flex gap-2 text-[13px] text-white/70">
            <input type="checkbox" checked={goodFaith} onChange={(e) => setGoodFaith(e.target.checked)} />
            I believe in good faith that this use is not authorised by the owner, its agent or the law.
          </label>
          <label className="flex gap-2 text-[13px] text-white/70">
            <input type="checkbox" checked={accurate} onChange={(e) => setAccurate(e.target.checked)} />
            Under penalty of perjury, this notice is accurate and I am the owner or authorised to act for them.
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-white/70">Signature (type your full name)</span>
            <input value={signature} onChange={(e) => setSignature(e.target.value)} className={input} />
          </label>
          <p className="text-xs text-white/40">
            See our <Link href="/legal/copyright" className="underline">Copyright Policy</Link>. False notices can lead to liability.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={!ready || busy}
        className="bg-primary hover:bg-primary/90 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
      >
        {busy && <Loader2 className="size-4 animate-spin" />} Send report
      </button>
    </div>
  );
}
