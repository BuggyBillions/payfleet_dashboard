import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";
import { LuLoader } from "react-icons/lu";
import { assets } from "../../assets/assets";
import { toast } from "sonner";
import { getErrorMessage } from "../../helpers/api";
import { useFormik } from "formik";
import { useUser } from "../../hooks/useUser";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const { login } = useUser();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log(values);
      try {
        const response = await api.post("/login", values);
        console.log(response);
        if (response.status === 200 || response.status === 201) {
          console.log();
          const { user, token } = response.data.data;
          login(
            token,
            user,
            user.role,
          );
          toast.success("login sussessful");

          const finalRoute = user.role === "admin" ? "/admin/dashboard/overview" : "/dashboard/overview"
          navigate(finalRoute);
        }
      },
      onError: (error: unknown) => {
        console.error("Post-OTP login error:", error);
        toast.error(getErrorMessage(error));
      },
    });
  };

  const isLoggingIn = loginMutation.isPending || formik.isSubmitting;

  return (
    <div className="w-screen h-screen flex md:flex-row flex-col items-start bg-primary">
      <div className="md:h-full h-[35vh] overflow-hidden bg-primary md:w-1/2 w-full flex flex-col gap-4 items-start justify-center lg:px-8 md:px-6 px-0 pb-8 md:pt-0 pt-15 relative">
        <h1 className="text-white text-xl px-10 lg:px-0 lg:text-4xl lg:leading-12 lg:max-w-100 font-semibold">
          Welcome Back! Securely access your dashboard Manage.
        </h1>
        <Link
          to={"/"}
          className="bg-white p-2 md:rounded-lg absolute md:top-8 md:h-auto h-15 top-0 md:left-8 left-0 lg:w-1/5 md:w-1/3 w-full flex items-center justify-center"
        >
          <img
            src={assets.logo}
            alt="PayFleet Logo"
            className="md:w-full w-1/3 mx-auto object-cover"
          />
        </Link>
      </div>

      <div className="md:w-1/2 w-full md:h-full h-[65vh] overflow-y-auto lg:p-12 p-8 flex flex-col md:justify-center bg-white md:rounded-none rounded-t-4xl">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            Login to your account
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Enter your email and password to access your PayFleet account
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="email"
                id="email"
                className={`w-full border h-12 px-3 text-sm rounded-md outline-0 transition ${formik.touched.email && formik.errors.email
                    ? "border-red-500 bg-red-50/20 focus:border-red-500"
                    : "border-primary/20 focus:border-primary"
                  }`}
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgotpassword"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div
                className={`flex items-center border h-12 px-3 rounded-md transition ${formik.touched.password && formik.errors.password
                    ? "border-red-500 bg-red-50/20"
                    : "border-primary/20 focus-within:border-primary"
                  }`}
              >
                <input
                  type={passwordVisibility ? "text" : "password"}
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="password"
                  id="password"
                  className="w-full border-0 h-full text-sm outline-0 bg-transparent pr-2"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisibility(!passwordVisibility)}
                  className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1"
                >
                  {passwordVisibility ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-primary text-white rounded-lg shadow font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <LuLoader size={18} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/getstarted")}
              className="text-primary font-medium cursor-pointer hover:underline"
            >
              Get Started
            </span>
          </div>
        </div>
      </div>

      {showOtp && (
        <OtpModal
          email={pendingLogin?.email}
          onClose={() => setShowOtp(false)}
          onVerified={handleOtpVerified}
        />
      )}
    </div>
  );
};

export default Login;
