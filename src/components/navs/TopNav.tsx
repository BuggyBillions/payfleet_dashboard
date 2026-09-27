import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PiBellSimple } from "react-icons/pi";
import { assets } from "../../assets/assets";
import ThemeToggle from "../ThemeToggle";
import { useUser } from "../../hooks/useUser";
import { getUserService } from "../../services/authService";
import { getUserDisplayName } from "../../helpers/formatterUtility";
import type { UserProps } from "../../lib/interfaces";
import { useUnreadNotificationsCount } from "../../hooks/useNotifications";

import { CompanyLogoAvatar } from "../../helpers/logoHelper";

const TopNav: React.FC = () => {
  const { user, role, loading } = useUser();
  const [fetchedUser, setFetchedUser] = useState<UserProps | null>(null);

  const isCompanyUser = (role || user?.role || "").toLowerCase() === "company";
  const unreadCount = useUnreadNotificationsCount({
    enabled: isCompanyUser,
    refetchInterval: isCompanyUser ? 15000 : false,
  });

  // Fetch user details on mount if not already in context
  useEffect(() => {
    let mounted = true;
    if (!user) {
      getUserService()
        .then((data) => {
          if (!mounted) return;
          if (data) {
            setFetchedUser(data);
          }
        })
        .catch(() => undefined);
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const currentUser = user || fetchedUser;

  const displayName = useMemo(() => {
    return (
      getUserDisplayName(currentUser as Record<string, unknown> | null) ||
      "Payfleet User"
    );
  }, [currentUser]);

  const displayRole = useMemo(() => {
    return (
      currentUser?.tier ||
      currentUser?.role ||
      role ||
      "starter"
    ).toLowerCase();
  }, [currentUser, role]);

  const avatarUrl =
    currentUser?.avatar ||
    currentUser?.company_details?.logo ||
    null;

  return (
    <div className="w-full py-3 flex gap-3 items-center justify-between">
      <img
        src={assets.logo}
        alt="Payfleet Logo"
        className="w-18 md:visible invisible"
      />
      <div className="flex lg:gap-6 gap-2 items-center">
        <Link
          to="/dashboard/notifications"
          className="relative flex items-center justify-center hover:opacity-80 transition"
          aria-label="Notifications"
        >
          <PiBellSimple
            size={20}
            className="dark:text-white text-gray-600 hover:text-gray-900 dark:hover:text-white/75 transition"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <ThemeToggle />

        <div className="flex items-center gap-2">
          <CompanyLogoAvatar
            name={displayName}
            logo={avatarUrl}
            className="w-8 h-8 rounded-full border-2 border-primary"
            textClassName="text-xs font-medium uppercase"
          />
          <div className="leading-tight text-textBlack md:flex flex-col hidden ">
            <h3 className="truncate m-0 font-medium text-sm max-w-37.5 md:max-w-50">
              {loading && !currentUser ? "Loading..." : displayName}
            </h3>
            <small className="uppercase font-medium text-[10px] text-gray-500 dark:text-gray-400">
              {displayRole}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
