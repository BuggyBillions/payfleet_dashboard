import api from "../helpers/api";

export interface UpdateCompanyDetailsPayload {
  address?: string;
  pin?: string;
}

export const updateCompanyDetails = async (
  payload: UpdateCompanyDetailsPayload,
): Promise<unknown> => {
  const res = await api.put("/update-company-details", payload);
  return res.data?.data ?? res.data;
};