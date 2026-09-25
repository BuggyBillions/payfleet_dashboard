import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { assets } from "../../assets/assets";
import StepOne from "./Forgotpassword/StepOne";
import StepTwo from "./Forgotpassword/StepTwo";
import StepThree from "./Forgotpassword/StepThree";

const lineVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.4 },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

const Forgotpassword: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState(1);

  const steps = [
    { label: "Email address", component: StepOne, fields: ["email"] },
    { label: "Verification code", component: StepTwo, fields: ["otp"] },
    {
      label: "New password",
      component: StepThree,
      fields: ["password", "confirmPassword"],
    },
  ];

  const currentStep = Math.min(
    Math.max(currentScreen - 1, 0),
    steps.length - 1,
  );
  const CurrentStepComponent = steps[currentStep]?.component;
  const progressWidth = (currentScreen / steps.length) * 100;

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

  return (
    <div className="w-screen h-screen flex md:flex-row flex-col items-start bg-primary">
      <div className="md:h-full h-[35vh] overflow-hidden bg-primary md:w-1/2 w-full flex flex-col gap-4 items-start justify-center lg:px-8 md:px-6 px-0 pb-8 md:pt-0 pt-15 relative">
        <Link
          to={"/login"}
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
            Reset your password
          </h2>
          <p className="text-gray-500 mb-6">
            Follow the steps to create a new password for your account.
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8 overflow-hidden">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>

          <div>
            {CurrentStepComponent ? (
              <CurrentStepComponent
                setCurrentPage={setCurrentScreen}
                currentPage={currentScreen}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgotpassword;
