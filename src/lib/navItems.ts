import { RxDashboard } from "react-icons/rx";
import { LuUsersRound, LuArrowDownToLine, LuHistory, LuBuilding2 } from "react-icons/lu";
import { FaMoneyBillWave, FaUsers } from "react-icons/fa6";
import { LiaUsersCogSolid } from "react-icons/lia";
import { BsChat } from "react-icons/bs";
import type { NavChild, NavItem } from "./interfaces";

export type { NavChild, NavItem };

export const navItems: NavItem[] = [
  // --- Company / Default Dashboard Navigation ---
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/dashboard/overview",
    role: ["company"],
  },
  {
    name: "Employees",
    icon: LuUsersRound,
    role: ["company"],
    children: [
      { name: "View Employees", path: "/dashboard/employees" },
      { name: "Add Employee", path: "/dashboard/employees/add" },
    ],
  },
  {
    name: "Deposits",
    icon: LuArrowDownToLine,
    role: ["company"], path: "/dashboard/deposits"
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
    name: "Tier ",
    icon: LuHistory,
    path: "/dashboard/tier",
    role: ["company"],
  },
  {
    name: "Notifications",
    icon: LuArrowDownToLine,
    path: "/dashboard/notifications",
    role: ["company", "user"],
  },

  // --- Super Admin Navigation ---
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/admin/dashboard/overview",
    role: ["admin"],
  },
  {
    name: "Manage Company",
    icon: FaUsers,
    path: "/admin/dashboard/company",
    role: ["admin"],
  },
  {
    name: "Manage Tiers",
    icon: LuBuilding2,
    path: "/admin/dashboard/tier",
    role: ["admin"],
  },
  {
    name: "Manage Staff",
    icon: LiaUsersCogSolid,
    path: "/admin/dashboard/staff",
    role: ["admin"],
  },
  {
    name: "Manage Banks",
    icon: LuBuilding2,
    path: "/admin/dashboard/banks",
    role: ["admin"],
  },
  {
    name: "Manage Deposits",
    icon: LuArrowDownToLine,
    role: ["admin"],
    path: "/admin/dashboard/deposit",
  },
  {
    name: "Manage Payments",
    icon: FaMoneyBillWave,
    path: "/admin/dashboard/payments",
    role: ["admin"],
  },
  {
    name: "Chat Support",
    icon: BsChat,
    path: "/admin/dashboard/chat",
    role: ["admin"],
  },

  // --- Financial Navigation ---
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/financial/dashboard/overview",
    role: ["finance"],
  },
  {
    name: "Manage Deposits",
    icon: LuArrowDownToLine,
    role: ["finance"],
    path: "/financial/dashboard/deposit"
  },
  {
    name: "Manage Payments",
    icon: FaMoneyBillWave,
    path: "/financial/dashboard/payments",
    role: ["finance"],
  },
  {
    name: "Chat Support",
    icon: BsChat,
    path: "/financial/dashboard/chat",
    role: ["finance"],
  },

  // --- Support Navigation ---
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/support/dashboard/overview",
    role: ["support"],
  },
  {
    name: "Manage Company",
    icon: FaUsers,
    path: "/support/dashboard/company",
    role: ["support"],
  },
  {
    name: "Chat Support",
    icon: BsChat,
    path: "/support/dashboard/chat",
    role: ["support"],
  },
];