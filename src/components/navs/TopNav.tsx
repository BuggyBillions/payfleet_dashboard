import React from "react";
import { Link } from "react-router-dom";
import { PiBellSimple } from "react-icons/pi";
import { assets } from "../../assets/assets";

const TopNav: React.FC = () => {
  
  return (
    <div className="w-full py-2 flex gap-3 items-center justify-between">
      <img src={assets.logo} alt="Payfleet Logo" className="w-10" />
      <div className="flex gap-6 items-center">

        <Link to="">
          <PiBellSimple
            size={20}
            className="text-gray-600 hover:text-gray-900 transition"
          />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary uppercase flex items-center justify-center font-medium">
            <img src={assets.favicon} alt="Payfleet Logo" className="w-8" />
          </div>
          <div className="leading-2">
            <h3 className="truncate m-0 font-medium text-sm">
              Damola Oyegbemile
            </h3>
            <small className="uppercase font-medium text-[10px]">
              Admin manager
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
