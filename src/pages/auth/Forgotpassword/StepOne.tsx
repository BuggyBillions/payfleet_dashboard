import React from "react";
import { useFormik } from "formik";
import { useAuth } from "../../../hooks/useAuth";

const StepOne: React.FC<{
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ currentPage, setCurrentPage }) => {
  const { forgotPasswordMutation } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: async (values) => {
        try {
          forgotPasswordMutation.mutate(values, {
            onSuccess: () => {
              setCurrentPage(currentPage + 1)
            }
          }); 
        } catch (error) {
          console.error(error)
        }
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email address"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {formik.touched.email && formik.errors.email && (
          <span className="text-xs text-red-500 font-medium">
            {formik.errors.email}
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

export default StepOne;
