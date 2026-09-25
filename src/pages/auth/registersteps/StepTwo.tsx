import React from "react";
import type { FormikProps } from "formik";
import type { RegisterFormValues } from "../../../lib/formTypes";

interface StepProps {
  formik: FormikProps<RegisterFormValues>;
}

const StepTwo: React.FC<StepProps> = ({ formik }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Login Credentials
          </h3>
          <p className="text-gray-500 text-sm">Set up your login details.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Company Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Please enter email address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`w-full p-3 rounded-lg border ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-primary"
              } focus:outline-none focus:ring-2 transition-all`}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-xs text-red-500 font-medium">
                {formik.errors.email as string}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Please enter password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`w-full p-3 rounded-lg border ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-primary"
              } focus:outline-none focus:ring-2 transition-all`}
            />
            {formik.touched.password && formik.errors.password && (
              <span className="text-xs text-red-500 font-medium">
                {formik.errors.password as string}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
