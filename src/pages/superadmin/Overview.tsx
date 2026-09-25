import React from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import { TbReceiptDollar, TbBuildingBank } from "react-icons/tb";
import { LuUsersRound, LuShieldAlert } from "react-icons/lu";
import { formatterUtility } from "../../helpers/formatterUtility";
import { useUser } from "../../hooks/useUser";
import PageHeader from "../../components/navs/PageHeader";

const SuperAdminOverview: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        heading={`Welcome, ${user?.first_name || "Admin"}`}
        value="System overview and platform performance statistics"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          icon={TbReceiptDollar}
          title="Platform Volume"
          value={formatterUtility(11790000)}
        />

        <OverviewCards
          icon={TbBuildingBank}
          title="Active Companies"
          value={48}
        />

        <OverviewCards
          icon={LuShieldAlert}
          title="Pending Verifications"
          value={5}
        />

        <OverviewCards
          icon={LuUsersRound}
          title="System Staff"
          value={12}
        />
      </div>
    </div>
  );
};

export default SuperAdminOverview;
