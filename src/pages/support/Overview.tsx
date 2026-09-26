import React from "react";
import { useNavigate } from "react-router-dom";
import OverviewCards from "../../components/cards/OverviewCards";
import PageHeader from "../../components/navs/PageHeader";
import ReusableTable from "../../utility/ReusableTable";
import StatusBadge from "../../components/ui/StatusBadge";
import ActionButton from "../../components/ui/ActionButton";
import { useUser } from "../../hooks/useUser";
import { formatShortDate } from "../../helpers/formatterUtility";
import { useCompanies, useCompanyStats } from "../../hooks/useCompany";
import { getTierConfig } from "../../services/tierService";
import { useAdminSupportConversations } from "../../hooks/useSupportChat";
import type { CompanyProps, TableColumnProps } from "../../lib/interfaces";
import {
  LuShieldAlert,
  LuShieldCheck,
  LuClock,
  LuHeadphones,
  LuArrowUpRight,
  LuFileText,
} from "react-icons/lu";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { BsChatText } from "react-icons/bs";

const SupportOverview: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
    error,
  } = useCompanies({
    page: 1,
    per_page: 5,
  });

  const { data: statsData } = useCompanyStats();
  const { data: recentConversations = [] } = useAdminSupportConversations();

  const companiesList = companiesData?.items || [];

  // Metrics derived from live API stats
  const pendingCount = statsData?.pendingCompanies ?? 0;
  const verifiedCount = statsData?.verifiedCompanies ?? 0;
  const activeCount = statsData?.activeCompanies ?? 0;
  const totalCount = statsData?.totalCompanies ?? companiesData?.totalItems ?? 0;

  const columns: TableColumnProps<CompanyProps>[] = [
    {
      label: "Company Details",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">
            {item.name || item.companyName || "Company"}
          </span>
          <span className="text-[11px] text-textBlack/50 font-mono">
            {item.rc_number || item.rcNumber || "N/A"}
          </span>
        </div>
      ),
    },
    {
      label: "Tier & Industry",
      render: (item) => {
        const tier = getTierConfig(item.tier);
        return (
          <div className="flex flex-col">
            <span className="text-xs text-textBlack/80 font-medium">
              {tier.name}
            </span>
            <span className="text-[10px] text-textBlack/50 truncate max-w-[120px]">
              {item.industry || "General Business"}
            </span>
          </div>
        );
      },
    },
    {
      label: "Status",
      render: (item) => {
        const status =
          typeof item.status === "boolean"
            ? item.status
              ? "Active"
              : "Inactive"
            : String(item.status || (item.is_active ? "Active" : "Inactive"));
        return <StatusBadge status={status} />;
      },
    },
    {
      label: "Registered Date",
      render: (item) => (
        <span className="text-xs text-textBlack/60 whitespace-nowrap">
          {item.created_at ? formatShortDate(item.created_at) : "—"}
        </span>
      ),
    },
    {
      label: "Action",
      render: () => (
        <button
          type="button"
          onClick={() => navigate("/support/dashboard/company")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          Review <LuArrowUpRight size={13} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          heading={`Welcome, ${user?.first_name || "Support"}`}
          value="Customer support operations and corporate verification command center"
        />
        <div className="flex items-center gap-2 shrink-0">
          <ActionButton
            text="Verify Companies"
            onClick={() => navigate("/support/dashboard/company-verification")}
            icon={<LuShieldCheck size={16} />}
          />
          <button
            type="button"
            onClick={() => navigate("/support/dashboard/chat")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/20 bg-secondary text-primary hover:bg-primary/10 transition-colors text-xs font-semibold cursor-pointer"
          >
            <BsChatText size={15} />
            Support Chats
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          icon={LuShieldAlert}
          title="Pending Verifications"
          value={pendingCount}
        />
        <OverviewCards
          icon={LuClock}
          title="Active Businesses"
          value={activeCount}
        />
        <OverviewCards
          icon={LuShieldCheck}
          title="Verified Companies"
          value={verifiedCount}
        />
        <OverviewCards
          icon={HiOutlineBuildingOffice2}
          title="Total Businesses"
          value={totalCount}
        />
      </div>

      {/* Operational Hub Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Queue (2 Columns on large screens) */}
        <div className="lg:col-span-2 bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-primary/10 pb-3">
            <div>
              <h3 className="font-semibold text-base text-textBlack flex items-center gap-2">
                <LuFileText className="text-primary" size={18} />
                Recent Companies
              </h3>
              <p className="text-xs text-textBlack/60">
                Live company directory and verification statuses
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/support/dashboard/company")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All ({totalCount}) <LuArrowUpRight size={13} />
            </button>
          </div>

          <ReusableTable
            columns={columns}
            data={companiesList}
            isLoading={isCompaniesLoading}
            error={error ? "Failed to load recent companies" : null}
            currentPage={1}
            totalPages={1}
            totalItems={companiesList.length}
            itemsPerPage={5}
            setCurrentPage={() => {}}
            setItemsPerPage={() => {}}
            hasSerialNo={true}
          />
        </div>

        {/* Support Stream & Operational SLA (1 Column) */}
        <div className="flex flex-col gap-6">
          {/* Active Support Messages Card */}
          <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-textBlack flex items-center gap-2">
                  <LuHeadphones className="text-primary" size={16} />
                  Live Inquiries
                </h3>
                <p className="text-[11px] text-textBlack/60">
                  Recent client tickets & team communications
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/support/dashboard/chat")}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Open Chat
              </button>
            </div>

            <div className="space-y-3">
              {recentConversations.length === 0 ? (
                <div className="p-6 text-center text-textBlack/50 text-xs">
                  No active support conversations
                </div>
              ) : (
                recentConversations.slice(0, 3).map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => navigate("/support/dashboard/chat")}
                    className="p-3 rounded-xl border border-primary/10 bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {conv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-textBlack truncate">
                          {conv.name}
                        </span>
                        <span className="text-[10px] text-textBlack/40 whitespace-nowrap">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-textBlack/70 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">
                          {conv.role}
                        </span>
                        {conv.unread > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 font-semibold">
                            {conv.unread} unread
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default SupportOverview;
