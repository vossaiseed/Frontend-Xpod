// Single source of truth for sales commission. Every page (Earnings, Convert
// Lead modal, revenue calcs) computes commission the same way:
//
//   Commission = Converted Amount × Salesman's Commission %
//
// The rate comes from the sales staff record (sales_team.commission_rate).
// Falls back to DEFAULT_COMMISSION_PCT when not set yet.

export const DEFAULT_COMMISSION_PCT = 1;

/** Resolve a sales member's commission percentage (number). */
export const commissionPct = (member) => {
    const r = Number(member?.commission_rate);
    return Number.isFinite(r) && r > 0 ? r : DEFAULT_COMMISSION_PCT;
};

/** Commission amount for a deal value given the sales member. */
export const commissionAmount = (value, member) =>
    Math.round((Number(value || 0) * commissionPct(member)) / 100);
