import { RxDashboard } from "react-icons/rx";
import { LuUsersRound, LuArrowDownToLine, LuHistory } from "react-icons/lu";
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
    role: ["company", "user"], path: "/dashboard/deposits" 
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
  {
    name: "Tier ",
    icon: LuHistory,
    path: "/dashboard/tier",
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
    role: ["superadmin", "super_admin", "admin"],
    children: [
      { name: "All Deposits", path: "/admin/dashboard/deposit" },
      { name: "Pending Deposits", path: "/admin/dashboard/deposit/pending" },
    ],
  },
  {
    name: "Manage Payments",
    icon: FaMoneyBillWave,
    path: "/admin/dashboard/payments",
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
    role: ["financial", "finance"],
    children: [
      { name: "All Deposits", path: "/financial/dashboard/deposit" },
      { name: "Pending Deposits", path: "/financial/dashboard/deposit/pending" },
    ],
  },
  {
    name: "Manage Payments",
    icon: FaMoneyBillWave,
    path: "/financial/dashboard/payments",
    role: ["financial", "finance"],
  },
  {
    name: "Chat Support",
    icon: BsChat,
    path: "/financial/dashboard/chat",
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