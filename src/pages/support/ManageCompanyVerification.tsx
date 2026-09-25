import React, { useMemo, useState } from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import ReusableTable from "../../utility/ReusableTable";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  CompanyProps,
  TableColumnProps,
  TierUpgradeRequest,
} from "../../lib/interfaces";
import { useCompanies, useCompanyStats } from "../../hooks/useCompany";
import { useTierRequests, useAllTiers } from "../../hooks/useTier";
import { getTierConfig } from "../../services/tierService";
import ChangeTierModal from "../../components/modal/tier/ChangeTierModal";
import ReviewTierRequestModal from "../../components/modal/tier/ReviewTierRequestModal";
import ViewCompanyModal from "../../components/modal/view/ViewCompanyModal";
import { formatPrettyDate } from "../../helpers/formatterUtility";
import {
  LuBuilding2,
  LuUsersRound,
  LuClock,
  LuSlidersHorizontal,
  LuListFilter,
  LuEye,
} from "react-icons/lu";
import { FiSearch } from "react-icons/fi";

const SupportManageCompanyVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"requests" | "companies">("requests");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyItemsPerPage, setCompanyItemsPerPage] = useState(10);

  // Modals state
  const [selectedCompanyForTier, setSelectedCompanyForTier] = useState<CompanyProps | null>(null);
  const [selectedCompanyForView, setSelectedCompanyForView] = useState<CompanyProps | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TierUpgradeRequest | null>(null);

  // Companies Queries
  const { data: companiesData, isLoading: loadingCompanies, refetch: refetchCompanies } = useCompanies({
    page: companyPage,
    searchTerm: companySearchTerm,
    per_page: companyItemsPerPage,
  });

  const { data: statsData } = useCompanyStats();
  const { data: allTiersList = [] } = useAllTiers();
  const { data: rawTierRequests, isLoading: loadingRequests, refetch: refetchRequests } = useTierRequests();
  const tierRequests: TierUpgradeRequest[] = useMemo(() => {
    if (Array.isArray(rawTierRequests)) return rawTierRequests;
    if (rawTierRequests && typeof rawTierRequests === "object" && Array.isArray((rawTierRequests as any).data)) {
      return (rawTierRequests as any).data;
    }
    return [];
  }, [rawTierRequests]);

  const allCompanies = statsData?.items ?? companiesData?.items ?? [];
  const companiesList = companiesData?.items ?? [];

  // Filtered companies based on search and tier filter
  const filteredCompanies = useMemo(() => {
    return companiesList.filter((comp) => {
      const compTier = getTierConfig(comp.tier).id;
      if (tierFilter !== "all" && String(compTier) !== String(tierFilter)) {
        return false;
      }
      return true;
    });
  }, [companiesList, tierFilter]);

  // Dynamic statistics
  const totalCompaniesCount = statsData?.totalCompanies ?? statsData?.totalItems ?? allCompanies.length;
  const pendingRequestsCount = useMemo(() => {
    return tierRequests.filter((r) => r.status === "pending").length;
  }, [tierRequests]);

  // Table Columns for Tier Upgrade / Verification Requests
  const requestColumns: TableColumnProps<TierUpgradeRequest>[] = [
    {
      label: "Company / Applicant",
      key: "companyName",
      render: (item: TierUpgradeRequest) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">
            {item.companyName}
          </span>
          <span className="text-[10px] text-textBlack/60 lowercase">
            {item.companyEmail}
          </span>
        </div>
      ),
    },
    {
      label: "CAC RC / TIN",
      key: "rcNumber",
      render: (item: TierUpgradeRequest) => (
        <div className="flex flex-col text-xs">
          <span className="font-mono text-textBlack font-medium">
            {item.rcNumber || "N/A"}
          </span>
          {item.tinNumber && (
            <span className="text-[10px] text-textBlack/50 font-mono">
              {item.tinNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Current Tier",
      key: "currentTier",
      render: (item: TierUpgradeRequest) => {
        const t = getTierConfig(item.currentTier);
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-textBlack">
            {t.badge} ({t.name})
          </span>
        );
      },
    },
    {
      label: "Target Tier",
      key: "requestedTier",
      render: (item: TierUpgradeRequest) => {
        const t = getTierConfig(item.requestedTier);
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {t.badge} ({t.name})
          </span>
        );
      },
    },
    {
      label: "Submission Date",
      key: "createdAt",
      render: (item: TierUpgradeRequest) => (
        <span className="text-xs text-textBlack/70">
          {formatPrettyDate(item.createdAt)}
        </span>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (item: TierUpgradeRequest) => <StatusBadge status={item.status} />,
    },
    {
      label: "Actions",
      key: "actions",
      render: (item: TierUpgradeRequest) => (
        <button
          onClick={() => setSelectedRequest(item)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition shadow-xs cursor-pointer"
        >
          {item.status === "pending" ? "Review & Verify" : "View Dossier"}
        </button>
      ),
    },
  ];

  // Table Columns for Company Directory
  const companyColumns: TableColumnProps<CompanyProps>[] = [
    {
      label: "Company",
      key: "name",
      render: (item: CompanyProps) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">
            {item.name || item.companyName || "N/A"}
          </span>
          <span className="text-[10px] text-textBlack/60 lowercase">
            {item.email}
          </span>
        </div>
      ),
    },
    {
      label: "Staff Enrolled",
      key: "staff",
      render: (item: CompanyProps) => {
        const count = item.no_of_employee ?? item.staff ?? item.staffCount ?? 0;
        return (
          <span className="text-xs text-textBlack font-medium">
            {count} Staff
          </span>
        );
      },
    },
    {
      label: "Active Tier",
      key: "tier",
      render: (item: CompanyProps) => {
        const t = getTierConfig(item.tier);
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {t.badge} ({t.name})
          </span>
        );
      },
    },
    {
      label: "Staff Capacity",
      key: "limit",
      render: (item: CompanyProps) => {
        const t = getTierConfig(item.tier);
        return (
          <span className="text-xs text-textBlack/80 font-medium">
            {String(t.no_of_staff).toLowerCase() === "unlimited"
              ? "Unlimited Staff"
              : `${t.no_of_staff} Staff`}
          </span>
        );
      },
    },
    {
      label: "Account Status",
      key: "status",
      render: (item: CompanyProps) => {
        const s =
          typeof item.status === "boolean"
            ? item.status ? "Active" : "Inactive"
            : item.status || (item.is_active ? "Active" : "Inactive");
        return <StatusBadge status={s} />;
      },
    },
    {
      label: "Actions",
      key: "actions",
      render: (item: CompanyProps) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCompanyForView(item)}
            title="View Profile, Staff, and Documents"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-primary/20 text-textBlack/80 hover:bg-secondary transition cursor-pointer"
          >
            <LuEye className="text-xs text-primary" /> View Details
          </button>
          <button
            onClick={() => setSelectedCompanyForTier(item)}
            title="Change Company Tier"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-primary/20 text-primary hover:bg-primary/10 transition cursor-pointer"
          >
            <LuSlidersHorizontal className="text-xs" /> Tier
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-textBlack">
            Corporate Verification & KYC Review
          </h2>
          <p className="text-xs text-textBlack/60">
            Review uploaded corporate documents, verify company compliance against tier requirements, and approve limits
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <OverviewCards
          icon={LuBuilding2}
          title="Total Clients"
          value={totalCompaniesCount}
        />
        <OverviewCards
          icon={LuClock}
          title="Pending Verifications"
          value={pendingRequestsCount}
        />
        <OverviewCards
          icon={LuBuilding2}
          title="Verified Companies"
          value={statsData?.verifiedCompanies ?? 0}
        />
        <OverviewCards
          icon={LuUsersRound}
          title="Total Staff Enrolled"
          value={statsData?.totalStaff ?? 0}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "requests"
              ? "bg-primary text-white shadow-xs"
              : "text-textBlack/70 hover:text-textBlack hover:bg-secondary"
          }`}
        >
          <LuClock className="text-sm" />
          <span>Verification & Upgrade Queue</span>
          {pendingRequestsCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "requests"
                  ? "bg-white text-primary font-bold"
                  : "bg-amber-500 text-white font-bold"
              }`}
            >
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("companies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "companies"
              ? "bg-primary text-white shadow-xs"
              : "text-textBlack/70 hover:text-textBlack hover:bg-secondary"
          }`}
        >
          <LuUsersRound className="text-sm" />
          <span>Enrolled Companies Directory</span>
        </button>
      </div>

      {/* TAB 1: TIER UPGRADE & VERIFICATION APPLICATIONS */}
      {activeTab === "requests" && (
        <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-textBlack">
              Corporate Verification & Upgrade Queue
            </h3>
            <p className="text-xs text-textBlack/60">
              Review submitted CAC documents, tax identification, and corporate director details
            </p>
          </div>

          <ReusableTable
            columns={requestColumns}
            data={tierRequests}
            isLoading={loadingRequests}
            error={null}
            currentPage={1}
            totalPages={1}
            totalItems={tierRequests.length}
            itemsPerPage={20}
            setCurrentPage={() => {}}
            setItemsPerPage={() => {}}
            hasSerialNo={true}
          />
        </div>
      )}

      {/* TAB 2: COMPANY TIER DIRECTORY */}
      {activeTab === "companies" && (
        <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-textBlack">
                Enrolled Corporate Accounts
              </h3>
              <p className="text-xs text-textBlack/60">
                Inspect company profiles, view enrolled staff rosters, and adjust tier allocations
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
                <input
                  type="text"
                  value={companySearchTerm}
                  onChange={(e) => setCompanySearchTerm(e.target.value)}
                  placeholder="Search company..."
                  className="h-9 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none w-48 md:w-60 focus:border-primary/30"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-secondary border border-primary/10 rounded-lg px-2 py-1">
                <LuListFilter className="text-primary text-xs" />
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-transparent text-xs text-textBlack outline-none cursor-pointer"
                >
                  <option value="all">All Tiers</option>
                  {allTiersList.map((tier) => (
                    <option key={tier.id} value={String(tier.level || tier.id)}>
                      Level {tier.level} ({tier.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <ReusableTable
            columns={companyColumns}
            data={filteredCompanies}
            isLoading={loadingCompanies}
            error={null}
            currentPage={companyPage}
            totalPages={companiesData?.totalPages ?? 1}
            totalItems={companiesData?.totalItems ?? filteredCompanies.length}
            itemsPerPage={companyItemsPerPage}
            setCurrentPage={setCompanyPage}
            setItemsPerPage={setCompanyItemsPerPage}
            hasSerialNo={true}
          />
        </div>
      )}

      {/* View Company Details Modal: Shows full details, CAC files, and enrolled staff roster */}
      {selectedCompanyForView && (
        <ViewCompanyModal
          selectedCompany={selectedCompanyForView}
          onClose={() => setSelectedCompanyForView(null)}
        />
      )}

      {/* Admin Change Tier Modal */}
      {selectedCompanyForTier && (
        <ChangeTierModal
          company={selectedCompanyForTier}
          onClose={() => {
            setSelectedCompanyForTier(null);
            refetchCompanies();
          }}
        />
      )}

      {/* Admin Review Upgrade Request Modal */}
      {selectedRequest && (
        <ReviewTierRequestModal
          request={selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
            refetchRequests();
            refetchCompanies();
          }}
        />
      )}
    </div>
  );
};

export default SupportManageCompanyVerification;
