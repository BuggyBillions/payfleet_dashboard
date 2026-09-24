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
import SupportOverview from "./pages/support/Overview";

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
          path="/dashboard/employees"
          element={<MainLayout pageName="Employees" children={<Employees />} />}
        />
        <Route
          path="/dashboard/employees/add"
          element={
            <MainLayout pageName="Add Employee" children={<AddEmployee />} />
          }
        />
<Route
          path="/dashboard/deposits"
          element={<MainLayout pageName="Deposits" children={<Deposits />} />}
        />
        <Route
          path="/dashboard/payments/process"
          element={
            <MainLayout
              pageName="Process Payments"
              children={<ProcessPayments />}
            />
          }
        />
        <Route
          path="/dashboard/payments/history"
          element={
            <MainLayout
              pageName="Payment History"
              children={<PaymentHistory />}
            />
          }
        />
        <Route
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
          path="/financial/dashboard/overview"
          element={<MainLayout pageName="Dashboard" children={<FinancialOverview />} />}
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
