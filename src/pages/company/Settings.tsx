import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { LuPencil } from "react-icons/lu";
import {
  LuUser,
  LuShieldCheck,
  LuCrown,
} from "react-icons/lu";
import { useUser } from "../../hooks/useUser";
import { updateCompanyDetails, updateCompanyPassword } from "../../services/companyService";
import { getErrorMessage } from "../../helpers/api";
import { formatterUtility } from "../../helpers/formatterUtility";
import TierSettings from "./TierSettings";
import EditProfileModal, {
  type ProfileFormValues,
} from "../../components/modal/EditProfileModal";
import type { SettingsTab, PasswordFieldProps } from "../../lib/interfaces";
import { TbLockPassword } from "react-icons/tb";

type DocumentField = "logo" | "cac" | "mermat" | "status_report";

const toDigitString = (value: string | number | null | undefined) => {
  const trimmed = String(value ?? "").trim();
  return /^\d+$/.test(trimmed) ? trimmed : undefined;
};

interface TabConfig {
  key: SettingsTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles?: string[];
}

const TABS: TabConfig[] = [
  {
    key: "profile",
    label: "Profile Details",
    icon: LuUser,
    roles: ["company"],
  },
  {
    key: "pin",
    label: "Transaction PIN",
    icon: LuShieldCheck,
    roles: ["company"],
  },
  {
    key: "password",
    label: "Password",
    icon: TbLockPassword,
    roles: ["company", "finance", "support", "admin"],
  },
  {
    key: "tier",
    label: "Tier & Plan",
    icon: LuCrown,
    roles: ["company"],
  },
];

const inputClass =
  "w-full text-textBlack border border-primary/10 bg-secondary rounded-lg px-4 h-11 text-xs outline-0 placeholder:text-textBlack/40 focus:border-primary/40 transition";

