import React from "react";
import { Link } from "react-router-dom";
import { PiBellSimple } from "react-icons/pi";
import { assets } from "../../assets/assets";
import ThemeToggle from "../ThemeToggle";

const TopNav: React.FC = () => {
  
  return (
    <div className="w-full py-3 flex gap-3 items-center justify-between">
      <img src={assets.logo} alt="Payfleet Logo" className="w-18 md:visible invisible" />
      <div className="flex gap-6 items-center">

        <Link to="">
          <PiBellSimple
            size={20}
            className="dark:text-white text-gray-600 hover:text-gray-900 dark:hover:text-white/75 transition"
          />
        </Link>

        <ThemeToggle />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary uppercase flex items-center justify-center font-medium">
            <img src={assets.favicon} alt="Payfleet Logo" className="w-8" />
          </div>
          <div className="leading-2 text-textBlack">
            <h3 className="truncate m-0 font-medium text-sm">
              Damola Oyegbemile
            </h3>
            <small className="uppercase font-medium text-[10px]">
              Admin
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
