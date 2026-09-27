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
import { updateCompanyDetails, updateCompanyPassword, updateCompanyPin } from "../../services/companyService";
import { getErrorMessage } from "../../helpers/api";
import TierSettings from "./TierSettings";
import EditProfileModal, {
  type ProfileFormValues,
} from "../../components/modal/EditProfileModal";
import {
  DOCUMENT_FIELDS,
  type DocumentFiles,
  type DocumentKey,
} from "../../lib/companyDocuments";
import type { SettingsTab, PasswordFieldProps } from "../../lib/interfaces";
import { TbLockPassword } from "react-icons/tb";

type DocumentField = DocumentKey;

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

  const buildProfileFromUser = (): ProfileFormValues => ({
    name:
      user?.company_name ||
      user?.company_details?.name ||
      user?.name ||
      "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.company_details?.email || user?.email || "",
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

  const profileValues = buildProfileFromUser();

  const [draft, setDraft] = useState<ProfileFormValues | null>(null);

  const isProfileDirty = useMemo(
    () =>
      draft !== null &&
      (Object.keys(draft) as (keyof ProfileFormValues)[]).some(
        (key) => draft[key] !== profileValues[key],
      ),
    [draft, profileValues],
  );

  const existingDocuments: Record<DocumentField, string | null> = {
    logo: user?.company_details?.logo ?? null,
    cac: user?.company_details?.cac ?? null,
    mermat: user?.company_details?.mermat ?? null,
    status_report: user?.company_details?.status_report ?? null,
  };

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [pin, setPin] = useState({
    current_pin: "",
    new_pin: "",
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
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const openEditProfile = () => {
    setDraft(buildProfileFromUser());
  };

  const closeEditProfile = () => {
    setDraft(null);
  };

  const handleSaveProfile = async (files: DocumentFiles = {}) => {
    if (!draft) return;
    if (!isProfileDirty && Object.keys(files).length === 0) return;

    setSavingProfile(true);
    try {
      const textFields: Record<string, string | undefined> = {
        name: draft.name.trim() || undefined,
        email: draft.email.trim() || undefined,
        phone: draft.phoneNumber.trim() || undefined,
        address: draft.address.trim() || undefined,
        about: draft.about.trim() || undefined,
        bvn: toDigitString(draft.bvn),
        nin: toDigitString(draft.nin),
      };

      const hasFiles = Object.values(files).some(Boolean);

      if (hasFiles) {
        const formData = new FormData();
        Object.entries(textFields).forEach(([key, value]) => {
          if (value !== undefined) formData.append(key, value);
        });
        Object.entries(files).forEach(([key, file]) => {
          if (file) formData.append(key, file);
        });
        await updateCompanyDetails(formData);
      } else {
        await updateCompanyDetails(textFields);
      }

      setDraft(null);
      toast.success("Company profile updated successfully.");
      if (token) await refreshUser(token);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update company details"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePin = async () => {
    if (!/^\d{4}$/.test(pin.current_pin)) {
      toast.error("Current PIN must be exactly 4 digits");
      return;
    }
    if (!/^\d{4}$/.test(pin.new_pin)) {
      toast.error("New PIN must be exactly 4 digits");
      return;
    }
    if (pin.current_pin === pin.new_pin) {
      toast.error("New PIN must be different from the current PIN");
      return;
    }
    setSavingPin(true);
    try {
      const res = await updateCompanyPin({
        current_pin: pin.current_pin,
        new_pin: pin.new_pin,
      });
      toast.success(res?.message || "Transaction PIN updated successfully");
      setPin({ current_pin: "", new_pin: "" });
      ["pin_current", "pin_new"].forEach((key) =>
        setHiddenFields((prev) => ({ ...prev, [key]: true })),
      );
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
                  alt={profileValues.name || "Company logo"}
                  className="w-14 h-14 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {profileValues.name?.[0] || profileValues.firstName?.[0] || "U"}
                  {!profileValues.name ? (profileValues.lastName?.[0] || "") : ""}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-textBlack">
                  {profileValues.name ||
                    (profileValues.firstName || "") + " " + (profileValues.lastName || "")}
                </span>
                <span className="text-xs text-textBlack/60">{profileValues.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailRow label="Company Name" value={profileValues.name} />
              <DetailRow label="Company Email" value={profileValues.email} />
              <DetailRow label="Phone Number" value={profileValues.phoneNumber} />
              <DetailRow label="Company Address" value={profileValues.address} />
              <DetailRow label="BVN" value={profileValues.bvn} />
              <DetailRow label="NIN" value={profileValues.nin} />
              <div className="sm:col-span-2">
                <DetailRow label="About / Description" value={profileValues.about} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-xs text-textBlack">
                Company Documents
              </span>
              <div className="grid grid-cols-2 gap-2">
                {DOCUMENT_FIELDS.map((doc) => (
                  <div
                    key={doc.key}
                    className="flex flex-col gap-0.5 p-2.5 rounded-lg border border-primary/10 bg-secondary/40"
                  >
                    <span className="text-[10px] text-textBlack/60 truncate">
                      {doc.label}
                    </span>
                    <span
                      className={`text-[11px] font-medium truncate ${
                        existingDocuments[doc.key]
                          ? "text-emerald-600"
                          : "text-textBlack/40"
                      }`}
                    >
                      {existingDocuments[doc.key] ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openEditProfile}
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
                  setPin((prev) => ({ ...prev, current_pin: value.replace(/\D/g, "") }))
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
                  setPin((prev) => ({ ...prev, new_pin: value.replace(/\D/g, "") }))
                }
                visible={isFieldVisible("pin_new")}
                onToggle={() => toggleField("pin_new")}
                maxLength={4}
                placeholder="Enter new 4-digit PIN"
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
            <TierSettings onGoToProfile={() => setActiveTab("profile")} />
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

      {draft && (
        <EditProfileModal
          values={draft}
          onChange={handleProfileChange}
          onSubmit={handleSaveProfile}
          onClose={closeEditProfile}
          saving={savingProfile}
          isDirty={isProfileDirty}
          existingDocuments={existingDocuments}
        />
      )}
    </div>
  );
};

export default Settings;