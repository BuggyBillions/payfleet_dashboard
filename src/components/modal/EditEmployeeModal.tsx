import React from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import Modal from "./Modal";
import EmployeeFormFields from "../forms/EmployeeFormFields";
import { getErrorMessage } from "../../helpers/api";
import {
  updateEmployee,
  employeeValidationSchema,
  type Employee,
  type EmployeeFormValues,
} from "../../services/employeeService";
import type { EditEmployeeModalProps } from "../../lib/interfaces";

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  onClose,
  onSaved,
}) => {
  const formik = useFormik<EmployeeFormValues>({
    initialValues: {
      first_name: employee.first_name ?? "",
      last_name: employee.last_name ?? "",
      email: employee.email ?? "",
      phone: employee.phone ?? "",
      address: employee.address ?? "",
      job_title: employee.job_title ?? "",
      employment_type: employee.employment_type ?? "full-time",
      bank_name: employee.bank_name ?? "",
      bank_code: employee.bank_code ?? "",
      account_name: employee.account_name ?? "",
      account_number: employee.account_number ?? "",
      estimate_pay: employee.estimate_pay ?? "",
    },
    validationSchema: employeeValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateEmployee(employee.id, {
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          job_title: values.job_title.trim(),
          employment_type: values.employment_type,
          bank_name: values.bank_name.trim(),
          account_name: values.account_name.trim(),
          account_number: values.account_number.trim(),
          estimate_pay: Number(values.estimate_pay) || 0,
        });

        const updated: Employee = {
          ...employee,
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          job_title: values.job_title.trim(),
          employment_type: values.employment_type,
          bank_name: values.bank_name.trim(),
          bank_code: values.bank_code || employee.bank_code,
          account_name: values.account_name.trim(),
          account_number: values.account_number.trim(),
          estimate_pay: Number(values.estimate_pay) || 0,
        };
        toast.success("Employee updated ");
        onSaved(updated);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to update employee"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Edit Employee</h2>
          <p className="text-sm text-gray-500">
            Edit {employee.first_name} {employee.last_name}'s details
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="flex flex-col space-y-6"
        >
          <EmployeeFormFields formik={formik} />

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
              {formik.isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditEmployeeModal;