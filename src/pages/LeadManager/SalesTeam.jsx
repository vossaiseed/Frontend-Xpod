import { useEffect, useState } from "react";
import { Trophy, Medal, Users } from "lucide-react";
import { getSalesTeamStats } from "../../api/lookups.js";

/* ── helpers ──────────────────────────────────────────────────────────── */

// Map a stored proficiency label to an "n/10" badge (matches the design).
const PROF_SCORE = { Basic: 6, Intermediate: 8, Advanced: 9, Native: 10 };

const langChips = (languages = []) =>
  languages
    .map((l) => {
      if (typeof l === "string") return l;
      if (!l?.language) return null;
      const n = PROF_SCORE[l.proficiency] ?? 7;
      return `${l.language} ${n}/10`;
    })
    .filter(Boolean);

// Avatar colour pools (deterministic by first letter, so it's stable).
const AVATAR_TONES = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];
const toneFor = (name = "?") =>
  AVATAR_TONES[(name.charCodeAt(0) || 0) % AVATAR_TONES.length];

const pct = (assigned, capacity) =>
  capacity > 0 ? Math.min(100, Math.round((assigned / capacity) * 100)) : 0;

const Avatar = ({ name, size = "h-9 w-9 text-sm" }) => (
  <span className={`flex shrink-0 items-center justify-center rounded-full font-bold ${size} ${toneFor(name)}`}>
    {(name?.charAt(0) || "?").toUpperCase()}
  </span>
);

const MEDAL_TONES = ["text-amber-500", "text-slate-400", "text-orange-400"];

/* ── page ─────────────────────────────────────────────────────────────── */

const SalesTeam = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getSalesTeamStats();
      setStaff(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const performers = [...staff].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-5">
        {[0, 1].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border border-gray-100 bg-white" />
        ))}
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
        No sales staff yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── SALES STAFF LOAD ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500">
          Sales Staff Load
        </h2>
        <div className="space-y-4">
          {staff.map((m) => {
            const full = m.assigned >= m.capacity;
            return (
              <div key={m.id}>
                <div className="mb-1.5 flex items-center gap-3">
                  <Avatar name={m.name} size="h-6 w-6 text-xs" />
                  <span className="flex-1 truncate font-medium text-gray-900">{m.name}</span>
                  <span className="text-sm text-gray-500">
                    {m.assigned}/{m.capacity}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      full ? "bg-rose-50 text-rose-600" : "bg-green-50 text-green-600"
                    }`}
                  >
                    {full ? "Full" : "Open"}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-1.5 rounded-full ${full ? "bg-rose-500" : "bg-orange-500"}`}
                    style={{ width: `${pct(m.assigned, m.capacity)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TOP PERFORMERS ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
          <Trophy size={14} className="text-amber-500" /> Top Performers
        </h2>
        <div className="space-y-2">
          {performers.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                i === 0 ? "bg-amber-50" : "bg-gray-50"
              }`}
            >
              <Medal size={20} className={MEDAL_TONES[i] || "text-gray-400"} />
              <Avatar name={m.name} size="h-7 w-7 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-500">
                  {m.converted}/{m.assigned} · {m.conversionRate}% conversion
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-orange-500">{m.score}</p>
                <p className="text-xs text-gray-400">score</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ALL SALES STAFF ── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
          <Users size={14} /> All Sales Staff
        </h2>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {staff.map((m) => {
            const full = m.assigned >= m.capacity;
            const chips = langChips(m.languages);
            return (
              <div key={m.id} className="rounded-2xl border border-gray-100 p-4">
                {/* header */}
                <div className="flex items-start gap-3">
                  <Avatar name={m.name} size="h-11 w-11 text-base" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-gray-900">{m.name}</h3>
                    <p className="text-sm text-gray-500">{m.phone || "—"}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      full ? "bg-rose-50 text-rose-600" : "bg-green-50 text-green-600"
                    }`}
                  >
                    {full ? "Full" : "Open"}
                  </span>
                </div>

                {/* language chips */}
                {chips.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* stat boxes */}
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <Stat label="Assigned" value={m.assigned} tone="text-gray-900" />
                  <Stat label="Active" value={`${m.active}/${m.capacity}`} tone="text-rose-600" />
                  <Stat label="Converted" value={m.converted} tone="text-green-600" />
                  <Stat label="VIP" value={m.vip} tone="text-purple-600" />
                </div>

                {/* load bar */}
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-1.5 rounded-full ${full ? "bg-rose-500" : "bg-orange-500"}`}
                    style={{ width: `${pct(m.assigned, m.capacity)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const Stat = ({ label, value, tone }) => (
  <div className="rounded-xl border border-gray-100 py-2.5">
    <p className={`text-lg font-bold ${tone}`}>{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

export default SalesTeam;
