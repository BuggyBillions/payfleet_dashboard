import React, { useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import type { TableColumnProps } from "../../lib/interfaces";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaCheckCircle, FaCircle } from "react-icons/fa";

type SettingsTab = "profile" | "level" | "pin" | "bank" | "password";

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "profile", label: "Company Profile" },
  { key: "level", label: "Level" },
  { key: "pin", label: "Update PIN" },
  { key: "bank", label: "Special Bank Details" },
  { key: "password", label: "Reset Password" },
];

interface Tier {
  name: string;
  employees: string;
  price: string;
  current: boolean;
}

const tiers: Tier[] = [
  { name: "Tier 1", employees: "Up to 10 staff", price: "₦0 / month", current: true },
  { name: "Tier 2", employees: "Up to 50 staff", price: "₦50,000 / month", current: false },
  { name: "Tier 3", employees: "Unlimited staff", price: "₦150,000 / month", current: false },
];

const inputClass =
  "w-full text-black border border-black/10 bg-backgroundBlack rounded-md px-4 h-[45px] text-sm outline-0 placeholder-black";

const textareaClass =
  "w-full text-black border border-black/10 bg-backgroundBlack rounded-md px-4 py-3 text-sm outline-0 placeholder-black resize-none";

const submitClass =
  "bg-primary text-white text-xs rounded-md font-medium px-6 h-10 cursor-pointer";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  maxLength?: number;
  placeholder?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  visible,
  onToggle,
  maxLength,
  placeholder,
}) => (
  <label className="flex flex-col space-y-1">
    <span className="font-medium text-sm">{label}</span>
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <span
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-black"
        onClick={onToggle}
      >
        {visible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
      </span>
    </div>
  </label>
);

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [hiddenFields, setHiddenFields] = useState<Record<string, boolean>>({});

  const [selectedLevel, setSelectedLevel] = useState("Tier 1");

  const [profile, setProfile] = useState({
    company_name: "TicketPenty",
    phone: "+1 (352) 891-5641",
    about: "Quae optio et nihil",
    address: "",
  });

  const [pin, setPin] = useState({
    current_pin: "",
    new_pin: "",
    confirm_pin: "",
  });

  const [bank, setBank] = useState({
    bank_name: "Wema Bank",
    account_number: "9817625028",
    account_name: "WELLTHRIXINTE/COMPANY TICKETPENTY",
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const isFieldVisible = (key: string) => hiddenFields[key] === true;

  const toggleField = (key: string) =>
    setHiddenFields((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleProfileChange = (
    key: keyof typeof profile,
    value: string,
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleBankChange = (key: keyof typeof bank, value: string) => {
    setBank((prev) => ({ ...prev, [key]: value }));
  };

  const tierColumns: TableColumnProps<Tier>[] = [
    {
      label: "Tier",
      render: (item) => <span className="font-semibold">{item.name}</span>,
    },
    { label: "Staff Limit", key: "employees" },
    { label: "Price", key: "price" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <label className="flex flex-col space-y-1">
                <span className="font-medium text-sm">Company Name</span>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) =>
                    handleProfileChange("company_name", e.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col space-y-1">
                <span className="font-medium text-sm">Phone</span>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col space-y-1">
                <span className="font-medium text-sm">About</span>
                <textarea
                  rows={3}
                  value={profile.about}
                  onChange={(e) => handleProfileChange("about", e.target.value)}
                  className={textareaClass}
                />
              </label>
              <label className="flex flex-col space-y-1">
                <span className="font-medium text-sm">Address</span>
                <textarea
                  rows={3}
                  value={profile.address}
                  onChange={(e) =>
                    handleProfileChange("address", e.target.value)
                  }
                  placeholder="Enter company address"
                  className={textareaClass}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => toast.success("Company profile saved (demo)")}
              className={`${submitClass} self-start`}
            >
              Save Profile
            </button>
          </div>
        );

      case "level":
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <h3 className="font-semibold">Select Company Level</h3>
              <p className="text-xs text-gray-500">
                Choose the tier that best fits your company
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => {
                const selected = selectedLevel === tier.name;
                return (
                  <button
                    key={tier.name}
                    type="button"
                    onClick={() => setSelectedLevel(tier.name)}
                    className={`flex flex-col items-start gap-2 p-4 rounded-lg border text-start transition cursor-pointer ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-black/10 bg-secondary hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold">{tier.name}</span>
                      {selected ? (
                        <FaCheckCircle size={16} className="text-primary" />
                      ) : (
                        <FaCircle size={16} className="text-gray-300" />
                      )}
                    </div>
                    <span className="text-xs text-gray-600">
                      {tier.employees}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {tier.price}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2">
              <div className="flex flex-col mb-4">
                <h3 className="font-semibold">Account Tiers</h3>
                <p className="text-xs text-gray-500">
                  Detailed comparison of available tiers
                </p>
              </div>
              <ReusableTable
                columns={tierColumns}
                data={tiers}
                isLoading={false}
                error={null}
                currentPage={1}
                totalPages={1}
                totalItems={tiers.length}
                itemsPerPage={5}
                setCurrentPage={() => {}}
                setItemsPerPage={() => {}}
                hasSerialNo={false}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                toast.success(`Company level set to ${selectedLevel} (demo)`)
              }
              className={`${submitClass} self-start`}
            >
              Save Level
            </button>
          </div>
        );

      case "pin":
        return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5 max-w-3xl">
              <PasswordField
                label="Current PIN"
                value={pin.current_pin}
                onChange={(value) =>
                  setPin((prev) => ({ ...prev, current_pin: value }))
                }
                visible={isFieldVisible("pin_current")}
                onToggle={() => toggleField("pin_current")}
                maxLength={4}
              />
              <PasswordField
                label="New PIN"
                value={pin.new_pin}
                onChange={(value) =>
                  setPin((prev) => ({ ...prev, new_pin: value }))
                }
                visible={isFieldVisible("pin_new")}
                onToggle={() => toggleField("pin_new")}
                maxLength={4}
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
              />
            </div>
            <button
              type="button"
              onClick={() => toast.success("PIN updated successfully (demo)")}
              className={`${submitClass} self-start`}
            >
              Update PIN
            </button>
          </div>
        );

      case "bank":
        return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5 max-w-4xl">
              <label className="flex flex-col space-y-1">
                <span className="font-medium text-sm">Bank Name</span>
                <input
                  type="text"
                  value={bank.bank_name}
                  onChange={(e) => handleBankChange("bank_name", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col space-y-1">
                <span className="font-medium text-sm">Account Number</span>
                <input
                  type="text"
                  value={bank.account_number}
                  onChange={(e) =>
                    handleBankChange("account_number", e.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col space-y-1">
                <span className="font-medium text-sm">Account Name</span>
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
              onClick={() => toast.success("Bank details saved (demo)")}
              className={`${submitClass} self-start`}
            >
              Save Bank Details
            </button>
          </div>
        );

      case "password":
        return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5 max-w-3xl">
              <PasswordField
                label="Current Password"
                value={passwords.current_password}
                onChange={(value) =>
                  setPasswords((prev) => ({ ...prev, current_password: value }))
                }
                visible={isFieldVisible("pw_current")}
                onToggle={() => toggleField("pw_current")}
              />
              <PasswordField
                label="New Password"
                value={passwords.new_password}
                onChange={(value) =>
                  setPasswords((prev) => ({ ...prev, new_password: value }))
                }
                visible={isFieldVisible("pw_new")}
                onToggle={() => toggleField("pw_new")}
              />
              <PasswordField
                label="Confirm New Password"
                value={passwords.confirm_password}
                onChange={(value) =>
                  setPasswords((prev) => ({ ...prev, confirm_password: value }))
                }
                visible={isFieldVisible("pw_confirm")}
                onToggle={() => toggleField("pw_confirm")}
              />
            </div>
            <button
              type="button"
              onClick={() => toast.success("Password reset successfully (demo)")}
              className={`${submitClass} self-start`}
            >
              Reset Password
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-gray-500">
          Manage company account preferences
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 h-9 rounded-md text-xs font-medium transition cursor-pointer ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "border border-black/10 text-gray-600 hover:bg-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 md:p-8">{renderTabContent()}</div>
    </div>
  );
};

export default Settings;