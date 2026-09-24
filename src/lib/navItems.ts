import { RxDashboard } from "react-icons/rx";
import { LuUsersRound, LuArrowDownToLine, LuHistory } from "react-icons/lu";
import { FaMoneyBillWave, FaUsers } from "react-icons/fa6";
import type { IconType } from "react-icons/lib";
import { LiaUsersCogSolid } from "react-icons/lia";

export interface NavChild {
  name: string;
  path: string;
}

export interface NavItem {
  name: string;
  icon: IconType;
  path?: string;
  role: string[];
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/dashboard/overview",
    role: ["company"],
  },
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/admin/dashboard/overview",
    role: ["admin"],
  },
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/financial/dashboard/overview",
    role: ["finance"],
  },
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/support/dashboard/overview",
    role: ["support"],
  },
  {
    name: "Employees",
    icon: LuUsersRound,
    role: ["company"],
    children: [
      { name: "Add Employee", path: "/dashboard/employees/add" },
      { name: "View Employees", path: "/dashboard/employees" },
    ],
  },
  {
    name: "Deposits",
    icon: LuArrowDownToLine,
    path: "/dashboard/deposits",
    role: ["company"],
  },
  {
    name: "Process Payments",
    icon: FaMoneyBillWave,
    path: "/dashboard/payments/process",
    role: ["company"],
  },
  {
    name: "Payment History",
    icon: LuHistory,
    path: "/dashboard/payments/history",
    role: ["company"],
  },
  {
    name: "Manage Company",
    icon: FaUsers,
    role: [""],
    children: [
      { name: "View Companies", path: "/admin/dashboard/company" },
    ],
  },
  {
    name: "Manage Staff",
    icon: LiaUsersCogSolid,
    path: "/admin/dashboard/staff",
    role: [""]
  }
];