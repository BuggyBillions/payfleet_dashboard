import React, { useState } from "react";
import ActionButton from "../../components/ui/ActionButton";
import AddBankModal from "../../components/modal/AddBankModal";
import { useAccount } from "../../hooks/useBank";
import { FaPlus, FaBuildingColumns } from "react-icons/fa6";
import { LuCopy, LuCheck } from "react-icons/lu";
import { toast } from "sonner";

const ManageBanks: React.FC = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Strictly use /get-account to get the bank details (no hardcoded fallbacks)
  const {
    data: activeAccount,
    isLoading: loadingAccount,
    refetch: refetchAccount,
  } = useAccount();

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">Manage Banks</h2>
          <p className="text-xs text-textBlack/60">
            View and configure your organization's settlement bank account
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton
            text={activeAccount ? "Update Bank Account" : "Add Bank Account"}
            icon={<FaPlus />}
            onClick={() => setAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Account Details View */}
      {loadingAccount ? (
        <div className="p-12 text-center text-xs text-primary animate-pulse bg-tertiary rounded-2xl border border-primary/10">
          Loading settlement bank account details ...
        </div>
      ) : activeAccount ? (
        <div className="space-y-6">
          {/* Active Settlement Account Banner */}
          <div className="bg-tertiary rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FaBuildingColumns size={24} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Active Settlement Account
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-textBlack">
                    {activeAccount.bank_name}
                  </h3>
                  <p className="text-xs text-textBlack/70">
                    Account Holder:{" "}
                    <span className="font-semibold text-textBlack">
                      {activeAccount.account_name}
                    </span>
                  </p>
                </div>
              </div>

              {/* Account Number Copy Box */}
              <div className="flex items-center gap-3 bg-secondary px-5 py-3 rounded-xl border border-primary/10 self-start md:self-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-textBlack/50 uppercase font-medium">
                    Account Number
                  </span>
                  <span className="font-mono font-bold text-base text-textBlack">
                    {activeAccount.account_number}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(activeAccount.account_number || "", "Account number")
                  }
                  className="p-2 rounded-lg hover:bg-primary/10 text-textBlack/60 hover:text-primary transition cursor-pointer"
                  title="Copy Account Number"
                >
                  {copiedField === "Account number" ? (
                    <LuCheck size={18} className="text-primary" />
                  ) : (
                    <LuCopy size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="bg-tertiary rounded-2xl p-12 border border-primary/10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <FaBuildingColumns size={24} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-textBlack">
              No Settlement Bank Account Configured
            </h3>
            <p className="text-xs text-textBlack/60">
              Configure your primary corporate bank account to receive automated settlements, refunds, and corporate deposits.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition cursor-pointer shadow-sm"
          >
            Configure Settlement Account
          </button>
        </div>
      )}

      {/* Add / Edit Bank Account Modal */}
      {addModalOpen && (
        <AddBankModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            refetchAccount();
          }}
        />
      )}
    </div>
  );
};

export default ManageBanks;
