import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <>
      <div className="bg-primary min-h-screen w-full text-center flex justify-center items-center px-4 py-8 overflow-hidden">
        <div className="w-full flex justify-center">
          <div className="h-80 w-80 lg:w-120 lg:h-120 border-10 border-white rounded-[360px] flex justify-center flex-col items-center">
            <div>
              <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-white animate-bounce">
                404 Not Found
              </h1>

              <p className="text-white font-semibold text-sm sm:text-base mt-2">
                Look like you are on the wrong page !!
              </p>
            </div>

            <Link
              to="/"
              className="px-5 py-3 text-xs mt-8  border rounded-xl hover:bg-white hover:text-primary text-textBlack font-semibold transition cursor-pointer"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
