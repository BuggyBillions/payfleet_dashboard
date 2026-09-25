import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PiBellSimple } from "react-icons/pi";
import { assets } from "../../assets/assets";
import ThemeToggle from "../ThemeToggle";
import { useUser } from "../../hooks/useUser";
import { getUserService } from "../../services/authService";
import type { UserProps } from "../../lib/interfaces";

const TopNav: React.FC = () => {
  const { user, role, token, refreshUser } = useUser();
  const [fetchedUser, setFetchedUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch user details function
  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserService();
      if (data) {
        setFetchedUser(data);
      }
      if (token) {
        await refreshUser(token);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setLoading(false);
    }
  }, [token, refreshUser]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const currentUser = user || fetchedUser;

  const displayName = useMemo(() => {
    if (!currentUser) return "Payfleet User";
    if (currentUser.full_name?.trim()) return currentUser.full_name.trim();
    if (currentUser.name?.trim()) return currentUser.name.trim();
    const fullName = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim();
    if (fullName) return fullName;
    if (currentUser.company_name?.trim()) return currentUser.company_name.trim();
    if (currentUser.company_details?.name?.trim()) return currentUser.company_details.name.trim();
    if (currentUser.username?.trim()) return currentUser.username.trim();
    if (currentUser.email?.trim()) return currentUser.email.split("@")[0];
    return "Payfleet User";
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
      <div className="flex gap-6 items-center">
        <Link to="#">
          <PiBellSimple
            size={20}
            className="dark:text-white text-gray-600 hover:text-gray-900 dark:hover:text-white/75 transition"
          />
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
          <div className="leading-tight text-textBlack">
            <h3 className="truncate m-0 font-medium text-sm max-w-[150px] md:max-w-[200px]">
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
