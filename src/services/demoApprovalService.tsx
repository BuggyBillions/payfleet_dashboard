import type { DemoApproval } from "../lib/interfaces";
export type { DemoApproval };

const seedApprovals: DemoApproval[] = [
  {
    id: 1,
    reference: "PF-APP-2001",
    company: "TicketPenty",
    amount: 250000,
    type: "deposit",
    date: "2026-09-22T10:30:00",
    status: "pending",
  },
  {
    id: 2,
    reference: "PF-APP-2002",
    company: "TicketPenty",
    amount: 120000,
    type: "payment",
    date: "2026-09-22T09:15:00",
    status: "pending",
  },
  {
    id: 3,
    reference: "PF-APP-2003",
    company: "Greenline Logistics",
    amount: 500000,
    type: "deposit",
    date: "2026-09-21T16:40:00",
    status: "pending",
  },
  {
    id: 4,
    reference: "PF-APP-2004",
    company: "Greenline Logistics",
    amount: 180000,
    type: "payment",
    date: "2026-09-21T12:05:00",
    status: "approved",
  },
  {
    id: 5,
    reference: "PF-APP-2005",
    company: "FastMove Rides",
    amount: 3200000,
    type: "deposit",
    date: "2026-09-20T11:20:00",
    status: "approved",
  },
  {
    id: 6,
    reference: "PF-APP-2006",
    company: "TicketPenty",
    amount: 75000,
    type: "payment",
    date: "2026-09-19T14:50:00",
    status: "declined",
  },
];

export const getDemoApprovals = (): DemoApproval[] => [...seedApprovals];