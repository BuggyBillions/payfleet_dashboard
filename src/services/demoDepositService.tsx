import type { DemoDeposit } from "../lib/interfaces";
export type { DemoDeposit };

const seedDeposits: DemoDeposit[] = [
  {
    id: 1,
    reference: "PF-DEP-1001",
    amount: 250000,
    method: "Bank Transfer",
    status: "successful",
    date: "2026-09-21T09:15:00",
  },
  {
    id: 2,
    reference: "PF-DEP-1002",
    amount: 50000,
    method: "Bank Transfer",
    status: "successful",
    date: "2026-09-20T14:30:00",
  },
  {
    id: 3,
    reference: "PF-DEP-1003",
    amount: 120000,
    method: "Card",
    status: "pending",
    date: "2026-09-19T11:05:00",
  },
  {
    id: 4,
    reference: "PF-DEP-1004",
    amount: 75000,
    method: "Bank Transfer",
    status: "successful",
    date: "2026-09-18T16:45:00",
  },
  {
    id: 5,
    reference: "PF-DEP-1005",
    amount: 300000,
    method: "Bank Transfer",
    status: "failed",
    date: "2026-09-17T10:20:00",
  },
  {
    id: 6,
    reference: "PF-DEP-1006",
    amount: 90000,
    method: "Cash",
    status: "successful",
    date: "2026-09-16T12:10:00",
  },
];

export const getDemoDeposits = (): DemoDeposit[] => [...seedDeposits];