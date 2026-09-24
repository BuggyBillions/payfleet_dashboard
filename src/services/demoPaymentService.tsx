export interface DemoPayment {
  id: number;
  reference: string;
  employee_name: string;
  amount: number;
  method: string;
  status: "successful" | "pending" | "failed";
  date: string;
}

const seedPayments: DemoPayment[] = [
  {
    id: 1,
    reference: "PF-PAY-5001",
    employee_name: "Deji Doess",
    amount: 200000,
    method: "Bank Transfer",
    status: "successful",
    date: "2026-09-21T10:30:00",
  },
  {
    id: 2,
    reference: "PF-PAY-5002",
    employee_name: "Adaeze Nwosu",
    amount: 180000,
    method: "Bank Transfer",
    status: "successful",
    date: "2026-09-21T10:32:00",
  },
  {
    id: 3,
    reference: "PF-PAY-5003",
    employee_name: "Tunde Bakare",
    amount: 250000,
    method: "Bank Transfer",
    status: "pending",
    date: "2026-09-21T10:35:00",
  },
  {
    id: 4,
    reference: "PF-PAY-5004",
    employee_name: "Grace Adeyemi",
    amount: 160000,
    method: "Bank Transfer",
    status: "successful",
    date: "2026-09-18T09:15:00",
  },
  {
    id: 5,
    reference: "PF-PAY-5005",
    employee_name: "Deji Doess",
    amount: 200000,
    method: "Bank Transfer",
    status: "successful",
    date: "2026-09-11T10:00:00",
  },
  {
    id: 6,
    reference: "PF-PAY-5006",
    employee_name: "Chiamaka Eze",
    amount: 90000,
    method: "Bank Transfer",
    status: "failed",
    date: "2026-09-11T10:05:00",
  },
];

export const getDemoPayments = (): DemoPayment[] => [...seedPayments];