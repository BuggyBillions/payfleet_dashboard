import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiMinusCircle } from "react-icons/fi";
import Modal from "./Modal";
import FormattedInput from "../ui/FormattedInput";
import { formatterUtility } from "../../helpers/formatterUtility";
import { useDeductSalary } from "../../hooks/useEmployeeDeduction";
import type { ReduceSalaryModalProps, ReductionValues } from "../../lib/interfaces";

const inputClass = (error?: string) =>
  `w-full text-black border ${
    error ? "border-red-500" : "border-black/10"
  } bg-backgroundBlack rounded-md px-4 h-[45px] text-sm outline-0 placeholder-black`;

const ReduceSalaryModal: React.FC<ReduceSalaryModalProps> = ({
  employee,
  onClose,
  onSaved,
}) => {
  const deductMutation = useDeductSalary();

  const formik = useFormik<ReductionValues>({
    initialValues: {
      amount: "",
      reason: "",
      no_of_month: 1,
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Amount must be a number")
        .positive("Amount must be greater than 0")
        .max(
          Number(employee.estimate_pay),
          `Amount cannot exceed ${formatterUtility(Number(employee.estimate_pay))}`,
        )
        .required("Amount is required"),
      reason: Yup.string().trim().required("A reason is required"),
      no_of_month: Yup.number()
        .typeError("Number of months must be a number")
        .integer("Number of months must be a whole number")
        .min(1, "Number of months must be at least 1")
        .max(12, "Number of months cannot exceed 12")
        .required("Number of months is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await deductMutation.mutateAsync({
          employee_id: employee.id,
          amount: Number(values.amount),
          reason: values.reason.trim(),
          no_of_month: Number(values.no_of_month),
        });
        onSaved();
      } finally {
        setSubmitting(false);
      }
    },
  });

  const errorFor = (key: keyof ReductionValues): string | undefined =>
    formik.touched[key] && formik.errors[key]
      ? (formik.errors[key] as string)
      : undefined;

  const isSubmitting = formik.isSubmitting || deductMutation.isPending;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Deduct Salary</h2>
          <p className="text-sm text-gray-500">
            Record a salary deduction for {employee.first_name}{" "}
            {employee.last_name}
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-primary/10">
          <FiMinusCircle size={18} className="text-primary shrink-0" />
          <div className="flex flex-col gap-0.5 text-start">
            <p className="text-[10px] text-tableHeading">Current Salary</p>
            <p className="text-xl font-semibold">
              {formatterUtility(Number(employee.estimate_pay))}
            </p>
          </div>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="flex flex-col space-y-6"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm">
                Amount to Deduct (₦)
              </label>
              <FormattedInput
                name="amount"
                placeholder="Enter amount to deduct"
                value={formik.values.amount}
                onChange={({ target }) =>
                  formik.setFieldValue("amount", target.value)
                }
                onBlur={formik.handleBlur}
                className={inputClass(errorFor("amount"))}
              />
              {errorFor("amount") && (
                <span className="text-red-500 pl-3 text-sm">
                  {errorFor("amount")}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm">Reason</label>
              <textarea
                name="reason"
                rows={3}
                placeholder="Enter reason for deduction"
                value={formik.values.reason}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full text-black border ${
                  errorFor("reason") ? "border-red-500" : "border-black/10"
                } bg-backgroundBlack rounded-md px-4 py-3 text-sm outline-0 placeholder-black resize-none`}
              />
              {errorFor("reason") && (
                <span className="text-red-500 pl-3 text-sm">
                  {errorFor("reason")}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-medium text-sm">Number of Months</label>
              <input
                type="number"
                name="no_of_month"
                min={1}
                max={12}
                step={1}
                value={formik.values.no_of_month}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass(errorFor("no_of_month"))}
              />
              {errorFor("no_of_month") && (
                <span className="text-red-500 pl-3 text-sm">
                  {errorFor("no_of_month")}
                </span>
              )}
              <span className="text-xs text-gray-500 pl-3">
                Spread this deduction over how many months
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-black/5 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-xs rounded-md font-medium border border-black/10 w-full sm:w-48 h-10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="action-btn text-white text-xs rounded-md font-medium w-full sm:w-48 h-10 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Apply Deduction"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReduceSalaryModal;
