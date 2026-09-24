import { RxDashboard } from "react-icons/rx";
import { LuUsersRound, LuArrowDownToLine, LuHistory } from "react-icons/lu";
import { FaMoneyBillWave, FaUsers } from "react-icons/fa6";
import type { IconType } from "react-icons/lib";
import { LiaUsersCogSolid } from "react-icons/lia";
import { BsChat } from "react-icons/bs";

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
  // --- Company / Default Dashboard Navigation ---
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/dashboard/overview",
    role: ["company", "user"],
  },
  {
    name: "Employees",
    icon: LuUsersRound,
    role: ["company", "user"],
    children: [
      { name: "View Employees", path: "/dashboard/employees" },
      { name: "Add Employee", path: "/dashboard/employees/add" },
    ],
  },
  {
    name: "Deposits",
    icon: LuArrowDownToLine,
    path: "/dashboard/deposits",
    role: ["company", "user"],
  },
  {
    name: "Process Payments",
    icon: FaMoneyBillWave,
    path: "/dashboard/payments/process",
    role: ["company", "user"],
  },
  {
    name: "Payment History",
    icon: LuHistory,
    path: "/dashboard/payments/history",
    role: ["company", "user"],
  },

  // --- Super Admin Navigation ---
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/admin/dashboard/overview",
    role: ["superadmin", "super_admin", "admin"],
  },
  {
    name: "Manage Company",
    icon: FaUsers,
    path: "/admin/dashboard/company",
    role: ["superadmin", "super_admin", "admin"],
  },
  {
    name: "Manage Staff",
    icon: LiaUsersCogSolid,
    path: "/admin/dashboard/staff",
    role: ["superadmin", "super_admin", "admin"],
  },
  {
    name: "Manage Deposits",
    icon: LuArrowDownToLine,
    path: "/admin/dashboard/deposit",
    role: ["superadmin", "super_admin", "admin"],
  },
  {
    name: "Chat Support",
    icon: BsChat,
    path: "/admin/dashboard/chat",
    role: ["superadmin", "super_admin", "admin"],
  },

  // --- Financial Navigation ---
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/financial/dashboard/overview",
    role: ["financial", "finance"],
  },
  {
    name: "Manage Deposits",
    icon: LuArrowDownToLine,
    path: "/financial/dashboard/deposit",
    role: ["financial", "finance"],
  },

  // --- Support Navigation ---
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/support/dashboard/overview",
    role: ["support"],
  },
  {
    name: "Chat Support",
    icon: BsChat,
    path: "/support/dashboard/chat",
    role: ["support"],
  },
];