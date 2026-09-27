import React, { useMemo } from "react";
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
import { CompanyLogoAvatar } from "../../helpers/logoHelper";
import { useAdminSupportConversations } from "../../hooks/useSupportChat";
import type { CompanyProps, TableColumnProps } from "../../lib/interfaces";
import {
  LuShieldAlert,
  LuShieldCheck,
  LuClock,
  LuArrowUpRight,
} from "react-icons/lu";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { BsChatText } from "react-icons/bs";

const SupportOverview: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
    isFetching,
    error: tableError,
  } = useCompanies({
    page: 1,
    per_page: 5,
  });

  const { data: statsData } = useCompanyStats();
  const { data: recentConversations = [] } = useAdminSupportConversations();

  const companiesList = companiesData?.items || [];

  // Helper function to check active status (aligned with ManageCompany.tsx)
  const isCompanyActive = (company?: CompanyProps | null) => {
    if (!company) return false;
    if (typeof company.status === "boolean") return company.status;
    if (company.user?.is_active !== undefined) {
      return company.user.is_active === 1 || Boolean(company.user.is_active);
    }
    if (company.is_active !== undefined) {
      return company.is_active === 1 || Boolean(company.is_active);
    }
    const s = String(company.status ?? "").toLowerCase();
    return s === "active" || s === "1" || s === "true" || s === "successful" || s === "verified";
  };

  // Helper function to check verification status (aligned with ManageCompany.tsx)
  const isCompanyVerified = (company?: CompanyProps | null) => {
    if (!company) return false;
    if (company.user?.is_verified !== undefined) {
      return company.user.is_verified === 1 || Boolean(company.user.is_verified);
    }
    if (company.is_verified !== undefined) {
      return company.is_verified === 1 || Boolean(company.is_verified);
    }
    const v = String(company.verificationStatus || company.status || "").toLowerCase();
    return v === "verified" || v === "successful";
  };

  // Metrics derived from live API stats with fallback to companies list
  const allCompanies = statsData?.items && statsData.items.length > 0 ? statsData.items : companiesList;
  const totalCount = statsData?.totalCompanies || statsData?.totalItems || companiesData?.totalItems || companiesList.length;

  const activeCount = useMemo(() => {
    if (statsData?.activeCompanies !== undefined && statsData.activeCompanies > 0) {
      return statsData.activeCompanies;
    }
    return allCompanies.filter((c) => isCompanyActive(c)).length;
  }, [allCompanies, statsData?.activeCompanies]);

  const verifiedCount = useMemo(() => {
    if (statsData?.verifiedCompanies !== undefined && statsData.verifiedCompanies > 0) {
      return statsData.verifiedCompanies;
    }
    return allCompanies.filter((c) => isCompanyVerified(c)).length;
  }, [allCompanies, statsData?.verifiedCompanies]);

  const pendingCount = useMemo(() => {
    if (statsData?.pendingCompanies !== undefined && statsData.pendingCompanies > 0) {
      return statsData.pendingCompanies;
    }
    return allCompanies.filter((c) => !isCompanyVerified(c)).length;
  }, [allCompanies, statsData?.pendingCompanies]);

  const columns: TableColumnProps<CompanyProps>[] = [
    {
      label: "Company",
      key: "name",
      render: (item: CompanyProps) => (
        <div className="flex items-center gap-2.5">
          <CompanyLogoAvatar
            name={item.name || item.companyName}
            logo={item.logo}
            className="w-8 h-8 rounded-lg"
            textClassName="text-xs font-bold"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-textBlack text-xs truncate">
              {item.name || item.companyName || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Contact Details",
      key: "email",
      render: (item: CompanyProps) => (
        <div className="flex flex-col text-xs">
          <span className="text-textBlack/80 lowercase truncate max-w-[150px]">{item.email}</span>
          <span className="text-[10px] text-textBlack/50 font-mono">
            {item.phone || item.phoneNumber || "N/A"}
          </span>
        </div>
      ),
    },
    {
      label: "Tier & Staff",
      key: "tier",
      render: (item: CompanyProps) => {
        const tier = getTierConfig(item.tier);
        const staffCount = item.no_of_employee ?? item.employees?.length ?? item.staff ?? item.staffCount ?? 0;
        return (
          <div className="flex flex-col">
            <span className="text-xs text-primary font-semibold">{tier.name}</span>
            <span className="text-[10px] text-textBlack/50">
              {staffCount} Staff
            </span>
          </div>
        );
      },
    },
    {
      label: "Status",
      key: "status",
      render: (item: CompanyProps) => {
        const active = isCompanyActive(item);
        return <StatusBadge status={active ? "Active" : "Inactive"} />;
      },
    },
    {
      label: "Verification",
      key: "verification",
      render: (item: CompanyProps) => {
        const verified = isCompanyVerified(item);
        return <StatusBadge status={verified ? "Verified" : "Pending Verification"} />;
      },
    },
    {
      label: "Registered Date",
      key: "created_at",
      render: (item: CompanyProps) => (
        <span className="text-xs text-textBlack/60 whitespace-nowrap">
          {item.created_at ? formatShortDate(item.created_at) : "—"}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
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
            isLoading={isCompaniesLoading || isFetching}
            error={tableError ? "Failed to load recent companies" : null}
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
