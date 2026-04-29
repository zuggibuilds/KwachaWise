import { db } from '../db/index.js';

export interface PayeBreakdownItem {
  bandOrder: number;
  fromNgwee: number;
  toNgwee: number | null;
  taxableNgwee: number;
  ratePercent: number;
  taxNgwee: number;
}

export function calculatePaye(grossMonthlyNgwee: number, effectiveDate?: string): { payeNgwee: number; netPayNgwee: number; breakdown: PayeBreakdownItem[] } {
  const lookupDate = effectiveDate ?? new Date().toISOString().slice(0, 10);
  const bands = db
    .prepare(
      `SELECT band_order AS bandOrder, lower_bound_ngwee AS fromNgwee, upper_bound_ngwee AS toNgwee, rate_percent AS ratePercent, quick_deduction_ngwee AS quickDeductionNgwee
       FROM tax_bands
       WHERE effective_from = (
         SELECT MAX(effective_from) FROM tax_bands WHERE effective_from <= ?
       )
       ORDER BY band_order ASC`
    )
    .all(lookupDate) as Array<{ bandOrder: number; fromNgwee: number; toNgwee: number | null; ratePercent: number; quickDeductionNgwee: number }>;

  if (bands.length === 0) {
    throw new Error('No PAYE bands configured');
  }

  let totalTax = 0;
  const breakdown: PayeBreakdownItem[] = [];

  for (const band of bands) {
    const upper = band.toNgwee ?? grossMonthlyNgwee;
    const taxable = Math.max(0, Math.min(grossMonthlyNgwee, upper) - band.fromNgwee);
    const tax = taxable > 0 ? Math.round((taxable * band.ratePercent) / 100) : 0;
    totalTax += tax;

    breakdown.push({
      bandOrder: band.bandOrder,
      fromNgwee: band.fromNgwee,
      toNgwee: band.toNgwee,
      taxableNgwee: taxable,
      ratePercent: band.ratePercent,
      taxNgwee: tax
    });
  }

  const netPayNgwee = Math.max(0, grossMonthlyNgwee - totalTax);
  return { payeNgwee: totalTax, netPayNgwee, breakdown };
}
