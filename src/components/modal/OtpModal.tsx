import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { FiShield } from "react-icons/fi";
import Modal from "./Modal";
import api, { getErrorMessage } from "../../helpers/api";

interface OtpModalProps {
  onClose: () => void;
  onVerified: (data?: unknown) => void;
  endpoint?: string;
  title?: string;
  subtitle?: string;
  email?: string;
}

interface OtpValues {
  otp: string;
}

const OtpModal: React.FC<OtpModalProps> = ({
  onClose,
  onVerified,
  endpoint = "/verify-otp",
  title = "Verify OTP",
  subtitle = "Enter the 6-digit code sent to your email to continue",
  email,
}) => {
  const formik = useFormik<OtpValues>({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
        .required("OTP is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await api.post(endpoint, { otp: Number(values.otp) });
        if (response.status === 200 || response.status === 201) {
          toast.success(response.data?.message || "OTP verified successfully");
          onVerified(response.data);
        }
      } catch (error: unknown) {
        console.error(error);
        toast.error(getErrorMessage(error, "Invalid OTP"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal onClose={onClose}>
      <div className="py-4 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <FiShield size={22} className="text-primary" />
        </div>

        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          {subtitle}
          {email && (
            <>
              {" "}
              (sent to{" "}
              <span className="font-medium text-gray-700">{email}</span>)
            </>
          )}
        </p>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="w-full flex flex-col items-center space-y-4 mt-6"
        >
          <div className="flex flex-col items-center gap-1 w-full max-w-xs">
            <input
              type="text"
              name="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full h-14 text-center text-2xl font-semibold tracking-[0.4em] border rounded-lg outline-0 bg-backgroundBlack ${
                formik.touched.otp && formik.errors.otp
                  ? "border-red-500"
                  : "border-black/10 focus:border-primary"
              }`}
            />
            {formik.touched.otp && formik.errors.otp && (
              <span className="text-red-500 pl-3 text-sm">
                {formik.errors.otp}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs border-t border-black/5 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-xs rounded-md font-medium border border-black/10 w-full sm:w-1/2 h-11 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="action-btn text-white text-xs rounded-md font-medium w-full sm:w-1/2 h-11 cursor-pointer disabled:opacity-60"
            >
              {formik.isSubmitting ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default OtpModal;