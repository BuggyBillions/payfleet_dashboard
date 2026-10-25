import React, { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../hooks/useUser";
import { ResetPasswordSchema } from "../../../lib/validationSchemas";
import PasswordStrengthIndicator from "../../../components/ui/PasswordStrengthIndicator";
import { FiEye, FiEyeOff } from "react-icons/fi";

const StepThree: React.FC<{
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ currentPage, setCurrentPage }) => {
  const { resetPasswordMutation } = useAuth();
  const { getVerificationToken } = useUser();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const V_TOKEN = getVerificationToken();

  const formik = useFormik({
    initialValues: {
      token: V_TOKEN ?? "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        resetPasswordMutation.mutate(values, {
          onSuccess: () => {
            navigate("/");
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-4">
        {/* Create new password field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Create new password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`w-full p-3 pr-11 rounded-lg border ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-primary"
              } focus:outline-none focus:ring-2 transition-all`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-700 transition p-1"
            >
              {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </button>
          </div>

          <PasswordStrengthIndicator password={formik.values.password} />

          {formik.touched.password && formik.errors.password && (
            <span className="text-xs text-red-500 font-medium mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>

        {/* Confirm password field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              className={`w-full p-3 pr-11 rounded-lg border ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-primary"
              } focus:outline-none focus:ring-2 transition-all`}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-700 transition p-1"
            >
              {showConfirmPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </button>
          </div>

          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span className="text-xs text-red-500 font-medium mt-1">
              {formik.errors.confirmPassword}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-6 h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed rounded-lg shadow font-medium transition-colors ${
            currentPage === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => formik.handleSubmit()}
          disabled={formik.isSubmitting}
          className="ml-auto px-6 h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-primary text-white rounded-lg shadow font-medium hover:bg-primary/90 transition-colors"
        >
          {formik.isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

export default StepThree;
