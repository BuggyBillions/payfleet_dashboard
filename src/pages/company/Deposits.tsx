import React, { useMemo, useState } from "react";
import type { DepositsProps, DemoDeposit } from "../../lib/interfaces";
import { formatterUtility } from "../../helpers/formatterUtility";
import ActionButton from "../../components/ui/ActionButton";
import OverviewCards from "../../components/cards/OverviewCards";
import { FaPlus } from "react-icons/fa6";
import Deposit from "../../components/modal/Deposit";
import { useUser } from "../../hooks/useUser";

const Deposits: React.FC<DepositsProps> = ({ defaultFilter = "all" }) => {
  const { user } = useUser();
  const companyId = user?.company_details?.id;
  const [deposits, setDeposits] = useState<DemoDeposit[]>([]);
  const [initiate, setInitiate] = useState(false);

  const totalBalance = useMemo(() => {
    return deposits
      .filter((d) => d.status === "successful")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [deposits]);

  const pendingAmount = useMemo(() => {
    return deposits
      .filter((d) => d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [deposits]);

  const successfulCount = useMemo(() => {
    return deposits.filter((d) => d.status === "successful").length;
  }, [deposits]);

  const handleDepositSuccess = (newDeposit: DemoDeposit) => {
    setDeposits((prev) => [newDeposit, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">
            {defaultFilter === "pending" ? "Pending Deposits" : "Deposits & Wallet"}
          </h2>
          <p className="text-xs text-textBlack/60">
            {defaultFilter === "pending"
              ? "Monitor and track incoming deposits awaiting bank confirmation."
              : "Fund your business account and manage all incoming deposit transactions."}
          </p>
        </div>
        <div>
          <ActionButton
            text="Deposit Funds"
            icon={<FaPlus />}
            onClick={() => setInitiate(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverviewCards
          title="Available Account Balance"
          value={formatterUtility(totalBalance)}
        />
        <OverviewCards
          title="Pending Deposits"
          value={formatterUtility(pendingAmount)}
        />
        <OverviewCards
          title="Successful Transactions"
          value={successfulCount.toString()}
        />
      </div>

      {initiate && (
        <Deposit
          onClose={() => setInitiate(false)}
          onDepositSuccess={handleDepositSuccess}
          companyId={companyId}
        />
      )}
    </div>
  );
};

export default Deposits;