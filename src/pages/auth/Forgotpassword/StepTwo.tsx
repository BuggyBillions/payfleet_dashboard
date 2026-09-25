import React, { useRef } from "react";
import { useFormik } from "formik";
import { useAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../hooks/useUser";

const StepTwo: React.FC<{
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ currentPage, setCurrentPage }) => {
  const { OTPVerificationMutation } = useAuth();
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { getVerificationToken } = useUser();

  const V_TOKEN = getVerificationToken();

  const formik = useFormik({
    initialValues: {
      token: V_TOKEN ?? "",
      reset_otp: "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        OTPVerificationMutation.mutate(
          { token: values.token, reset_otp: String(values.reset_otp) },
          {
            onSuccess: () => {
              setCurrentPage(currentPage + 1);
            },
          },
        );
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-1">
        <p className="text-gray-500 text-sm">
          Enter the 6-digit code sent to your email.
        </p>

        <div className="flex items-center gap-6">
          {Array.from({ length: 6 }, (_, otpIndex) => (
            <input
              key={otpIndex}
              ref={(element) => {
                otpInputRefs.current[otpIndex] = element;
              }}
              type="text"
              inputMode="numeric"
              onBlur={formik.handleBlur}
              // onChange={formik.handleChange}
              // value={formik.values.reset_otp}
              maxLength={1}
              value={formik.values.reset_otp[otpIndex] || ""}
              onChange={(event) => {
                const digit = event.target.value.replace(/\D/g, "").slice(-1);
                const nextOtp = formik.values.reset_otp.split("");
                nextOtp[otpIndex] = digit;
                formik.setFieldValue("reset_otp", nextOtp.join("").slice(0, 6));
                if (digit && otpIndex < 5) {
                  otpInputRefs.current[otpIndex + 1]?.focus();
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Backspace" &&
                  !formik.values.reset_otp[otpIndex] &&
                  otpIndex > 0
                ) {
                  otpInputRefs.current[otpIndex - 1]?.focus();
                }
              }}
              className="w-12 h-12 text-center text-xl font-semibold rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={`reset_otp digit ${otpIndex + 1}`}
            />
          ))}
        </div>

        {formik.touched.reset_otp && formik.errors.reset_otp && (
          <span className="text-xs text-red-500 font-medium">
            {formik.errors.reset_otp}
          </span>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-6 h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed rounded-lg shadow font-medium transition-colors ${
            currentPage === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => formik.handleSubmit()}
          disabled={formik.isSubmitting}
          className="ml-auto px-6 h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-primary text-white rounded-lg shadow font-medium hover:bg-primary/90 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepTwo;
