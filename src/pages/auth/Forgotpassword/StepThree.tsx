import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../hooks/useUser";

const StepThree: React.FC<{
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ currentPage, setCurrentPage }) => {
  const { resetPasswordMutation } = useAuth();
  const { getVerificationToken } = useUser();
  const navigate = useNavigate();

  const V_TOKEN = getVerificationToken();

  const formik = useFormik({
    initialValues: {
      token: V_TOKEN ?? "",
      password: "",
      confirmPassword: "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        resetPasswordMutation.mutate(values, {
          onSuccess: () => {
            navigate("/login");
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Create new password
        </label>

        <div className="flex flex-col gap-4">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="New password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {formik.touched.password && formik.errors.password && (
          <span className="text-xs text-red-500 font-medium">
            {formik.errors.password}
          </span>
        )}
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <span className="text-xs text-red-500 font-medium">
            {formik.errors.confirmPassword}
          </span>
        )}
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
          Next
        </button>
      </div>
    </div>
  );
};

export default StepThree;
