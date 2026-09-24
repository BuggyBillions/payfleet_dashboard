import api from "../helpers/api";

export interface CompanyFundingPayload {
  company_id: number | string;
  amount: number;
}

export interface CompanyFundingResponse {
  reference?: string;
  reference_no?: string;
  transaction_reference?: string;
  ref?: string;
  [key: string]: unknown;
}

export interface BankAccount {
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_code?: string;
  [key: string]: unknown;
}

export const companyFunding = async (
  payload: CompanyFundingPayload,
): Promise<CompanyFundingResponse> => {
  const res = await api.post("/company-funding", payload);
  return (res.data?.data ?? res.data) as CompanyFundingResponse;
};

export const getAccount = async (
  company_id?: number | string,
): Promise<BankAccount> => {
  const res = await api.get("/get-account", {
    params: company_id ? { company_id } : undefined,
  });
  return (res.data?.data ?? res.data ?? {}) as BankAccount;
};