import React from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { LuShieldAlert, LuShieldCheck, LuClock } from "react-icons/lu";
import { useUser } from "../../hooks/useUser";
import PageHeader from "../../components/navs/PageHeader";

const SupportOverview: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        heading={`Welcome, ${user?.first_name || "Support"}`}
        value="Customer support desk and business verification summary"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          icon={LuShieldAlert}
          title="Pending KYC Approvals"
          value={3}
        />

        <OverviewCards
          icon={LuClock}
          title="Under Review"
          value={2}
        />

        <OverviewCards
          icon={LuShieldCheck}
          title="Verified Companies"
          value={45}
        />

        <OverviewCards
          icon={HiOutlineBuildingOffice2}
          title="Total Businesses"
          value={50}
        />
      </div>
    </div>
  );
};

export default SupportOverview;
