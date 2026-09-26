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

const TopNav: React.FC = () => {
  const { user, role, token, refreshUser } = useUser();
  const [fetchedUser, setFetchedUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const unreadCount = useUnreadNotificationsCount({ refetchInterval: 15000 });

  // Fetch user details on mount
  useEffect(() => {
    let mounted = true;
    getUserService()
      .then((data) => {
        if (!mounted) return;
        if (data) {
          setFetchedUser(data);
        }
        if (token) {
          return refreshUser(token);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user details:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const initials = useMemo(() => {
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    if (displayName && displayName !== "Payfleet User") {
      const parts = displayName.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return displayName.slice(0, 2).toUpperCase();
    }
    return "PF";
  }, [currentUser, displayName]);

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
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary uppercase flex items-center justify-center font-medium bg-primary/10 text-primary text-xs shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : initials ? (
              <span>{initials}</span>
            ) : (
              <img src={assets.favicon} alt="Payfleet Logo" className="w-8" />
            )}
          </div>
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
