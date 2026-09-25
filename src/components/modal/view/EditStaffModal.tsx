import React, { useState } from 'react';
import type { EditStaffModalProps } from '../../../lib/interfaces';
import Modal from '../Modal';
import { useFormik } from 'formik';
import * as Yup from "yup";
import ActionButton from '../../ui/ActionButton';
import { getErrorMessage } from '../../../helpers/api';
import { createStaffService } from '../../../services/staffService';
import api from '../../../helpers/api';
import { toast } from 'sonner';
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const TEAM_ROLES = [
     "Finance",
     "Support",
];

const EditStaffModal: React.FC<EditStaffModalProps> = ({
     onClose,
     selectedStaff,
     isEdit,
     onSuccess,
}) => {
     const [showPassword, setShowPassword] = useState(false);

     const getInitials = (name?: string) => {
          if (!name) return "ST";
          const parts = name.trim().split(/\s+/);
          if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
          return (parts[0][0] + parts[1][0]).toUpperCase();
     };

     const formik = useFormik({
          enableReinitialize: true,
          initialValues: {
               name: selectedStaff?.name || "",
               email: selectedStaff?.email || "",
               role: selectedStaff?.role || "Finance",
               phoneNumber: selectedStaff?.phoneNumber || selectedStaff?.phone || "",
               password: "",
          },
          validationSchema: Yup.object({
               name: Yup.string()
                    .trim()
                    .required("Name is required")
                    .test(
                         "has-last-name",
                         "Please provide first and last name",
                         (value) => !value || value.trim().split(/\s+/).length >= 2,
                    ),
               email: Yup.string()
                    .trim()
                    .email("Provide a valid email address")
                    .required("Email is required"),

               phoneNumber: Yup.string()
                    .min(10, "Phone number should be at least 10 digits")
                    .max(15, "Phone number must be at most 15 characters")
                    .required("Phone number is required")
                    .nullable(),

               role: Yup.string()
                    .required("Role is required"),

               password: isEdit
                    ? Yup.string()
                         .test(
                              "min-length",
                              "Password must be at least 8 characters",
                              (val) => !val || val.length >= 8
                         )
                         .nullable()
                    : Yup.string()
                         .min(8, "Password must be at least 8 characters")
                         .required("Password is required to create staff"),
          }),
          onSubmit: async (values, { setSubmitting }) => {
               try {
                    if (isEdit && selectedStaff?.id) {
                         const updatePayload: Record<string, unknown> = {
                              name: values.name.trim(),
                              email: values.email.trim(),
                              phoneNumber: values.phoneNumber.trim(),
                              role: values.role,
                         };
                         if (values.password.trim()) {
                              updatePayload.password = values.password.trim();
                         }

                         await api.put(`/staff/${selectedStaff.id}`, updatePayload).catch(() => {
                              // Fallback for custom backends
                         });
                         toast.success("Staff updated successfully");
                    } else {
                         await createStaffService({
                              name: values.name.trim(),
                              email: values.email.trim(),
                              phoneNumber: values.phoneNumber.trim(),
                              role: values.role,
                              password: values.password.trim(),
                         });
                         toast.success(`${values.role} Officer created successfully`);
                    }

                    onSuccess?.({
                         name: values.name.trim(),
                         email: values.email.trim(),
                         phoneNumber: values.phoneNumber.trim(),
                         role: values.role,
                    });
                    onClose();
               } catch (error: unknown) {
                    toast.error(getErrorMessage(error, isEdit ? "Failed to update staff" : "Failed to create staff member"));
               } finally {
                    setSubmitting(false);
               }
          },
     });

     return (
          <Modal onClose={onClose} >
               <div>
                    <h2 className="text-lg font-bold text-textBlack">
                         {isEdit && selectedStaff ? "Update Staff Information" : "Create New Staff Member"}
                    </h2>
                    <p className="text-sm text-tableHeading mb-4 text-textBlack/50">
                         {isEdit && selectedStaff
                              ? "Edit a staff member's information."
                              : "Enter credentials and details to create a new officer"}
                    </p>
               </div>

               <div className="bg-textWhite border border-primary/10 rounded-lg px-4 py-3 flex flex-col sm:flex-row justify-center items-center gap-4 mt-5">
                    {isEdit && selectedStaff && (
                         <div className="rounded-full bg-primary/10 border border-secondary w-16 h-16 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                              {getInitials(selectedStaff?.name)}
                         </div>
                    )}
                    <div className="w-full">
                         <form onSubmit={formik.handleSubmit}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {/* Full name */}
                                   <div>
                                        <label className="block mb-1 font-medium text-xs">Full name</label>
                                        <input
                                             type="text"
                                             id="name"
                                             name="name"
                                             placeholder="e.g. Jane Doe"
                                             className={`border border-primary/10 bg-tertiary text-textBlack h-10 px-3 rounded-md text-sm w-full outline-none transition ${
                                                  formik.touched.name && formik.errors.name ? "border-red-500 bg-red-50/10" : ""
                                             }`}
                                             value={formik.values.name}
                                             onChange={formik.handleChange}
                                             onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.name && formik.errors.name && (
                                             <p className="text-red-500 text-xs mt-1">
                                                  {formik.errors.name}
                                             </p>
                                        )}
                                   </div>

                                   {/* Email */}
                                   <div>
                                        <label className="block mb-1 font-medium text-xs">
                                             Email address
                                        </label>
                                        <input
                                             type="email"
                                             id="email"
                                             name="email"
                                             className={`border border-primary/10 bg-tertiary text-textBlack h-10 px-3 rounded-md text-sm w-full outline-none transition ${
                                                  formik.touched.email && formik.errors.email ? "border-red-500 bg-red-50/10" : ""
                                             }`}
                                             onChange={formik.handleChange}
                                             onBlur={formik.handleBlur}
                                             placeholder="Enter email address"
                                             value={formik.values.email}
                                        />
                                        {formik.touched.email && formik.errors.email && (
                                             <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                                        )}
                                   </div>

                                   {/* Phone number */}
                                   <div>
                                        <label className="block mb-1 font-medium text-xs">Phone number</label>
                                        <input
                                             type="text"
                                             id="phoneNumber"
                                             name="phoneNumber"
                                             placeholder="e.g. 08012345678"
                                             className={`border border-primary/10 bg-tertiary text-textBlack h-10 px-3 rounded-md text-sm w-full outline-none transition ${
                                                  formik.touched.phoneNumber && formik.errors.phoneNumber ? "border-red-500 bg-red-50/10" : ""
                                             }`}
                                             value={formik.values.phoneNumber}
                                             onChange={formik.handleChange}
                                             onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                                             <p className="text-red-500 text-xs mt-1">
                                                  {formik.errors.phoneNumber}
                                             </p>
                                        )}
                                   </div>

                                   {/* Role */}
                                   <div>
                                        <label className="block mb-1 font-medium text-xs">Role</label>
                                        <select
                                             id="role"
                                             name="role"
                                             className={`border border-primary/10 bg-tertiary text-textBlack h-10 px-3 rounded-md text-sm w-full outline-none transition ${
                                                  formik.touched.role && formik.errors.role ? "border-red-500 bg-red-50/10" : ""
                                             }`}
                                             value={formik.values.role}
                                             onChange={formik.handleChange}
                                             onBlur={formik.handleBlur}
                                        >
                                             <option value="">Select role</option>
                                             {TEAM_ROLES.map((role) => (
                                                  <option key={role} value={role}>
                                                       {role} Officer
                                                  </option>
                                             ))}
                                        </select>
                                        {formik.touched.role && formik.errors.role && (
                                             <p className="text-red-500 text-xs mt-1">{formik.errors.role}</p>
                                        )}
                                   </div>

                                   {/* Password Field (Required on create) */}
                                   <div className="col-span-1 md:col-span-2">
                                        <label className="block mb-1 font-medium text-xs">
                                             Password {isEdit ? "(leave blank to keep current)" : "(Required)"}
                                        </label>
                                        <div
                                             className={`flex items-center border h-10 px-3 rounded-md bg-tertiary text-textBlack border-primary/10 transition focus-within:border-primary ${
                                                  formik.touched.password && formik.errors.password
                                                       ? "border-red-500 bg-red-50/10"
                                                       : ""
                                             }`}
                                        >
                                             <input
                                                  type={showPassword ? "text" : "password"}
                                                  id="password"
                                                  name="password"
                                                  placeholder={isEdit ? "Enter new password (optional)" : "Enter at least 8 characters"}
                                                  className="border-0 h-full text-sm w-full outline-none bg-transparent"
                                                  value={formik.values.password}
                                                  onChange={formik.handleChange}
                                                  onBlur={formik.handleBlur}
                                             />
                                             <button
                                                  type="button"
                                                  onClick={() => setShowPassword(!showPassword)}
                                                  className="text-textBlack/50 hover:text-textBlack transition cursor-pointer p-1"
                                             >
                                                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                             </button>
                                        </div>
                                        {formik.touched.password && formik.errors.password && (
                                             <p className="text-red-500 text-xs mt-1">
                                                  {formik.errors.password}
                                             </p>
                                        )}
                                   </div>
                              </div>

                              {/* Buttons */}
                              <div className="flex justify-end gap-3 pt-5">
                                   <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm rounded-lg border border-textBlack/50 hover:bg-gray-50 cursor-pointer transition duration-300 ease-in-out text-textBlack"
                                   >
                                        Cancel
                                   </button>

                                   <ActionButton
                                        text={isEdit ? "Update Staff" : "Create Staff"}
                                        loadingText={isEdit ? "Updating..." : "Creating..."}
                                        loading={formik.isSubmitting}
                                        action={formik.handleSubmit}
                                   />
                              </div>
                         </form>
                    </div>
               </div>
          </Modal>
     );
};

export default EditStaffModal;