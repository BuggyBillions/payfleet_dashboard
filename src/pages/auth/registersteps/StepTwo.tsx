import React, { useState } from "react";
import type { FormikProps } from "formik";
import type { RegisterFormValues } from "../../../lib/formTypes";
import PasswordStrengthIndicator from "../../../components/ui/PasswordStrengthIndicator";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface StepProps {
  formik: FormikProps<RegisterFormValues>;
}

const StepTwo: React.FC<StepProps> = ({ formik }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Account Information
          </h3>
          <p className="text-gray-500 text-sm">
            Set up your account information.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.phone}
            className={`w-full p-3 text-sm rounded-lg border ${
              formik.touched.phone && formik.errors.phone
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
            } focus:outline-none focus:ring-2 transition-all`}
          />
          {formik.touched.phone && formik.errors.phone && (
            <span className="text-xs text-red-500 font-medium">
              {formik.errors.phone as string}
            </span>
          )}
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Please enter password"
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
