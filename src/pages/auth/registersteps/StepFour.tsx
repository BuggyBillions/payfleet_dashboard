import React from "react";
import type { FormikProps } from "formik";
import type { RegisterFormValues } from "../../../lib/formTypes";

interface StepProps {
  formik: FormikProps<RegisterFormValues>;
}

const StepFour: React.FC<StepProps> = ({ formik }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Company Details
          </h3>
          <p className="text-gray-500 text-sm">
            Tell us more about your company.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              About Company
            </label>
            <textarea
              name="about"
              placeholder="Tell us about your company..."
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.about}
              rows={4}
              className={`w-full p-3 text-sm rounded-lg border ${
                formik.touched.about && formik.errors.about
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-primary"
              } focus:outline-none styled-scrollbar focus:ring-2 transition-all resize-none`}
            />
            {formik.touched.about && formik.errors.about && (
              <span className="text-xs text-red-500 font-medium">
                {formik.errors.about as string}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Company Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter company address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
              className={`w-full p-3 text-sm rounded-lg border ${
                formik.touched.address && formik.errors.address
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-primary"
              } focus:outline-none focus:ring-2 transition-all`}
            />
            {formik.touched.address && formik.errors.address && (
              <span className="text-xs text-red-500 font-medium">
                {formik.errors.address as string}
              </span>
            )}
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
        </div>
      </div>
    </div>
  );
};

export default StepFour;
