import { Toaster } from "sonner";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Forgotpassword from "./pages/auth/Forgotpassword";

// General
import NotFound from "./pages/view/NotFound";

import Overview from "./pages/company/Overview";
import Employees from "./pages/company/Employees";
import AddEmployee from "./pages/company/AddEmployee";
import ProcessPayments from "./pages/company/ProcessPayments";
import PaymentHistory from "./pages/company/PaymentHistory";
import Settings from "./pages/company/Settings";
import SuperAdminOverview from "./pages/superadmin/Overview";
import FinancialOverview from "./pages/financial/Overview";
import SupportOverview from "./pages/support/Overview";
import ManageCompany from "./pages/superadmin/ManageCompany";
import ManageStaff from "./pages/superadmin/ManageStaff";
import ManageBanks from "./pages/superadmin/ManageBanks";
import ManageDeposit from "./pages/superadmin/ManageDeposit";
import SuperAdminManagePayments from "./pages/superadmin/ManagePayments";
import SuperAdminManageTier from "./pages/superadmin/ManageTier";
import FinancialManageDeposit from "./pages/financial/ManageDeposit";
import SupportManageCompany from "./pages/support/ManageCompany";
import SupportManageCompanyVerification from "./pages/support/ManageCompanyVerification";
import Communication from "./pages/chat/Communication";
import Notifications from "./pages/company/Notifications";
import ManageCompanyVerification from "./pages/superadmin/ManageCompanyVerification";
import Deposits from "./pages/company/Deposits";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route index path="/" element={<Login />} />
        <Route path="/getstarted" element={<Register />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="*" element={<NotFound />} />
        <Route
          index
          path="/dashboard/overview"
          element={<MainLayout pageName="Dashboard" children={<Overview />} />}
        />
        <Route
          index
          path="/dashboard/chat"
          element={<MainLayout pageName="Chat" children={<Communication />} />}
        />
        <Route
          index
          path="/dashboard/employees"
          element={<MainLayout pageName="Employees" children={<Employees />} />}
        />
        <Route
          index
          path="/dashboard/employees/add"
          element={
            <MainLayout pageName="Add Employee" children={<AddEmployee />} />
          }
        />
        <Route
          index
          path="/dashboard/deposits"
          element={
            <MainLayout
              pageName="All Deposits"
              children={<Deposits   />}
            />
          }
        />
        <Route
          index
          path="/dashboard/payments/process"
          element={
            <MainLayout
              pageName="Process Payments"
              children={<ProcessPayments />}
            />
          }
        />
        <Route
          index
          path="/dashboard/payments/history"
          element={
            <MainLayout
              pageName="Payment History"
              children={<PaymentHistory />}
            />
          }
        />
        <Route
          index
          path="/dashboard/notifications"
          element={
            <MainLayout
              pageName="Notifications"
              children={<Notifications />}
            />
          }
        />
        <Route
          index
          path="/dashboard/settings"
          element={<MainLayout pageName="Settings" children={<Settings />} />}
        />
        <Route
          index
          path="/admin/dashboard/overview"
          element={
            <MainLayout
              pageName="Dashboard"
              children={<SuperAdminOverview />}
            />
          }
        />
        <Route
          index
          path="/admin/dashboard/company"
          element={
            <MainLayout
              pageName="Manage Company"
              children={<ManageCompany />}
            />
          }
        />
        <Route
          index
          path="/admin/dashboard/company-verification"
          element={
            <MainLayout
              pageName="Companies Verification"
              children={<ManageCompanyVerification />}
            />
          }
        />
        <Route
          index
          path="/admin/dashboard/tier"
          element={
            <MainLayout
              pageName="Manage Tiers"
              children={<SuperAdminManageTier />}
            />
          }
        />
        <Route
          index
          path="/admin/dashboard/staff"
          element={
            <MainLayout pageName="Manage Staff" children={<ManageStaff />} />
          }
        />
        <Route
          index
          path="/admin/dashboard/banks"
          element={<MainLayout pageName="Manage Banks" children={<ManageBanks />} />}
        />
        <Route
          index
          path="/admin/dashboard/deposit"
          element={
            <MainLayout
              pageName="All Deposits"
              children={<ManageDeposit defaultFilter="all" />}
            />
          }
        />
        <Route
          index
          path="/admin/dashboard/payments"
          element={
            <MainLayout
              pageName="Manage Payments"
              children={<SuperAdminManagePayments />}
            />
          }
        />
        <Route
          index
          path="/admin/dashboard/chat"
          element={
            <MainLayout pageName="Support Chat" children={<Communication />} />
          }
        />
        <Route
          index
          path="/admin/dashboard/settings"
          element={<MainLayout pageName="Settings" children={<Settings />} />}
        />
        <Route
          index
          path="/financial/dashboard/overview"
          element={
            <MainLayout pageName="Dashboard" children={<FinancialOverview />} />
          }
        />
        <Route
          index
          path="/financial/dashboard/deposit"
          element={
            <MainLayout
              pageName="All Deposits"
              children={<FinancialManageDeposit defaultFilter="all" />}
            />
          }
        />
        <Route
          index
          path="/financial/dashboard/deposit/pending"
          element={
            <MainLayout
              pageName="All Deposits"
              children={<FinancialManageDeposit defaultFilter="pending" />}
            />
          }
        />
        <Route
          index
          path="/financial/dashboard/payments"
          element={
            <MainLayout
              pageName="Manage Payments"
              children={<SuperAdminManagePayments />}
            />
          }
        />
        <Route
          index
          path="/financial/dashboard/settings"
          element={<MainLayout pageName="Settings" children={<Settings />} />}
        />
        <Route
          index
          path="/support/dashboard/overview"
          element={
            <MainLayout pageName="Dashboard" children={<SupportOverview />} />
          }
        />
        <Route
          index
          path="/support/dashboard/company"
          element={
            <MainLayout
              pageName="Manage Company"
              children={<SupportManageCompany />}
            />
          }
        />
        <Route
          index
          path="/support/dashboard/company-verification"
          element={
            <MainLayout
              pageName="Companies Verification"
              children={<SupportManageCompanyVerification />}
            />
          }
        />
        <Route
          index
          path="/support/dashboard/settings"
          element={<MainLayout pageName="Settings" children={<Settings />} />}
        />
        <Route
          index
          path="/support/dashboard/chat"
          element={
            <MainLayout
              pageName="Live Support Chat"
              children={<Communication />}
            />
          }
        />
        <Route
          index
          path="/financial/dashboard/chat"
          element={
            <MainLayout
              pageName="Live Support Chat"
              children={<Communication />}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
