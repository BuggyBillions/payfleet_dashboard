import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { MdSettings } from "react-icons/md";
import { navItems } from "../../lib/navItems";
import Modal from "../modal/Modal";
import { useUser } from "../../hooks/useUser";
import { assets } from "../../assets/assets";

const Sidebar = ({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);
  const { role, user, logout } = useUser();
  console.log(role)
  console.log(user)

  const filteredLinks = navItems.filter((navItem) =>
    navItem.role
      .map((r) => r.toLowerCase())
      .includes(role?.toLowerCase() ?? ""),
  );

  return (
    <div className="bg-white lg:w-full md:w-3/5 w-4/5 h-full px-2 py-4 md:pt-0 pt-8 flex flex-col">
      <img src={assets.logo} alt="Payfleet Logo" className="w-1/3 mx-auto md:hidden inline" />
      <ul className="px-3 lg:mt-4 mt-4 flex flex-col gap-2 h-4/5 overflow-y-scroll no-scrollbar pb-6">
        {filteredLinks.map((item, index) => {
          return (
            <NavLink
              key={index}
              to={item.path!}
              className={({
                isActive,
              }) => `flex items-center gap-2 text-black transition-all duration-300 border-0 hover:bg-primary hover:font-semibold hover:text-white hover:shadow-md px-4 py-2.5 rounded-md cursor-pointer text-[11px] ${
                isActive
                  ? "bg-primary text-white font-semibold shadow-md border border-primary/5"
                  : ""
              }
              `}
              onClick={() => setIsOpen(false)}
            >
              <span>
                <item.icon size={13} />
              </span>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </ul>

      <ul className="px-2 pt-2 border-t border-primary/10 flex flex-col gap-1 justify-end mt-auto">
        <li>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 text-black transition-all duration-300 px-4 py-2.5 rounded-md border-0 cursor-pointer text-[11px] hover:bg-primary hover:font-semibold hover:text-white hover:shadow-md ${
                isActive
                  ? "bg-primary text-white font-semibold shadow-md border border-primary/5"
                  : ""
              }`
            }
          >
            <MdSettings size={13} />
            <span>Settings</span>
          </NavLink>
        </li>

        <li>
          <button
            onClick={() => setShowLogOutModal(true)}
            className="flex items-center gap-3 text-black transition-all duration-300 px-4 py-2.5 rounded-md cursor-pointer text-[11px] hover:bg-primary hover:font-semibold hover:text-white hover:shadow-md w-full text-left"
          >
            <FiLogOut size={13} />
            <span>Logout</span>
          </button>
        </li>
      </ul>

      {showLogOutModal && (
        <Modal onClose={() => setShowLogOutModal(false)} customMode>
          <div className="flex items-center flex-col bg-white rounded-xl py-6 px-8">
            <h3 className="font-medium text-lg text-red-700">
              Are you sure you want to logout?
            </h3>
            <div className="flex w-full mt-8 items-center gap-6">
              <button
                type="button"
                onClick={() => setShowLogOutModal(false)}
                className="bg-secondary text-xs rounded-md font-medium border border-primary/10 w-1/2 h-10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={logout}
                className="bg-red-500 text-xs rounded-md font-medium text-white w-1/2 h-10 cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Sidebar;
