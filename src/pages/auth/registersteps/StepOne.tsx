import React from "react";
import type { FormikProps } from "formik";
import type { RegisterFormValues } from "../../../lib/formTypes";

interface StepProps {
  formik: FormikProps<RegisterFormValues>;
}

const StepOne: React.FC<StepProps> = ({ formik }) => {
  // const { data, isLoading, error } = useResolveCompanyRegNo(
  //   formik.values?.reg_no || "",
  // );

  // const { setFieldTouched, setFieldValue } = formik;

  // useEffect(() => {
  //   if (data) {
  //     setFieldTouched("name", true, false);
  //     setFieldValue("name", data, true);
  //   }
  // }, [data, setFieldValue, setFieldTouched]);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Personal Information
          </h3>
          <p className="text-gray-500 text-sm">
            Provide your personal information
          </p>
        </div>

        {/* <div>
          <h3 className="text-sm font-medium text-gray-700">Reg No.</h3>
        
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="text"
            name="reg_no"
            placeholder="e.g. 203455"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.reg_no}
            className={`w-full p-3 rounded-lg border ${
              formik.touched.reg_no && formik.errors.reg_no
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
            } focus:outline-none focus:ring-2 transition-all`}
          />
          {formik.touched.reg_no && formik.errors.reg_no && (
            <span className="text-xs text-red-500 font-medium">
              {formik.errors.reg_no as string}
            </span>
          )}
        </div> */}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            className={`w-full p-3 text-sm rounded-lg border ${
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

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
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

      {/* <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Company Name</h3>
        
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="text"
            name="name"
            placeholder={`Company registered name will autofill`}
            readOnly
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={`${isLoading ? "Getting company details..." : formik.values.name}`}
            className={`w-full p-3 rounded-lg border border-gray-300 read-only outline-0
           focus:outline-none transition-all`}
          />
          {error && (
            <span className="text-xs text-red-500 font-medium">
              {getErrorMessage(error || "Failed to resolve company name")}
            </span>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default StepOne;
