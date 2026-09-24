import React from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import { TbReceiptDollar } from "react-icons/tb";
import { HiHome, HiOutlineArrowTrendingUp } from "react-icons/hi2";
import { LuUsersRound } from "react-icons/lu";
import { formatterUtility } from "../../helpers/formatterUtility";
import { useUser } from "../../hooks/useUser";

const FinancialOverview: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">
            Welcome <span className="capitalize">{user?.role}</span>
          </h2>
          <p className="text-sm text-gray-500">Here is your business breakdown overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          icon={TbReceiptDollar}
          title="Total Sales"
          value={formatterUtility(0)}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={TbReceiptDollar}
          title="Active Sales"
          value={0}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={HiHome}
          title="Properties"
          value={0}
          icon2={HiOutlineArrowTrendingUp}
        />

        <OverviewCards
          icon={LuUsersRound}
          title="No of Employee"
          value={0}
          icon2={HiOutlineArrowTrendingUp}
        />
      </div>
    </div>
  );
};

export default FinancialOverview;
