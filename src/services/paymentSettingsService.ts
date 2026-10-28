import api from "../helpers/api";

export interface PaymentSettings {
  id?: number | string;
  singleton?: number;
  vat: string | number;
  federal_government_fee: string | number;
  payfleet_fee: string | number;
  updated_by?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentSettingsPayload {
  vat: number | string;
  federal_government_fee: number | string;
  payfleet_fee: number | string;
}

/**
 * Retrieve the current payment fee settings.
 * GET /payment-settings
 */
export const getPaymentSettings = async (): Promise<PaymentSettings | null> => {
  const res = await api.get("/payment-settings");
  const data = res.data?.data !== undefined ? res.data.data : res.data;
  if (!data || typeof data !== "object") return null;
  return data as PaymentSettings;
};

/**
 * Create new payment settings when no configuration exists.
 * POST /payment-settings
 */
export const createPaymentSettings = async (
  payload: PaymentSettingsPayload
): Promise<PaymentSettings> => {
  const res = await api.post("/payment-settings", {
    vat: String(payload.vat),
    federal_government_fee: String(payload.federal_government_fee),
    payfleet_fee: String(payload.payfleet_fee),
  });
  const data = res.data?.data !== undefined ? res.data.data : res.data;
  return data as PaymentSettings;
};

/**
 * Update existing payment settings.
 * PUT /payment-settings
 */
export const updatePaymentSettings = async (
  payload: PaymentSettingsPayload
): Promise<PaymentSettings> => {
  const res = await api.put("/payment-settings", {
    vat: String(payload.vat),
    federal_government_fee: String(payload.federal_government_fee),
    payfleet_fee: String(payload.payfleet_fee),
  });
  const data = res.data?.data !== undefined ? res.data.data : res.data;
  return data as PaymentSettings;
};
