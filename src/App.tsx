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
import SuperAdminOverview from "./pages/superadmin/Overview";
import FinancialOverview from "./pages/financial/Overview";
import SupportOverview from "./pages/support/Overview";


function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route index path="/login" element={<Login />} />
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
          path="/financial/dashboard/overview"
          element={
            <MainLayout pageName="Dashboard" children={<FinancialOverview />} />
          }
        />
        <Route
          index
          path="/support/dashboard/overview"
          element={
            <MainLayout pageName="Dashboard" children={<SupportOverview />} />
          }
        />
      </Routes>
    </>
  );
}

export default App;
