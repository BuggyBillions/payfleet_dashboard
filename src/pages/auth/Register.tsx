import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useFormik } from "formik";
import { RegisterFormSchema } from "../../lib/validationSchemas";
import { getErrorMessage } from "../../helpers/api";
import { toast } from "sonner";
import StepOne from "./registersteps/StepOne";
import StepTwo from "./registersteps/StepTwo";
import StepThree from "./registersteps/StepThree";
import StepFour from "./registersteps/StepFour";
import { assets } from "../../assets/assets";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../lib/interfaces";
import type { RegisterFormValues } from "../../lib/formTypes";
import { createCompanyService } from "../../services/authService";

const lineVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.4 },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

const Register: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const navigate = useNavigate();

  const textSets = useMemo(
    () => [
      [
        "Welcome to PayFleet",
        "We can't wait to have you onboard",
        "Start paying salaries smarter today.",
      ],
      [
        "Whether you run a startup,",
        "SME, agency, or school - ",
        "PayFleet makes payroll painless.",
      ],
      [
        "Automate your payments",
        "Save time and reduce errors",
        "Focus on growing your business.",
      ],
    ],
    [],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % textSets.length);
        setVisible(true);
      }, 700);
    }, 5000);

    return () => clearInterval(interval);
  }, [textSets]);

  const steps = [
    { component: StepOne, fields: ["name"] },
    { component: StepTwo, fields: ["email", "password"] },
    { component: StepThree, fields: ["logo"] },
    { component: StepFour, fields: ["about", "address", "phone"] },
  ];

  const handleCompanyCreateMutation = useMutation({
    mutationFn: async (values: FormData) => {
      return await createCompanyService(values);
    },
    onSuccess: () => {
      toast.success("Company profile created successfully.");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      formik.setSubmitting(false);
      const data = error?.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        const fieldErrors: { [key: string]: string } = {};
        Object.entries(data.errors).forEach(([field, msgs]) => {
          fieldErrors[field] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        });
        formik.setErrors(fieldErrors);

        // Jump back to the step containing the invalid field
        const stepIndex = steps.findIndex((step) =>
          step.fields.some((f) => fieldErrors[f])
        );
        if (stepIndex !== -1) {
          setCurrentStep(stepIndex);
        }
      }
      toast.error(
        getErrorMessage(
          error,
          "An error occurred during registration. Please try again."
        )
      );
    },
    onSettled: () => {
      formik.setSubmitting(false);
    },
  });

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      name: "",
      email: "",
      logo: null,
      about: "",
      address: "",
      phone: "",
      password: "",
    },
    validationSchema: RegisterFormSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("about", values.about);
      formData.append("address", values.address);
      formData.append("phone", values.phone);
      if (values.logo) {
        formData.append("logo", values.logo);
      }

      handleCompanyCreateMutation.mutate(formData);
    },
  });

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    const touchedFields: { [key: string]: boolean } = {};
    fieldsToValidate.forEach((field) => {
      touchedFields[field] = true;
    });

    await formik.setTouched({ ...formik.touched, ...touchedFields });

    const errors = await formik.validateForm();
    const hasErrors = fieldsToValidate.some((field) =>
      Boolean(errors[field as keyof typeof errors])
    );

    if (!hasErrors) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-screen h-screen flex md:flex-row flex-col items-start bg-primary">
      <div className="md:h-full h-[35vh] overflow-hidden bg-primary md:w-1/2 w-full flex flex-col gap-4 items-start justify-center lg:px-8 md:px-6 px-0 pb-8 md:pt-0 pt-15 relative">
        <Link
          to={"/"}
          className="bg-white p-2 md:rounded-lg absolute md:top-8 md:h-auto h-15 top-0 md:left-8 left-0 lg:w-1/5 md:w-1/3 w-full"
        >
          <img
            src={assets.logo}
            alt="PayFleet Logo"
            className="md:w-full w-1/3 mx-auto object-cover"
          />
        </Link>
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3 md:px-0 px-4"
            >
              {textSets[index].map((line, i) => (
                <motion.p
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={lineVariants}
                  className="lg:text-3xl text-xl text-light-tetiary font-bold text-white"
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="md:w-1/2 w-full md:h-full h-[65vh] overflow-y-auto lg:p-12 p-8 flex flex-col md:justify-center bg-white md:rounded-none rounded-t-4xl">
        <div className="w-full">
          <h2 className="text-3xl text-start font-bold mb-6 text-gray-800">
            Create your account
          </h2>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <CurrentStepComponent formik={formik} />

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-6 h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed rounded-lg shadow font-medium transition-colors ${
                  currentStep === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Back
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={
                    handleCompanyCreateMutation.isPending || formik.isSubmitting
                  }
                  className="px-6 h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-primary text-white rounded-lg shadow font-medium hover:bg-primary/90 transition-colors"
                >
                  {handleCompanyCreateMutation.isPending || formik.isSubmitting
                    ? "Creating..."
                    : "Create Account"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-primary text-white rounded-lg shadow font-medium hover:bg-primary/90 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-primary font-medium cursor-pointer hover:underline"
            >
              Log in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
