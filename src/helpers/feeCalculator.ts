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
  employeeCount: number = 1,
  totalPayoutAmount?: number
): FeeBreakdown => {
  const count = Math.max(1, Math.floor(employeeCount || 1));
  const vat = Number(settings?.vat) || 0;
  // Federal Government Fee only applies to amount higher than 10,000; if lower, do not record
  const appliesFedGovtFee =
    typeof totalPayoutAmount === "number" && totalPayoutAmount > 10000;
  const fedGovt = appliesFedGovtFee
    ? Number(settings?.federal_government_fee) || 0
    : 0;
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
