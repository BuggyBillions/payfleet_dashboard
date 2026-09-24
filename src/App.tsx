import { Toaster } from "sonner";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

// Auth
import Login from "./pages/auth/Login";

// General
import NotFound from "./pages/view/NotFound";

import Overview from "./pages/company/Overview";
import Employees from "./pages/company/Employees";
import AddEmployee from "./pages/company/AddEmployee";
import Deposits from "./pages/company/Deposits";
import ProcessPayments from "./pages/company/ProcessPayments";
import PaymentHistory from "./pages/company/PaymentHistory";
import Settings from "./pages/company/Settings";
import SuperAdminOverview from "./pages/superadmin/Overview";
import FinancialOverview from "./pages/financial/Overview";
import FinancialPayment from "./pages/financial/Payment";
import SupportOverview from "./pages/support/Overview";
import Payment from "./pages/financial/Payment";
import ManageCompany from "./pages/superadmin/ManageCompany";
import ManageStaff from "./pages/superadmin/ManageStaff";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route index element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route
          index
          path="/dashboard/overview"
          element={<MainLayout pageName="Dashboard" children={<Overview />} />}
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
          element={<MainLayout pageName="Deposits" children={<Deposits />} />}
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
          path="/dashboard/settings"
          element={
            <MainLayout pageName="Settings" children={<Settings />} />
          }
        />
        <Route
          index
          path="/admin/dashboard/overview"
          element={<MainLayout pageName="Dashboard" children={<SuperAdminOverview />} />}
        />
        <Route
          index
          path="/admin/dashboard/company"
          element={<MainLayout pageName="Manage Company" children={<ManageCompany />} />}
        />
        <Route
          index
          path="/admin/dashboard/staff"
          element={<MainLayout pageName="Manage Staff" children={<ManageStaff />} />}
        />
        <Route
          index
          path="/financial/dashboard/overview"
          element={<MainLayout pageName="Dashboard" children={<FinancialOverview />} />}
        />
        <Route
          path="/financial/dashboard/payment"
          element={<MainLayout pageName="Approve Payments" children={<FinancialPayment />} />}
        />
           <Route
          index
          path="/financial/dashboard/approve"
          element={<MainLayout pageName="Dashboard" children={<Payment />} />}
        />
        <Route
          index
          path="/support/dashboard/overview"
          element={<MainLayout pageName="Dashboard" children={<SupportOverview />} />}
        />
      </Routes>
    </>
  );
}

export default App;
