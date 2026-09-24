import React from "react";
import type { FormikProps } from "formik";
import type { RegisterFormValues } from "../../../lib/formTypes";

interface StepProps {
  formik: FormikProps<RegisterFormValues>;
}

const StepOne: React.FC<StepProps> = ({ formik }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Company Name</h3>
          <p className="text-gray-500 text-sm">
            What is the name of your company?
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="text"
            name="name"
            placeholder="e.g. PayFleet Org"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            className={`w-full p-3 rounded-lg border ${
              formik.touched.name && formik.errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
            } focus:outline-none focus:ring-2 transition-all`}
          />
          {formik.touched.name && formik.errors.name && (
            <span className="text-xs text-red-500 font-medium">
              {formik.errors.name as string}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepOne;
