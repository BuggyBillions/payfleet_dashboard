import type { PaymentSettings } from "../services/paymentSettingsService";

export interface FeeBreakdown {
  vatPerEmployee: number;
  fedGovtFeePerEmployee: number;
  payfleetFeePerEmployee: number;
  totalFeePerEmployee: number;
  employeeCount: number;
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
 * All fees are charged per individual employee.
 * Total fee per employee = VAT + Federal Government Fee + Payfleet Fee.
 * Total fees = Total fee per employee * employee count.
 */
export const calculateFeeBreakdown = (
  settings: PaymentSettings | null | undefined,
  employeeCount: number = 1
): FeeBreakdown => {
  const count = Math.max(1, Math.floor(employeeCount || 1));
  const vat = Number(settings?.vat) || 0;
  const fedGovt = Number(settings?.federal_government_fee) || 0;
  const payfleet = Number(settings?.payfleet_fee) || 0;

  const totalFeePerEmployee = roundToTwoDecimals(vat + fedGovt + payfleet);
  const totalVat = roundToTwoDecimals(vat * count);
  const totalFedGovtFee = roundToTwoDecimals(fedGovt * count);
  const totalPayfleetFee = roundToTwoDecimals(payfleet * count);
  const totalFees = roundToTwoDecimals(totalFeePerEmployee * count);

  return {
    vatPerEmployee: vat,
    fedGovtFeePerEmployee: fedGovt,
    payfleetFeePerEmployee: payfleet,
    totalFeePerEmployee,
    employeeCount: count,
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
