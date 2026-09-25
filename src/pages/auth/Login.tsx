import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";
import { assets } from "../../assets/assets";
import { toast } from "sonner";
import api, { getErrorMessage } from "../../helpers/api";
import { useFormik } from "formik";
import { useUser } from "../../hooks/useUser";
import { LoginFormSchema } from "../../lib/validationSchemas";

const Login: React.FC = () => {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const { login } = useUser();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginFormSchema,
    onSubmit: async (values) => {
      console.log(values);
      try {
        const response = await api.post("/login", values);
        console.log(response);
        if (response.status === 200 || response.status === 201) {
          console.log();
          const { user, token } = response.data.data;
          login(token, user, user.role);
          toast.success("login sussessful");

          const finalRoute =
            user.role === "admin"
              ? "/admin/dashboard/overview"
              : "/dashboard/overview";
          navigate(finalRoute);
        }
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error));
      }
    },
  });

  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex md:flex-row flex-col items-start bg-primary">
      <div className="md:h-full h-[35vh] overflow-hidden bg-primary md:w-1/2 w-full flex flex-col gap-4 items-start justify-center lg:px-8 md:px-6 px-0 pb-8 md:pt-0 pt-15 relative">
        <h1 className="text-white text-xl px-10 lg:px-0 lg:text-4xl lg:leading-12 lg:max-w-100 font-semibold">
          Welcome Back! Securely access your dashboard Manage.
        </h1>
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
      </div>
      <div className="md:w-1/2 w-full md:h-full h-[65vh] overflow-y-auto lg:p-12 p-8 flex flex-col md:justify-center bg-white md:rounded-none rounded-t-4xl">
        <div className="w-full">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Login to your account
          </h2>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="email"
                id="email"
                className="w-full border h-12.5 border-primary/20 indent-3 rounded-md outline-0"
              />
              {formik.touched.email && formik.errors.email && (
                <span className="text-xs text-red-500">
                  {formik.errors.email}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password">Password</label>
              <div className="flex border h-12.5 border-primary/20 pe-3 rounded-md">
                <input
                  type={passwordVisibility ? "text" : "password"}
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="password"
                  id="password"
                  className="w-full border-0 h-full border-primary/20 indent-3 rounded-md outline-0"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisibility(!passwordVisibility)}
                >
                  {passwordVisibility ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="text-xs text-red-500">
                  {formik.errors.password}
                </span>
              )}
            </div>

            <div className="flex justify-end">
              Forgot password?{" "}
              <span
                onClick={() => navigate("/forgotpassword")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Rest Passeord
              </span>
            </div>

            <button
              type="submit"
              className="w-full px-6 h-12 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-primary text-white rounded-lg shadow font-medium hover:bg-primary/90 transition-colors"
            >
              {/* {handleCompanyLoginMutation.isPending || formik.isSubmitting
                ? "Logging in..."
                : "Login"} */}
              Login
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            <div>
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/getstarted")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Get Started
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