const submitClass =
  "bg-primary hover:bg-primary/90 text-textBlack text-xs rounded-lg font-medium px-6 h-10 cursor-pointer shadow-xs transition disabled:opacity-60 disabled:cursor-not-allowed";

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-0.5 p-3 rounded-lg border border-primary/10 bg-secondary/40">
    <span className="text-[11px] font-medium text-textBlack/60">{label}</span>
    <span className="text-xs font-medium text-textBlack break-words">
      {value?.trim() ? value : "—"}
    </span>
  </div>
);

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  visible,
  onToggle,
  maxLength,
  placeholder,
}) => (
  <label className="flex flex-col space-y-1.5">
    <span className="font-medium text-xs text-textBlack">{label}</span>
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-textBlack/50 hover:text-textBlack"
        onClick={onToggle}
      >
        {visible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
      </button>
    </div>
  </label>
);

const Settings: React.FC = () => {
  const { user, role, token, refreshUser } = useUser();
  const currentRole = (role || user?.role || "company").toLowerCase().trim();

  const allowedTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (!tab.roles || tab.roles.length === 0) return true;
      return tab.roles.some((r) => r.toLowerCase() === currentRole);
    });
  }, [currentRole]);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const effectiveTab = allowedTabs.some((t) => t.key === activeTab)
    ? activeTab
    : (allowedTabs[0]?.key ?? "profile");

  const [hiddenFields, setHiddenFields] = useState<Record<string, boolean>>({});

  const [profile, setProfile] = useState<ProfileFormValues>({
    name:
      user?.company_name ||
      user?.name ||
      user?.company_details?.name ||
      "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phoneNumber:
      user?.phone ||
      user?.phone_number ||
      user?.company_details?.phone ||
      "",
    department: currentRole.toUpperCase(),
    address: user?.company_details?.address ?? "",
    about: user?.company_details?.about ?? "",
    bvn: toDigitString(user?.company_details?.bvn) ?? "",
    nin: toDigitString(user?.company_details?.nin) ?? "",
  });

  const [savedProfile, setSavedProfile] = useState(profile);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const isProfileDirty = useMemo(
    () =>
      (Object.keys(profile) as (keyof ProfileFormValues)[]).some(
        (key) => profile[key] !== savedProfile[key],
      ),
    [profile, savedProfile],
  );

  const existingDocuments: Record<DocumentField, string | null> = {
    logo: user?.company_details?.logo ?? null,
    cac: user?.company_details?.cac ?? null,
    mermat: user?.company_details?.mermat ?? null,
    status_report: user?.company_details?.status_report ?? null,
  };

  const companyBalance = Number(user?.company_details?.balance ?? 0);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [pin, setPin] = useState({
    current_pin: "",
    new_pin: "",
    confirm_pin: "",
  });

  const [passwordState, setPasswordState] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const isFieldVisible = (key: string) => hiddenFields[key] === true;

  const toggleField = (key: string) =>
    setHiddenFields((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleProfileChange = (key: keyof ProfileFormValues, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const closeEditProfile = () => {
    setProfile(savedProfile);
    setIsEditProfileOpen(false);
  };

  const handleSaveProfile = async () => {
    if (!isProfileDirty) return;

    setSavingProfile(true);
    try {
      await updateCompanyDetails({
        name: profile.name.trim() || undefined,
        email: profile.email.trim() || undefined,
        phone: profile.phoneNumber.trim() || undefined,
        address: profile.address.trim() || undefined,
        about: profile.about.trim() || undefined,
        bvn: toDigitString(profile.bvn),
        nin: toDigitString(profile.nin),
      });

      setSavedProfile(profile);
      setIsEditProfileOpen(false);
      toast.success("Company profile updated successfully.");
      if (token) refreshUser(token).catch(() => undefined);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update company details"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePin = async () => {
    if (!pin.new_pin || pin.new_pin.length !== 4) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }
    if (pin.new_pin !== pin.confirm_pin) {
      toast.error("New PIN and Confirm PIN do not match");
      return;
    }
    setSavingPin(true);
    try {
      await updateCompanyDetails({ pin: pin.new_pin });
      toast.success("Transaction PIN updated successfully");
      setPin({ current_pin: "", new_pin: "", confirm_pin: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update transaction PIN"));
    } finally {
      setSavingPin(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordState.current_password) {
      toast.error("Please enter your current password");
      return;
    }
    if (!passwordState.new_password) {
      toast.error("Please enter your new password");
      return;
    }
    if (passwordState.new_password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordState.new_password !== passwordState.confirm_password) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if (passwordState.current_password === passwordState.new_password) {
      toast.error("New password must be different from current password");
      return;
    }

    setSavingPassword(true);
    try {
      await updateCompanyPassword({
        current_password: passwordState.current_password,
        new_password: passwordState.new_password,
      });
      toast.success("Password updated successfully");
      setPasswordState({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update password"));
    } finally {
      setSavingPassword(false);
    }
  };

  const renderTabContent = () => {
    if (!allowedTabs.some((t) => t.key === effectiveTab)) {
      return (
        <div className="p-8 text-center text-xs text-textBlack/60">
          You do not have administrative permission to view or configure this section.
        </div>
      );
    }

    switch (effectiveTab) {
      case "profile":
        return (
          <div className="flex flex-col gap-6 max-w-2xl">
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-textBlack">Account Profile</h3>
              <p className="text-xs text-textBlack/60">
                Personal details and administrative account information
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-primary/10">
              {existingDocuments.logo ? (
                <img
                  src={existingDocuments.logo}
                  alt={profile.name || "Company logo"}
                  className="w-14 h-14 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {profile.name?.[0] || profile.firstName?.[0] || "U"}
                  {!profile.name ? (profile.lastName?.[0] || "") : ""}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-textBlack">
                  {profile.name ||
                    (profile.firstName || "") + " " + (profile.lastName || "")}
                </span>
                <span className="text-xs text-textBlack/60">{profile.email}</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary capitalize w-fit">
                    Role: {currentRole}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary w-fit">
                    Balance: {formatterUtility(companyBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailRow label="Company Name" value={profile.name} />
              <DetailRow label="Company Email" value={profile.email} />
              <DetailRow label="Phone Number" value={profile.phoneNumber} />
              <DetailRow label="Company Address" value={profile.address} />
              <DetailRow label="BVN" value={profile.bvn} />
              <DetailRow label="NIN" value={profile.nin} />
              <div className="sm:col-span-2">
                <DetailRow label="About / Description" value={profile.about} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className={`${submitClass} flex items-center gap-1.5`}
              >
                <LuPencil size={13} />
                Edit Profile
              </button>
            </div>
          </div>
        );

      case "pin":
        return (
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-textBlack">Transaction PIN</h3>
              <p className="text-xs text-textBlack/60">
                Update your 4-digit numerical PIN used to authorize employee payouts and wallet debits
              </p>
            </div>

            <div className="flex flex-col gap-y-4">
              <PasswordField
                label="Current 4-Digit PIN"
                value={pin.current_pin}
                onChange={(value) =>
                  setPin((prev) => ({ ...prev, current_pin: value }))
                }
                visible={isFieldVisible("pin_current")}
                onToggle={() => toggleField("pin_current")}
                maxLength={4}
                placeholder="Enter current PIN"
              />
              <PasswordField
                label="New 4-Digit PIN"
                value={pin.new_pin}
                onChange={(value) =>
                  setPin((prev) => ({ ...prev, new_pin: value }))
                }
                visible={isFieldVisible("pin_new")}
                onToggle={() => toggleField("pin_new")}
                maxLength={4}
                placeholder="Enter new 4-digit PIN"
              />
              <PasswordField
                label="Confirm New PIN"
                value={pin.confirm_pin}
                onChange={(value) =>
                  setPin((prev) => ({ ...prev, confirm_pin: value }))
                }
                visible={isFieldVisible("pin_confirm")}
                onToggle={() => toggleField("pin_confirm")}
                maxLength={4}
                placeholder="Re-enter new PIN"
              />
            </div>
            <button
              type="button"
              onClick={handleUpdatePin}
              disabled={savingPin}
              className={`${submitClass} text-textBlack self-start disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {savingPin ? "Updating..." : "Update Transaction PIN"}
            </button>
          </div>
        );

      case "tier":
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-textBlack">Tier & Plan</h3>
              <p className="text-xs text-textBlack/60">
                Check your current subscription tier and request an upgrade
              </p>
            </div>
            <TierSettings />
          </div>
        );

      case "password":
        return (
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-textBlack">Change Password</h3>
              <p className="text-xs text-textBlack/60">
                Update your account password to keep your account secure. Make sure to choose a strong and unique password.
              </p>
            </div>

            <div className="flex flex-col gap-y-4">
              <PasswordField
                label="Current Password"
                value={passwordState.current_password}
                onChange={(value) =>
                  setPasswordState((prev) => ({ ...prev, current_password: value }))
                }
                visible={isFieldVisible("pwd_current")}
                onToggle={() => toggleField("pwd_current")}
                placeholder="Enter current password"
              />
              <PasswordField
                label="New Password"
                value={passwordState.new_password}
                onChange={(value) =>
                  setPasswordState((prev) => ({ ...prev, new_password: value }))
                }
                visible={isFieldVisible("pwd_new")}
                onToggle={() => toggleField("pwd_new")}
                placeholder="Enter new password"
              />
              <PasswordField
                label="Confirm New Password"
                value={passwordState.confirm_password}
                onChange={(value) =>
                  setPasswordState((prev) => ({ ...prev, confirm_password: value }))
                }
                visible={isFieldVisible("pwd_confirm")}
                onToggle={() => toggleField("pwd_confirm")}
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={savingPassword}
              className={`${submitClass} text-textBlack self-start disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-textBlack">Settings</h2>
        <p className="text-xs text-textBlack/60">
          Manage your account profile, transaction PIN and subscription tier
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-primary/10 pb-3">
        {allowedTabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium transition cursor-pointer ${effectiveTab === tab.key
                ? "bg-primary text-white shadow-xs"
                : "border border-textBlack/10 text-textBlack/70 hover:bg-secondary hover:text-textBlack"
                }`}
            >
              <TabIcon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-tertiary text-textBlack rounded-xl p-5 md:p-8 border border-primary/10">
        {renderTabContent()}
      </div>

      {isEditProfileOpen && (
        <EditProfileModal
          values={profile}
          onChange={handleProfileChange}
          onSubmit={handleSaveProfile}
          onClose={closeEditProfile}
          saving={savingProfile}
          isDirty={isProfileDirty}
        />
      )}
    </div>
  );
};

export default Settings;