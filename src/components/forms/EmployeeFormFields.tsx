import React from "react";
import type { FormikProps } from "formik";
import FormattedInput from "../ui/FormattedInput";
import {
  EMPLOYMENT_TYPES,
  type EmployeeFormValues,
} from "../../services/demoEmployeeService";

const inputClass = (error?: string) =>
  `w-full text-textBlack border ${
    error ? "border-red-500" : "border-textBlack/10"
  } bg-backgroundBlack rounded-md px-4 h-[45px] text-sm outline-0 placeholder-black`;

const textareaClass = (error?: string) =>
  `w-full text-textBlack border ${
    error ? "border-red-500" : "border-textBlack/10"
  } bg-backgroundBlack rounded-md px-4 py-3 text-sm outline-0 placeholder-black resize-none`;

const fieldError = (
  formik: FormikProps<EmployeeFormValues>,
  key: keyof EmployeeFormValues,
): string | undefined =>
  formik.touched[key] && formik.errors[key]
    ? (formik.errors[key] as string)
    : undefined;

const formField = (
  label: string,
  children: React.ReactNode,
  error?: string,
  className?: string,
) => (
  <div className={`flex flex-col space-y-1 ${className ?? ""}`}>
    <label className="font-medium text-sm text-textBlack">{label}</label>
    {children}
    {error && <span className="text-red-500 pl-3 text-sm">{error}</span>}
  </div>
);

const sectionTitle = (title: string, sub: string) => (
  <div className="mb-4">
    <h3 className="font-semibold text-textBlack">{title}</h3>
    <p className="text-xs text-textBlack/50">{sub}</p>
  </div>
);

const EmployeeFormFields: React.FC<{
  formik: FormikProps<EmployeeFormValues>;
}> = ({ formik }) => {
  const grid = "grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4";

  return (
    <>
      <section className="flex flex-col space-y-4">
        {sectionTitle("Personal Information", "Basic details about the employee")}
        <div className={grid}>
          {formField(
            "First Name",
            <input
              type="text"
              name="first_name"
              placeholder="Enter first name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "first_name"))}
            />,
            fieldError(formik, "first_name"),
          )}
          {formField(
            "Last Name",
            <input
              type="text"
              name="last_name"
              placeholder="Enter last name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "last_name"))}
            />,
            fieldError(formik, "last_name"),
          )}
          {formField(
            "Email Address",
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "email"))}
            />,
            fieldError(formik, "email"),
          )}
          {formField(
            "Phone Number",
            <input
              type="tel"
              name="phone_number"
              placeholder="Enter phone number"
              value={formik.values.phone_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "phone_number"))}
            />,
            fieldError(formik, "phone_number"),
          )}
          <div className="md:col-span-2 xl:col-span-2">
            {formField(
              "Address",
              <textarea
                name="address"
                rows={2}
                placeholder="Enter address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={textareaClass(fieldError(formik, "address"))}
              />,
              fieldError(formik, "address"),
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col space-y-4 border-t border-textBlack/5 pt-6">
        {sectionTitle("Employment Details", "Job and employment information")}
        <div className={grid}>
          {formField(
            "Job Title",
            <input
              type="text"
              name="job_title"
              placeholder="Enter job title"
              value={formik.values.job_title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "job_title"))}
            />,
            fieldError(formik, "job_title"),
          )}
          {formField(
            "Employment Type",
            <select
              name="employment_type"
              value={formik.values.employment_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "employment_type"))}
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>,
            fieldError(formik, "employment_type"),
          )}
        </div>
      </section>

      <section className="flex flex-col space-y-4 border-t border-textBlack/5 pt-6">
        {sectionTitle("Payment Details", "Bank and pay information")}
        <div className={grid}>
          {formField(
            "Bank Name",
            <input
              type="text"
              name="bank_name"
              placeholder="Enter bank name"
              value={formik.values.bank_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "bank_name"))}
            />,
            fieldError(formik, "bank_name"),
          )}
          {formField(
            "Account Number",
            <input
              type="text"
              name="account_number"
              placeholder="Enter account number"
              value={formik.values.account_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "account_number"))}
            />,
            fieldError(formik, "account_number"),
          )}
          {formField(
            "Estimate Pay (₦)",
            <FormattedInput
              name="estimate_pay"
              placeholder="Enter estimated pay"
              value={formik.values.estimate_pay}
              onChange={({ target }) =>
                formik.setFieldValue("estimate_pay", target.value)
              }
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "estimate_pay"))}
            />,
            fieldError(formik, "estimate_pay"),
          )}
        </div>
      </section>
    </>
  );
};

export default EmployeeFormFields;