import React from "react";
import type { FormikProps } from "formik";
import type { RegisterFormValues } from "../../../lib/formTypes";

interface StepProps {
  formik: FormikProps<RegisterFormValues>;
}

const StepThree: React.FC<StepProps> = ({ formik }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Company Logo</h3>
          <p className="text-gray-500 text-sm">
            Upload your company logo (Optional). You can skip this step.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-54 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {formik.values.logo ? (
                  <p className="mb-2 text-sm text-gray-500 font-semibold">
                    {formik.values.logo.name}
                  </p>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">SVG, PNG, or JPG</p>
                  </>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(event) => {
                  if (event.currentTarget.files) {
                    formik.setFieldValue("logo", event.currentTarget.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
