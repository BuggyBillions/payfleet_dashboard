import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { FaMoneyBillWave } from "react-icons/fa6";
import Modal from "./Modal";
import FormattedInput from "../ui/FormattedInput";
import { formatterUtility } from "../../helpers/formatterUtility";
import { getErrorMessage } from "../../helpers/api";
import {
  updateEmployee,
  type Employee,
} from "../../services/employeeService";
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
  const formik = useFormik<ReductionValues>({
    initialValues: {
      amount: "",
      reason: "",
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Amount must be a number")
        .positive("Amount must be greater than 0")
        .max(
          employee.estimate_pay,
          `Amount cannot exceed ${formatterUtility(employee.estimate_pay)}`,
        )
        .required("Amount is required"),
      reason: Yup.string().trim().required("A reason is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const deduction = Number(values.amount);
      const updated: Employee = {
        ...employee,
        estimate_pay: Math.max(0, employee.estimate_pay - deduction),
      };
      try {
        await updateEmployee(employee.id, {
          estimate_pay: updated.estimate_pay,
        });
        toast.success(
          `${formatterUtility(deduction)} deducted from ${employee.first_name} ${employee.last_name}'s salary ${values.reason ? `- ${values.reason}` : ""}`,
        );
        onSaved(updated);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to apply deduction"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const errorFor = (key: keyof ReductionValues): string | undefined =>
    formik.touched[key] && formik.errors[key]
      ? (formik.errors[key] as string)
      : undefined;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Reduce Salary</h2>
          <p className="text-sm text-gray-500">
            Deduct an amount from {employee.first_name} {employee.last_name}'s
            salary before payment
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-primary/10">
          <FaMoneyBillWave size={18} className="text-primary shrink-0" />
          <div className="flex flex-col gap-0.5 text-start">
            <p className="text-[10px] text-tableHeading">Current Salary</p>
            <p className="text-xl font-semibold">
              {formatterUtility(employee.estimate_pay)}
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
                placeholder="Enter amount to remove"
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
              disabled={formik.isSubmitting}
              className="action-btn text-white text-xs rounded-md font-medium w-full sm:w-48 h-10 cursor-pointer disabled:opacity-60"
            >
              {formik.isSubmitting ? "Applying..." : "Apply Deduction"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReduceSalaryModal;