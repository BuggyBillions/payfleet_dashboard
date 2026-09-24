import React from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import { TbReceiptDollar } from "react-icons/tb";
import { HiHome, HiOutlineArrowTrendingUp } from "react-icons/hi2";
import { LuUsersRound } from "react-icons/lu";
import { formatterUtility } from "../../helpers/formatterUtility";
import { useUser } from "../../hooks/useUser";
import PageHeader from "../../components/navs/PageHeader";

const SuperAdminOverview: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="">
      <PageHeader
        heading={`Welcome, ${user?.first_name}`}
        value="Here is your business breakdown"
      />

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

export default SuperAdminOverview;
