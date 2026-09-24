import React from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import Modal from "./Modal";
import EmployeeFormFields from "../forms/EmployeeFormFields";
import {
  updateDemoEmployee,
  employeeValidationSchema,
  type DemoEmployee,
  type EmployeeFormValues,
} from "../../services/demoEmployeeService";

interface EditEmployeeModalProps {
  employee: DemoEmployee;
  onClose: () => void;
  onSaved: (updated: DemoEmployee) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  onClose,
  onSaved,
}) => {
  const formik = useFormik<EmployeeFormValues>({
    initialValues: {
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_number: employee.phone_number,
      address: employee.address,
      job_title: employee.job_title,
      employment_type: employee.employment_type,
      bank_name: employee.bank_name,
      account_number: employee.account_number,
      estimate_pay: employee.estimate_pay,
    },
    validationSchema: employeeValidationSchema,
    onSubmit: (values) => {
      const updated: DemoEmployee = {
        ...employee,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        phone_number: values.phone_number.trim(),
        address: values.address.trim(),
        job_title: values.job_title.trim(),
        employment_type: values.employment_type,
        bank_name: values.bank_name.trim(),
        account_number: values.account_number.trim(),
        estimate_pay: Number(values.estimate_pay) || 0,
      };
      updateDemoEmployee(updated);
      toast.success("Employee updated ");
      onSaved(updated);
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