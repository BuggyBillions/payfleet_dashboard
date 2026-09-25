import api from "../helpers/api";
import type {
  BankItem,
  BankAccountDetails,
  CreateAccountPayload,
} from "../lib/interfaces";

export type { BankItem, BankAccountDetails, CreateAccountPayload };

/**
 * Create a bank account: POST /create-account
 */
export const createAccountService = async (
  payload: CreateAccountPayload
): Promise<BankAccountDetails> => {
  const response = await api.post("/create-account", payload);
  return response.data?.data || response.data?.account || response.data;
};

/**
 * Get all banks: GET /all-banks?search=...
 */
export const getAllBanksService = async (
  search = ""
): Promise<BankItem[]> => {
  const params = search?.trim() ? { search: search.trim() } : {};
  const response = await api.get("/all-banks", { params });
  const resData = response.data;

  const rawList =
    resData?.data?.data ||
    resData?.data ||
    resData?.banks ||
    (Array.isArray(resData) ? resData : []);

  if (Array.isArray(rawList)) {
    return rawList.map((item) => ({
      id: item.id || item.code,
      name: item.name || item.bank_name || "Unknown Bank",
      code: item.code || item.bank_code || "",
      slug: item.slug || "",
      logo: item.logo || "",
    }));
  }

  return [];
};

/**
 * Get active/saved bank account: GET /get-account (only fetch the first account)
 */
export const getAccountService = async (): Promise<BankAccountDetails | null> => {
  const response = await api.get("/get-account");
  const resData = response.data;
  let rawAccount =
    resData?.data?.data ||
    resData?.data ||
    resData?.account ||
    resData?.accounts ||
    resData;

  if (Array.isArray(rawAccount)) {
    rawAccount = rawAccount.length > 0 ? rawAccount[0] : null;
  }

  if (
    rawAccount &&
    typeof rawAccount === "object" &&
    (rawAccount.bank_name || rawAccount.account_number || rawAccount.account_name)
  ) {
    return {
      id: rawAccount.id,
      bank_name: rawAccount.bank_name || "",
      account_number: rawAccount.account_number ? String(rawAccount.account_number) : "",
      account_name: rawAccount.account_name || "",
      bank_code: rawAccount.bank_code ? String(rawAccount.bank_code) : "",
      is_active: rawAccount.is_active,
      created_at: rawAccount.created_at,
      updated_at: rawAccount.updated_at,
    };
  }
  return null;
};

/**
 * Resolve bank account name: POST /resolve-account
 * payload: { account_number: 7064365473, bank_code: "999992" }
 */
export const resolveAccountService = async ({
  account_number,
  bank_code,
}: {
  account_number: string | number;
  bank_code: string;
}) => {
  const response = await api.post("/resolve-account", {
    account_number: String(account_number),
    bank_code: String(bank_code),
  });
  const resData = response.data;
  return resData?.data || resData?.account || resData;
};
