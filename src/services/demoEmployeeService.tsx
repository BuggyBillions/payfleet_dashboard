import * as Yup from "yup";

export interface DemoEmployee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  job_title: string;
  employment_type: string;
  bank_name: string;
  account_number: string;
  estimate_pay: number;
  status: "Active" | "Inactive";
  is_payroll: boolean;
  addedAt: string;
}

export type DemoEmployeeInput = Omit<
  DemoEmployee,
  "id" | "status" | "is_payroll" | "addedAt"
>;

export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
];

export interface EmployeeFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  job_title: string;
  employment_type: string;
  bank_name: string;
  account_number: string;
  estimate_pay: number | string;
}

export const employeeValidationSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  job_title: Yup.string().required("Job title is required"),
  employment_type: Yup.string().required("Employment type is required"),
  bank_name: Yup.string().required("Bank name is required"),
  account_number: Yup.string()
    .matches(/^\d+$/, "Account number must be digits")
    .required("Account number is required"),
  estimate_pay: Yup.number()
    .typeError("Estimate pay must be a number")
    .positive("Estimate pay must be greater than 0")
    .required("Estimate pay is required"),
});

const STORAGE_KEY = "payfleet_demo_employees_v2";

const seedEmployees: DemoEmployee[] = [
  {
    id: 1,
    first_name: "Deji",
    last_name: "Doess",
    email: "deji@example.com",
    phone_number: "08012345678",
    address: "Lagos, Nigeria",
    job_title: "Software Engineer",
    employment_type: "full-time",
    bank_name: "OPay Digital Services Limited (OPay)",
    account_number: "7064365473",
    estimate_pay: 200000,
    status: "Active",
    is_payroll: true,
    addedAt: "2026-01-12",
  },
  {
    id: 2,
    first_name: "Adaeze",
    last_name: "Nwosu",
    email: "adaeze@payfleet.com",
    phone_number: "08098765432",
    address: "Enugu, Nigeria",
    job_title: "Accountant",
    employment_type: "full-time",
    bank_name: "Access Bank",
    account_number: "0123456789",
    estimate_pay: 180000,
    status: "Active",
    is_payroll: true,
    addedAt: "2026-02-03",
  },
  {
    id: 3,
    first_name: "Tunde",
    last_name: "Bakare",
    email: "tunde@payfleet.com",
    phone_number: "08123456789",
    address: "Ibadan, Nigeria",
    job_title: "Fleet Manager",
    employment_type: "full-time",
    bank_name: "GTBank",
    account_number: "0234567890",
    estimate_pay: 250000,
    status: "Active",
    is_payroll: true,
    addedAt: "2026-02-18",
  },
  {
    id: 4,
    first_name: "Chiamaka",
    last_name: "Eze",
    email: "chiamaka@payfleet.com",
    phone_number: "09012345678",
    address: "Abuja, Nigeria",
    job_title: "Support Officer",
    employment_type: "part-time",
    bank_name: "Kuda Bank",
    account_number: "0345678901",
    estimate_pay: 90000,
    status: "Inactive",
    is_payroll: false,
    addedAt: "2026-03-09",
  },
  {
    id: 5,
    first_name: "Ibrahim",
    last_name: "Musa",
    email: "ibrahim@payfleet.com",
    phone_number: "09123456780",
    address: "Kano, Nigeria",
    job_title: "Driver",
    employment_type: "contract",
    bank_name: "OPay Digital Services Limited (OPay)",
    account_number: "0456789012",
    estimate_pay: 120000,
    status: "Active",
    is_payroll: false,
    addedAt: "2026-04-22",
  },
  {
    id: 6,
    first_name: "Grace",
    last_name: "Adeyemi",
    email: "grace@payfleet.com",
    phone_number: "08109876543",
    address: "Port Harcourt, Nigeria",
    job_title: "HR Officer",
    employment_type: "full-time",
    bank_name: "UBA",
    account_number: "0567890123",
    estimate_pay: 160000,
    status: "Active",
    is_payroll: true,
    addedAt: "2026-05-14",
  },
];

const getStoredEmployees = (): DemoEmployee[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as DemoEmployee[];
    } catch {
      // fall through to seed data
    }
  }
  return [...seedEmployees];
};

export const getDemoEmployees = (): DemoEmployee[] => getStoredEmployees();

export const addDemoEmployee = (input: DemoEmployeeInput): DemoEmployee => {
  const employees = getStoredEmployees();
  const id =
    employees.length > 0
      ? Math.max(...employees.map((emp) => emp.id)) + 1
      : 1;

  const newEmployee: DemoEmployee = {
    ...input,
    id,
    status: "Active",
    is_payroll: false,
    addedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newEmployee, ...employees]),
  );

  return newEmployee;
};

export const updateDemoEmployee = (
  updated: DemoEmployee,
): DemoEmployee[] => {
  const employees = getStoredEmployees();
  const index = employees.findIndex((emp) => emp.id === updated.id);
  if (index !== -1) {
    employees[index] = updated;
  } else {
    employees.unshift(updated);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  return employees;
};

export const toggleEmployeePayroll = (
  id: number,
): DemoEmployee | undefined => {
  const employees = getStoredEmployees();
  const employee = employees.find((emp) => emp.id === id);
  if (!employee) return undefined;
  employee.is_payroll = !employee.is_payroll;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  return employee;
};