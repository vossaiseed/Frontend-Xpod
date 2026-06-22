export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Short Indian-format money, e.g. ₹50L, ₹1.5Cr.
export const inrShort = (n) => {
    const v = Number(n || 0);
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(v % 10000000 ? 1 : 0)}Cr`;
    if (v >= 100000) return `₹${Math.round(v / 100000)}L`;
    return `₹${v.toLocaleString("en-IN")}`;
};

export const TIERS = [
    { name: "Bronze", amount: 5000000, emoji: "🥉" },       // ₹50L
    { name: "Silver", amount: 10000000, emoji: "🥈" },      // ₹1Cr
    { name: "Gold", amount: 50000000, emoji: "🥇" },        // ₹5Cr
    { name: "Elite Closer", amount: 100000000, emoji: "👑" }, // ₹10Cr
];

/** Milestone progress for a given earnings total. */
export const milestoneProgress = (earnings = 0) => {
    const e = Number(earnings || 0);
    const next = TIERS.find((t) => e < t.amount) || null;
    const current = [...TIERS].reverse().find((t) => e >= t.amount) || null;
    const pct = next ? Math.min(100, Math.round((e / next.amount) * 100)) : 100;
    const remaining = next ? next.amount - e : 0;
    return { next, current, pct, remaining, earnings: e };
};
