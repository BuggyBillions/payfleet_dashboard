import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { decryptToken } from "../../helpers/tokenHelper";
import { getUserService } from "../../services/authService";
import { assets } from "../../assets/assets";

const AuthRedirect = () => {
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const { setToken, setRole, setUser } = useUser();

  useEffect(() => {
    const urlToken = urlParams.get("token");
    const hasRefreshed = sessionStorage.getItem("hasRefreshed");

    if (!hasRefreshed) {
      if (urlToken) {
        sessionStorage.setItem("tempToken", urlToken);
      }

      sessionStorage.setItem("hasRefreshed", "true");
      window.location.reload();
      return;
    }

    const tempStored = sessionStorage.getItem("tempToken");
    const encryptedToken = urlToken || tempStored;
    console.log(encryptedToken);

    if (!encryptedToken) {
      console.log("No token found after reload");
      return;
    }

    const verifyAndRedirect = async () => {
      let token;
      try {
        token = await decryptToken(encryptedToken);
      } catch {
        console.log("Failed to decode or decrypt token");
        return;
      }
      try {
        console.log(token);
        if (!token) return;
        console.log("verification started");
        const data = await getUserService(token);
        if (data) {
          setToken(token);
          setUser(data);
          if (data.role) {
            setRole(data.role);
            localStorage.setItem("role", data.role);
          }
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.setItem("token", token);
        }
        setTimeout(() => {
          let finalRoute = "/dashboard/overview";
          const userRole = (data?.role || "").toLowerCase();

          switch (userRole) {
            case "admin":
            case "superadmin":
              finalRoute = "/admin/dashboard/overview";
              break;
            case "financial":
            case "finance":
              finalRoute = "/financial/dashboard/overview";
              break;
            case "support":
              finalRoute = "/support/dashboard/overview";
              break;
            case "company":
            default:
              finalRoute = "/dashboard/overview";
              break;
          }

          navigate(finalRoute);
        }, 1000);
      } catch {
        // Keep session intact based on stored credentials
      }
    };

    verifyAndRedirect();
  }, [navigate, setRole, setToken, setUser, urlParams]);

  return (
    <div className="relative flex h-dvh w-screen flex-col items-center justify-center overflow-hidden bg-white">
      <div className="absolute h-56 w-56 rounded-full bg-primary/10 blur-[90px]" />

      <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary/10 border-t-primary [animation-duration:1.2s]" />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-3">
          <img
            src={assets.logo}
            alt="Payfleet"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold tracking-tight text-gray-900">
        Welcome back
      </h2>

      <p className="mt-1.5 text-sm text-gray-500">Preparing your account...</p>

      <div className="mt-6 flex items-center gap-1.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthRedirect;
