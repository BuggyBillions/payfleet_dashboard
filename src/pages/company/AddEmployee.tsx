import React from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import EmployeeFormFields from "../../components/forms/EmployeeFormFields";
import {
  addDemoEmployee,
  employeeValidationSchema,
  type DemoEmployeeInput,
  type EmployeeFormValues,
} from "../../services/demoEmployeeService";

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();

  const formik = useFormik<EmployeeFormValues>({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      address: "",
      job_title: "",
      employment_type: "full-time",
      bank_name: "",
      account_number: "",
      estimate_pay: "",
    },
    validationSchema: employeeValidationSchema,
    onSubmit: (values, { resetForm }) => {
      const input: DemoEmployeeInput = {
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
      addDemoEmployee(input);
      toast.success(
        `${input.first_name} ${input.last_name} added successfully `,
      );
      resetForm();
      navigate("/dashboard/employees");
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold">Add Employee</h2>
        <p className="text-sm text-gray-500">
          Fill in the details to add a new employee
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="w-full bg-tertiary rounded-xl p-5 md:p-8 flex flex-col space-y-6">
        <EmployeeFormFields formik={formik} />

        <div className="flex flex-col sm:flex-row gap-4 border-t border-black/5 pt-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/employees")}
            className="bg-textBlack/20 text-xs rounded-md font-medium  w-full sm:w-48 h-10 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="text-white bg-primary text-xs rounded-md font-medium w-full sm:w-48 h-10 cursor-pointer disabled:opacity-60"
          >
            {formik.isSubmitting ? "Saving..." : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;