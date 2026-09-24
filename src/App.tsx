import { Toaster } from "sonner";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/auth/Login";
import Overview from "./pages/Overview";
import NotFound from "./pages/view/NotFound";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route index element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route
          index
          path="/"
          element={<MainLayout pageName="Dashboard" children={<Overview />} />}
        />
        <Route
          index
          path="/dashboard/overview"
          element={<MainLayout pageName="Dashboard" children={<Overview />} />}
        />
      </Routes>
    </>
  );
}

export default App;
