import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { MdSettings } from "react-icons/md";
import { HiChevronDown } from "react-icons/hi2";
import { navItems, type NavItem } from "../../lib/navItems";
import Modal from "../modal/Modal";
import { useUser } from "../../hooks/useUser";
import { assets } from "../../assets/assets";

const Sidebar = ({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);
  const { role, logout } = useUser();
  const location = useLocation();

  // Determine effective role from context or current URL path
  const effectiveRole = useMemo(() => {
    if (role && role.trim() !== "") {
      return role.toLowerCase();
    }
    const path = location.pathname;
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/financial")) return "finance";
    if (path.startsWith("/support")) return "support";
    return "company";
  }, [role, location.pathname]);

  // Filter items matching the current user role/context
  const filteredLinks = useMemo(() => {
    return navItems.filter((navItem) =>
      navItem.role
        .map((r) => r.toLowerCase())
        .includes(effectiveRole)
    );
  }, [effectiveRole]);

  // Dynamic settings path matching role context
  const settingsPath = useMemo(() => {
    if (effectiveRole === "admin" || effectiveRole === "superadmin") return "/admin/dashboard/settings";
    if (effectiveRole === "finance" || effectiveRole === "financial") return "/financial/dashboard/settings";
    if (effectiveRole === "support") return "/support/dashboard/settings";
    return "/dashboard/settings";
  }, [effectiveRole]);

  // Auto-expand accordion when viewing a child route
  useEffect(() => {
    filteredLinks.forEach((item) => {
      if (
        item.children &&
        item.children.some((child) => location.pathname.startsWith(child.path))
      ) {
        setOpenMenu(item.name);
      }
    });
  }, [location.pathname, filteredLinks]);

  const toggleMenu = (name: string) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const isParentActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname === child.path);
  };

  const renderItem = (item: NavItem, index: number) => {
    if (item.children) {
      const isOpen = openMenu === item.name;
      const parentActive = isParentActive(item);

      return (
        <li key={index} className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleMenu(item.name)}
            className={`flex w-full items-center justify-between gap-2.5 transition-all duration-200 px-4 py-2.5 rounded-lg cursor-pointer text-xs font-medium ${
              parentActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-gray-700 hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <span className="flex items-center gap-2.5">
              {item.icon && (
                <span className="shrink-0">
                  <item.icon size={16} />
                </span>
              )}
              <span>{item.name}</span>
            </span>
            <HiChevronDown
              size={14}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <ul className="mt-1 ms-4 flex flex-col gap-1 border-s border-primary/15 ps-3 py-0.5">
              {item.children.map((child, childIndex) => (
                <li key={childIndex}>
                  <NavLink
                    to={child.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 transition-all duration-200 px-3 py-2 rounded-md cursor-pointer text-xs ${
                        isActive
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-gray-600 hover:bg-primary/10 hover:text-primary"
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{child.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    const isDashboard =
      item.path === "/dashboard/overview" ||
      item.path === "/admin/dashboard/overview" ||
      item.path === "/financial/dashboard/overview" ||
      item.path === "/support/dashboard/overview";

    return (
      <li key={index}>
        <NavLink
          to={item.path!}
          end={isDashboard}
          className={({ isActive }) =>
            `flex items-center gap-2.5 transition-all duration-200 px-4 py-2.5 rounded-lg cursor-pointer text-xs font-medium ${
              isActive
                ? "bg-primary text-white font-semibold shadow-xs"
                : "text-gray-700 hover:bg-primary/10 hover:text-primary"
            }`
          }
          onClick={() => setIsOpen(false)}
        >
          <span className="shrink-0">{item.icon && <item.icon size={16} />}</span>
          <span>{item.name}</span>
        </NavLink>
      </li>
    );
  };

  return (
    <div className="bg-tertiary lg:w-full md:w-3/5 w-4/5 h-full px-2 py-4 md:pt-0 pt-8 flex flex-col justify-between">
      <div className="flex flex-col h-full overflow-hidden">
        <img
          src={assets.logo}
          alt="Payfleet Logo"
          className="w-1/3 mx-auto md:hidden inline mb-4"
        />

        {/* Navigation list */}
        <ul className="px-3 lg:mt-4 mt-2 flex flex-col gap-1.5 overflow-y-auto no-scrollbar pb-6 flex-1">
          {filteredLinks.map((item, index) => renderItem(item, index))}
        </ul>
      </div>

      {/* Bottom section: Settings and Logout */}
      <ul className="px-3 pt-3 border-t border-primary/10 flex flex-col gap-1 justify-end shrink-0 mt-auto">
        <li>
          <NavLink
            to={settingsPath}
            className={({ isActive }) =>
              `flex items-center gap-2.5 text-gray-700 transition-all duration-200 px-4 py-2.5 rounded-lg cursor-pointer text-xs font-medium hover:bg-primary/10 hover:text-primary ${
                isActive
                  ? "bg-primary text-white font-semibold shadow-xs hover:bg-primary hover:text-white"
                  : ""
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <MdSettings size={16} className="shrink-0" />
            <span>Settings</span>
          </NavLink>
        </li>

        <li>
          <button
            type="button"
            onClick={() => setShowLogOutModal(true)}
            className="flex items-center gap-2.5 text-gray-700 transition-all duration-200 px-4 py-2.5 rounded-lg cursor-pointer text-xs font-medium hover:bg-red-50 hover:text-red-600 w-full text-left"
          >
            <FiLogOut size={16} className="shrink-0" />
            <span>Logout</span>
          </button>
        </li>
      </ul>

      {/* Logout Confirmation Modal */}
      {showLogOutModal && (
        <Modal onClose={() => setShowLogOutModal(false)} customMode>
          <div className="flex items-center flex-col bg-tertiary rounded-xl py-6 px-8 max-w-sm mx-auto shadow-xl">
            <h3 className="font-semibold text-base text-textBlack text-center">
              Are you sure you want to logout?
            </h3>
            <p className="text-xs text-textBlack/50 text-center mt-1">
              You will need to login again to access your dashboard.
            </p>
            <div className="flex w-full mt-6 items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogOutModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg font-medium w-1/2 h-10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-xs rounded-lg font-medium text-white w-1/2 h-10 transition cursor-pointer shadow-sm"
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