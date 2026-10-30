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

/**
 * Safely extracts any active deduction amount recorded against an employee.
 * Checks for `deducted_amount` first, then falls back to `deduction_amount`.
 */
export const getEmployeeDeductionAmount = (
  employee: {
    deducted_amount?: number | string | null;
    deduction_amount?: number | string | null;
  } | null | undefined
): number => {
  if (!employee) return 0;
  if (employee.deducted_amount !== undefined && employee.deducted_amount !== null) {
    const val = Number(employee.deducted_amount);
    return isNaN(val) ? 0 : Math.max(0, val);
  }
  if (employee.deduction_amount !== undefined && employee.deduction_amount !== null) {
    const val = Number(employee.deduction_amount);
    return isNaN(val) ? 0 : Math.max(0, val);
  }
  return 0;
};

/**
 * Calculates net payable salary for an employee:
 * Net Pay = Max(0, estimate_pay - deduction).
 * Checks if `deducted_amount` (or `deduction_amount`) exists and subtracts it.
 */
export const getEmployeeNetPay = (
  employee: {
    estimate_pay?: number | string;
    deducted_amount?: number | string | null;
    deduction_amount?: number | string | null;
  } | null | undefined
): number => {
  if (!employee) return 0;
  const gross = Number(employee.estimate_pay) || 0;
  const deduction = getEmployeeDeductionAmount(employee);
  return Math.max(0, roundToTwoDecimals(gross - deduction));
};
