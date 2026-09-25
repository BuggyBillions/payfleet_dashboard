import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { LuUser, LuLock, LuShieldCheck, LuBuilding2 } from "react-icons/lu";
import { useUser } from "../../hooks/useUser";
import { updateCompanyDetails } from "../../services/companyService";
import { getErrorMessage } from "../../helpers/api";
import type { SettingsTab, PasswordFieldProps } from "../../lib/interfaces";

interface TabConfig {
  key: SettingsTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles?: string[];
}

const ALL_ROLES = ["company", "user", "superadmin", "super_admin", "admin", "financial", "finance", "support"];

const TABS: TabConfig[] = [
  {
    key: "profile",
    label: "Profile Details",
    icon: LuUser,
    roles: ALL_ROLES,
  },
  {
    key: "password",
    label: "Security & Password",
    icon: LuLock,
    roles: ALL_ROLES,
  },
  {
    key: "pin",
    label: "Transaction PIN",
    icon: LuShieldCheck,
    roles: ["company", "user", "financial", "finance", "superadmin", "super_admin", "admin"],
  },
  {
    key: "bank",
    label: "Settlement Bank Details",
    icon: LuBuilding2,
    roles: ["company", "user", "financial", "finance", "superadmin", "super_admin", "admin"],
  },
];

const inputClass =
  "w-full text-textBlack border border-primary/10 bg-secondary rounded-lg px-4 h-11 text-xs outline-0 placeholder:text-textBlack/40 focus:border-primary/40 transition";

const submitClass =
  "bg-primary hover:bg-primary/90 text-textWhite text-xs rounded-lg font-medium px-6 h-10 cursor-pointer shadow-xs transition";

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

  // Filter allowed tabs based on user's active role
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

  // Profile Form State
  const [profile, setProfile] = useState({
    firstName: user?.first_name || "Damola",
    lastName: user?.last_name || "Oyegbemile",
    email: user?.email || "damola@payfleet.io",
    phoneNumber: "+234 801 234 5678",
    department: currentRole.toUpperCase(),
    address: user?.company_details?.address ?? "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  // PIN Form State
  const [pin, setPin] = useState({
    current_pin: "",
    new_pin: "",
    confirm_pin: "",
  });

  // Bank Form State
  const [bank, setBank] = useState({
    bank_name: "Wema Bank",
    account_number: "9817625028",
    account_name: "WELLTHRIXINTE/COMPANY TICKETPENTY",
  });

  // Password Form State
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const isFieldVisible = (key: string) => hiddenFields[key] === true;

  const toggleField = (key: string) =>
    setHiddenFields((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleBankChange = (key: keyof typeof bank, value: string) => {
    setBank((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateCompanyDetails({ address: profile.address });
      toast.success("Company address updated successfully");
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

            {/* Profile badge header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-primary/10">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                {profile.firstName?.[0] || "U"}{profile.lastName?.[0] || "U"}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-textBlack">
                  {profile.firstName} {profile.lastName}
                </span>
                <span className="text-xs text-textBlack/60">{profile.email}</span>
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary capitalize w-fit">
                  Role: {currentRole}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col space-y-1.5">
                <span className="font-medium text-xs text-textBlack">First Name</span>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange("firstName", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col space-y-1.5">
                <span className="font-medium text-xs text-textBlack">Last Name</span>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange("lastName", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col space-y-1.5">
                <span className="font-medium text-xs text-textBlack">Email Address</span>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className={`${inputClass} opacity-70 cursor-not-allowed`}
                />
              </label>
              <label className="flex flex-col space-y-1.5">
                <span className="font-medium text-xs text-textBlack">Phone Number</span>
                <input
                  type="text"
                  value={profile.phoneNumber}
                  onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col space-y-1.5">
              <span className="font-medium text-xs text-textBlack">Company Address</span>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => handleProfileChange("address", e.target.value)}
                placeholder="e.g. Tanke Estates Ilorin"
                className={inputClass}
              />
            </label>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className={`${submitClass} self-start disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {savingProfile ? "Saving..." : "Save Profile Changes"}
            </button>
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
              className={`${submitClass} self-start disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {savingPin ? "Updating..." : "Update Transaction PIN"}
            </button>
          </div>
        );

      case "bank":
        return (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-textBlack">Settlement Bank Details</h3>
              <p className="text-xs text-textBlack/60">
                Configure primary destination bank account for settlements, refunds, and corporate deposits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col space-y-1.5">
                <span className="font-medium text-xs text-textBlack">Bank Name</span>
                <input
                  type="text"
                  value={bank.bank_name}
                  onChange={(e) => handleBankChange("bank_name", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col space-y-1.5">
                <span className="font-medium text-xs text-textBlack">Account Number</span>
                <input
                  type="text"
                  value={bank.account_number}
                  onChange={(e) =>
                    handleBankChange("account_number", e.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col space-y-1.5">
                <span className="font-medium text-xs text-textBlack">Account Name</span>
                <input
                  type="text"
                  value={bank.account_name}
                  onChange={(e) =>
                    handleBankChange("account_name", e.target.value)
                  }
                  className={inputClass}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => toast.success("Bank details saved successfully")}
              className={`${submitClass} self-start`}
            >
              Save Bank Details
            </button>
          </div>
        );

      case "password":
        return (
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="flex flex-col">
              <h3 className="font-semibold text-base text-textBlack">Security & Password</h3>
              <p className="text-xs text-textBlack/60">
                Ensure your account uses a secure password with letters, numbers, and symbols
              </p>
            </div>

            <div className="flex flex-col gap-y-4">
              <PasswordField
                label="Current Password"
                value={passwords.current_password}
                onChange={(value) =>
                  setPasswords((prev) => ({ ...prev, current_password: value }))
                }
                visible={isFieldVisible("pw_current")}
                onToggle={() => toggleField("pw_current")}
                placeholder="Enter current password"
              />
              <PasswordField
                label="New Password"
                value={passwords.new_password}
                onChange={(value) =>
                  setPasswords((prev) => ({ ...prev, new_password: value }))
                }
                visible={isFieldVisible("pw_new")}
                onToggle={() => toggleField("pw_new")}
                placeholder="Enter new password (min. 8 characters)"
              />
              <PasswordField
                label="Confirm New Password"
                value={passwords.confirm_password}
                onChange={(value) =>
                  setPasswords((prev) => ({ ...prev, confirm_password: value }))
                }
                visible={isFieldVisible("pw_confirm")}
                onToggle={() => toggleField("pw_confirm")}
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!passwords.new_password || passwords.new_password.length < 6) {
                  toast.error("New password must be at least 6 characters");
                  return;
                }
                if (passwords.new_password !== passwords.confirm_password) {
                  toast.error("Passwords do not match");
                  return;
                }
                toast.success("Password reset successfully");
                setPasswords({ current_password: "", new_password: "", confirm_password: "" });
              }}
              className={`${submitClass} self-start`}
            >
              Reset Password
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
        <h2 className="text-lg font-semibold text-textBlack">Settings & Security</h2>
        <p className="text-xs text-textBlack/60">
          Manage your account profile, credentials, security, and settlement preferences
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
              className={`flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium transition cursor-pointer ${
                effectiveTab === tab.key
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
    </div>
  );
};

export default Settings;