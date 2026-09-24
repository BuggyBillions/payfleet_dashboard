import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api, { getErrorMessage } from "../../helpers/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login } = useUser();
  const navigate = useNavigate();

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
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await api.post("/login", values);
        console.log("response", response);

        if (response.status === 200 && response.data.data) {
          const data = response.data;
          login(data.data.token, data.data.user, data.data.role);
          const message = data.message || "Login successful!";
          console.log("data.data.role", data.data.role);

          toast.success(message);
          navigate(
            data.data.role === "user"
              ? "/dashboard/assigned-tasks"
              : "/dashboard/overview",
          );
        }
      } catch (error: unknown) {
        console.error("Failed to perform action: ", error);
        toast.error(getErrorMessage(error, "Failed to perform action"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-xl bg-white shadow-xl flex flex-col items-center justify-center px-4 py-8 rounded-2xl">
        <div className="w-full flex flex-col items-center justify-center">
          <span className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-semibold">
              Login into your account
            </h2>
            <p className="text-sm md:text-base">
              Enter your credentials to get access
            </p>
          </span>

          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col space-y-4 w-full max-w-md"
          >
            {/* Email */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="email" className="font-semibold">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`text-black border-outlineBlack bg-backgroundBlack ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-[#FBFCFB3]"
                } placeholder-black rounded-md px-4 h-[50px] border text-sm w-full outline-0`}
              />
              {formik.touched.email && formik.errors.email && (
                <span className="text-red-500 pl-3 text-sm">
                  {formik.errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="relative flex flex-col space-y-1">
              <label htmlFor="password" className="font-semibold">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`border border-outlineBlack bg-backgroundBlack pr-12 ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-backgroundBlack"
                } rounded-md px-4 h-[50px] outline-none w-full text-sm placeholder-black`}
              />
              <span
                className="absolute right-4 top-11 cursor-pointer text-black"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </span>
              {formik.touched.password && formik.errors.password && (
                <span className="text-red-500 pl-3 text-sm">
                  {formik.errors.password}
                </span>
              )}
            </div>

            {/* Forgot password */}
            <span className="self-end text-primary">
              <button
                type="button"
                className="font-medium text-sm cursor-pointer"
              >
                Forgot Password?
              </button>
            </span>

            {/* Buttons */}
            <div className="flex flex-col space-y-9 mt-4">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="bg-primary text-white font-medium rounded-md h-[45px] cursor-pointer disabled:opacity-70 transition"
              >
                {formik.isSubmitting ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
