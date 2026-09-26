import * as Yup from "yup";
import api from "../helpers/api";
import type {
  Bank,
  Employee,
  EmployeeDeduction,
  EmployeeDeductionListResponse,
  EmployeeListResponse,
  ResolvedAccount,
} from "../lib/interfaces";

export type {
  Employee,
  EmployeeDeduction,
  EmployeeDeductionListResponse,
  EmployeeFormValues,
  EmployeeListResponse,
  ResolvedAccount,
} from "../lib/interfaces";

export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "remote",
];

export const employeeValidationSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  job_title: Yup.string().required("Job title is required"),
  employment_type: Yup.string().required("Employment type is required"),
  bank_name: Yup.string().required("Bank name is required"),
  account_number: Yup.string()
    .matches(/^\d+$/, "Account number must be digits")
    .min(10, "Account number must be at least 10 digits")
    .required("Account number is required"),
  account_name: Yup.string().required("Account name is required"),
  estimate_pay: Yup.number()
    .typeError("Estimate pay must be a number")
    .positive("Estimate pay must be greater than 0")
    .required("Estimate pay is required"),
});

export interface GetEmployeesParams {
  company_id?: number | string;
  search?: string;
  employment_type?: string;
  page?: number;
  per_page?: number;
}

export const getEmployees = async (
  params: GetEmployeesParams = {},
): Promise<EmployeeListResponse> => {
  const res = await api.get("/my-employees", {
    params: {
      company_id: params.company_id || undefined,
      search: params.search?.trim() || undefined,
      employment_type: params.employment_type || undefined,
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
    },
  });

  const body = res.data?.data ?? res.data;
  const items: Employee[] = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : [];
  const currentPage =
    body?.current_page ?? body?.currentPage ?? params.page ?? 1;
  const lastPage = body?.last_page ?? body?.lastPage ?? 1;
  const total = body?.total ?? body?.totalItems ?? items.length;

  return {
    items,
    totalItems: total,
    totalPages: lastPage,
    currentPage,
  };
};

export interface CreateEmployeePayload {
  company_id: number | string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  job_title: string;
  employment_type: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  estimate_pay: number;
}

export const createEmployee = async (
  payload: CreateEmployeePayload,
): Promise<Employee> => {
  const res = await api.post("/create-employee", payload);
  return (res.data?.data ?? res.data) as Employee;
};

export const updateEmployee = async (
  id: number | string,
  payload: Partial<Omit<CreateEmployeePayload, "company_id">>,
): Promise<Employee> => {
  const res = await api.put(`/update-employee/${id}`, payload);
  return (res.data?.data ?? res.data) as Employee;
};

export const deleteEmployee = async (id: number | string): Promise<void> => {
  await api.delete(`/delete-employee/${id}`);
};

export interface DeductSalaryPayload {
  employee_id: number | string;
  amount: number;
  reason: string;
  no_of_month: number;
}

export const deductSalary = async (
  payload: DeductSalaryPayload,
): Promise<EmployeeDeduction> => {
  const res = await api.post("/deduct-salary", {
    employee_id: payload.employee_id,
    amount: payload.amount,
    reason: payload.reason.trim(),
    no_of_month: payload.no_of_month,
  });
  return (res.data?.data ?? res.data) as EmployeeDeduction;
};

export interface GetEmployeeDeductionsParams {
  company_id?: number | string;
  search?: string;
  employee_id?: number | string;
  page?: number;
  per_page?: number;
}

export const getEmployeeDeductions = async (
  params: GetEmployeeDeductionsParams = {},
): Promise<EmployeeDeductionListResponse> => {
  const res = await api.get("/company-employee-deduction", {
    params: {
      company_id: params.company_id || undefined,
      search: params.search?.trim() || undefined,
      employee_id: params.employee_id || undefined,
      page: params.page ?? 1,
      per_page: params.per_page ?? 20,
    },
  });

  const body = res.data?.data ?? res.data;
  const raw: unknown[] = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : [];

  const items: EmployeeDeduction[] = raw.map((row, index) => {
    const record = (row ?? {}) as Record<string, unknown>;
    const employeeRecord = (record.employee ?? {}) as Record<string, unknown>;

    return {
      id: (record.id ?? record.deduction_id ?? index) as number | string,
      employee_id:
        (record.employee_id as number | string | undefined) ??
        (employeeRecord.id as number | string | undefined) ??
        null,
      amount: Number(
        record.amount ?? record.deduction_amount ?? record.total ?? 0,
      ),
      reason: String(
        record.reason ?? record.description ?? record.note ?? "",
      ),
      no_of_month: Number(
        record.no_of_month ?? record.months ?? record.number_of_months ?? 1,
      ),
      employee: employeeRecord as EmployeeDeduction["employee"],
      created_at: record.created_at as string | undefined,
      updated_at: record.updated_at as string | undefined,
    };
  });

  const currentPage = body?.current_page ?? body?.currentPage ?? params.page ?? 1;
  const lastPage = body?.last_page ?? body?.lastPage ?? 1;
  const total = body?.total ?? items.length;

  return {
    items,
    totalItems: Number(total) || items.length,
    totalPages: Number(lastPage) || 1,
    currentPage: Number(currentPage) || 1,
    totalAmount: items.reduce((sum, item) => sum + (item.amount || 0), 0),
  };
};

export const getBanks = async (search = ""): Promise<Bank[]> => {
  const res = await api.get("/all-banks", { params: { search } });
  const data = res.data?.data ?? res.data;
  if (!Array.isArray(data)) return [];

  return data
    .map((bank) => ({
      name: bank?.name ?? bank?.bank_name ?? "",
      code: String(bank?.code ?? bank?.bank_code ?? ""),
    }))
    .filter((bank) => bank.name && bank.code);
};

export const resolveAccount = async (
  account_number: string,
  bank_code: string,
): Promise<ResolvedAccount> => {
  const res = await api.post("/resolve-account", {
    account_number,
    bank_code,
  });
  return (res.data?.data ?? res.data) as ResolvedAccount;
};