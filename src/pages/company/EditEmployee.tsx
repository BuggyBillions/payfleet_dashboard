import React from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiArrowLeft } from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import EmployeeFormFields from "../../components/forms/EmployeeFormFields";
import { useUser } from "../../hooks/useUser";
import { getErrorMessage } from "../../helpers/api";
import {
  getEmployees,
  updateEmployee,
  employeeValidationSchema,
  type EmployeeFormValues,
} from "../../services/employeeService";

const EditEmployee: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const companyId = user?.company_details?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["employees", "detail", companyId, id],
    queryFn: () => getEmployees({ company_id: companyId, per_page: 500 }),
    enabled: Boolean(companyId && id),
  });

  const employee = data?.items?.find(
    (row) => String(row.id) === String(id),
  );

  const formik = useFormik<EmployeeFormValues>({
    enableReinitialize: true,
    initialValues: {
      first_name: employee?.first_name ?? "",
      last_name: employee?.last_name ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      address: employee?.address ?? "",
      job_title: employee?.job_title ?? "",
      employment_type: employee?.employment_type ?? "full-time",
      bank_name: employee?.bank_name ?? "",
      bank_code: employee?.bank_code ?? "",
      account_name: employee?.account_name ?? "",
      account_number: employee?.account_number ?? "",
      estimate_pay: employee?.estimate_pay ?? "",
    },
    validationSchema: employeeValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateEmployee(employee!.id, {
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

        toast.success("Employee updated");
        await queryClient.invalidateQueries({ queryKey: ["employees"] });
        navigate("/dashboard/employees");
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to update employee"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-textBlack/60 gap-2">
        <LuLoaderCircle className="animate-spin" size={20} />
        <span className="text-xs">Loading employee details...</span>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm text-textBlack/60">
          This employee could not be found.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/employees")}
          className="action-btn text-white text-xs rounded-md font-medium px-4 h-10 cursor-pointer"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate("/dashboard/employees")}
        className="flex items-center gap-1.5 self-start text-xs font-medium text-textBlack/60 hover:text-textBlack transition cursor-pointer"
      >
        <FiArrowLeft size={14} />
        Back to Employees
      </button>

      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-textBlack">Edit Employee</h2>
        <p className="text-sm text-textBlack/50">
          Edit {employee.first_name} {employee.last_name}&apos;s details
        </p>
      </div>

      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="w-full bg-tertiary rounded-xl p-5 md:p-8 flex flex-col space-y-6"
      >
        <EmployeeFormFields formik={formik} />

        <div className="flex flex-col sm:flex-row gap-4 border-t border-black/5 pt-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/employees")}
            className="bg-textBlack/20 text-xs rounded-md font-medium w-full sm:w-48 h-10 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="text-white bg-primary text-xs rounded-md font-medium w-full sm:w-48 h-10 cursor-pointer disabled:opacity-60"
          >
            {formik.isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
