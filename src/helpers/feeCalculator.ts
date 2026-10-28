import type { PaymentSettings } from "../services/paymentSettingsService";

export interface FeeBreakdown {
  vatPerEmployee: number;
  fedGovtFeePerEmployee: number;
  payfleetFeePerEmployee: number;
  totalFeePerEmployee: number;
  employeeCount: number;
  fgEligibleCount: number;
  totalVat: number;
  totalFedGovtFee: number;
  totalPayfleetFee: number;
  totalFees: number;
}

/**
 * Rounds a number to 2 decimal places to avoid floating-point precision issues.
 */
export const roundToTwoDecimals = (val: number): number => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

/**
 * Performs fee calculations for employee payouts based on payment settings.
 * VAT and Payfleet fees are charged per employee.
 * Federal Government Fee (EMTL) only applies per employee receiving more than ₦10,000.
 * If an individual employee's payout is ₦10,000 or lower, the FG fee is not charged for that employee.
 */
export const calculateFeeBreakdown = (
  settings: PaymentSettings | null | undefined,
  employeeCount: number = 1,
  totalPayoutAmount?: number,
  fgEligibleCount?: number,
): FeeBreakdown => {
  const count = Math.max(1, Math.floor(employeeCount || 1));
  const vat = Number(settings?.vat) || 0;
  const fedGovtFeePerUnit = Number(settings?.federal_government_fee) || 0;
  const payfleet = Number(settings?.payfleet_fee) || 0;

  // FG fee applies per employee receiving > 10,000.
  let eligibleCount = 0;
  if (typeof fgEligibleCount === "number") {
    eligibleCount = Math.max(0, Math.min(count, Math.floor(fgEligibleCount)));
  } else if (typeof totalPayoutAmount === "number") {
    if (count === 1) {
      eligibleCount = totalPayoutAmount > 10000 ? 1 : 0;
    } else {
      eligibleCount = totalPayoutAmount / count > 10000 ? count : 0;
    }
  }

  const totalVat = roundToTwoDecimals(vat * count);
  const totalPayfleetFee = roundToTwoDecimals(payfleet * count);
  const totalFedGovtFee = roundToTwoDecimals(fedGovtFeePerUnit * eligibleCount);
  const totalFees = roundToTwoDecimals(totalVat + totalPayfleetFee + totalFedGovtFee);
  const totalFeePerEmployee = roundToTwoDecimals(totalFees / count);

  return {
    vatPerEmployee: vat,
    fedGovtFeePerEmployee: fedGovtFeePerUnit,
    payfleetFeePerEmployee: payfleet,
    totalFeePerEmployee,
    employeeCount: count,
    fgEligibleCount: eligibleCount,
    totalVat,
    totalFedGovtFee,
    totalPayfleetFee,
    totalFees,
  };
};
