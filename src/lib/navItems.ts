import { RxDashboard } from "react-icons/rx";
import { LuUsersRound, LuArrowDownToLine, LuHistory } from "react-icons/lu";
import { FaMoneyBillWave } from "react-icons/fa6";
import type { IconType } from "react-icons/lib";

export interface NavChild {
  name: string;
  path: string;
}

export interface NavItem {
  name: string;
  icon?: IconType;
  path?: string;
  role: string[];
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/dashboard/overview",
    role: [""],
  },
  {
    name: "Employees",
    icon: LuUsersRound,
    role: [""],
    children: [
      { name: "Add Employee", path: "/dashboard/employees/add" },
      { name: "View Employees", path: "/dashboard/employees" },
    ],
  },
  {
    name: "Deposits",
    icon: LuArrowDownToLine,
    path: "/dashboard/deposits",
    role: [""],
  },
  {
    name: "Process Payments",
    icon: FaMoneyBillWave,
    path: "/dashboard/payments/process",
    role: [""],
  },
  {
    name: "Payment History",
    icon: LuHistory,
    path: "/dashboard/payments/history",
    role: [""],
  },
];