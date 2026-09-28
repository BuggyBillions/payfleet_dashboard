import React, { useMemo, useState, useEffect } from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import ReusableTable from "../../utility/ReusableTable";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  CompanyProps,
  TableColumnProps,
  TierUpgradeRequest,
} from "../../lib/interfaces";
import { useCompanies, useCompanyStats } from "../../hooks/useCompany";
import { useTierRequests } from "../../hooks/useTier";
import { getTierConfig } from "../../services/tierService";
import ReviewTierRequestModal from "../../components/modal/tier/ReviewTierRequestModal";
import ViewCompanyModal from "../../components/modal/view/ViewCompanyModal";
import { formatPrettyDate } from "../../helpers/formatterUtility";
import {
  LuBuilding2,
  LuUsersRound,
  LuClock,
} from "react-icons/lu";
import { FiSearch } from "react-icons/fi";

const ManageCompanyVerification: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [selectedCompanyForView, setSelectedCompanyForView] = useState<CompanyProps | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TierUpgradeRequest | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Companies Queries
  const { data: companiesData, refetch: refetchCompanies } = useCompanies();
  const { data: statsData } = useCompanyStats();

  // Fetch Tier Upgrade Requests with search
  const {
    data: rawTierRequests,
    isLoading: loadingRequests,
    isFetching,
    error: tableError,
    refetch: refetchRequests,
  } = useTierRequests({
    search: debouncedSearch,
  });

  const tierRequests: TierUpgradeRequest[] = useMemo(() => {
    if (Array.isArray(rawTierRequests)) return rawTierRequests;
    if (
      rawTierRequests &&
      typeof rawTierRequests === "object" &&
      "data" in rawTierRequests &&
      Array.isArray((rawTierRequests as { data: unknown }).data)
    ) {
      return (rawTierRequests as { data: TierUpgradeRequest[] }).data;
    }
    return [];
  }, [rawTierRequests]);

  const allCompanies = statsData?.items ?? companiesData?.items ?? [];

  // Client-side search and status filter fallback
  const filteredRequests = useMemo(() => {
    let result = tierRequests;

    if (statusFilter !== "all") {
      result = result.filter((req) => req.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter((req) => {
        const cName = (req.companyName || req.company?.name || "").toLowerCase();
        const cEmail = (req.companyEmail || req.company?.email || "").toLowerCase();
        const curTier = (getTierConfig(req.current_tier || req.currentTier).name).toLowerCase();
        const reqTier = (getTierConfig(req.requested_tier || req.requestedTier).name).toLowerCase();
        return (
          cName.includes(q) ||
          cEmail.includes(q) ||
          curTier.includes(q) ||
          reqTier.includes(q)
        );
      });
    }

    return result;
  }, [tierRequests, statusFilter, debouncedSearch]);

  // Dynamic statistics
  const totalCompaniesCount = statsData?.totalCompanies ?? statsData?.totalItems ?? allCompanies.length;
  const pendingRequestsCount = useMemo(() => {
    return tierRequests.filter((r) => r.status === "pending").length;
  }, [tierRequests]);
  const approvedRequestsCount = useMemo(() => {
    return tierRequests.filter((r) => r.status === "approved").length;
  }, [tierRequests]);
  const rejectedRequestsCount = useMemo(() => {
    return tierRequests.filter((r) => r.status === "rejected").length;
  }, [tierRequests]);

  const statusTabs = [
    { label: "All", value: "all", count: tierRequests.length },
    { label: "Pending", value: "pending", count: pendingRequestsCount },
    { label: "Approved", value: "approved", count: approvedRequestsCount },
    { label: "Rejected", value: "rejected", count: rejectedRequestsCount },
  ];

  // Pagination calculation
  const totalItems = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  // Table Columns for Tier Upgrade / Verification Requests
  const requestColumns: TableColumnProps<TierUpgradeRequest>[] = [
    {
      label: "Company / Applicant",
      key: "companyName",
      render: (item: TierUpgradeRequest) => (
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-textBlack text-xs truncate">
              {item.companyName || item.company?.name || "N/A"}
            </span>
            <span className="text-[10px] text-textBlack/60 lowercase truncate max-w-40">
              {item.company?.email || "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Current Tier",
      key: "currentTier",
      render: (item: TierUpgradeRequest) => {
        const t = getTierConfig(item.current_tier || item.currentTier);
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-textBlack border border-primary/10">
            {t.badge} ({t.name})
          </span>
        );
      },
    },
    {
      label: "Target Tier",
      key: "requestedTier",
      render: (item: TierUpgradeRequest) => {
        const t = getTierConfig(item.requested_tier || item.requestedTier);
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {t.badge} ({t.name})
          </span>
        );
      },
    },
    {
      label: "Submission Date",
      key: "createdAt",
      render: (item: TierUpgradeRequest) => (
        <span className="text-xs text-textBlack/70 whitespace-nowrap">
          {formatPrettyDate(String(item.createdAt) || String(item.created_at))}
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

      {/* Main Table Card */}
      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-xs space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, email, RC number, tier..."
              className="h-9 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none w-64 md:w-80 focus:border-primary/30 transition-colors placeholder:text-textBlack/40"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-secondary p-1 rounded-xl border border-primary/10 self-start sm:self-auto">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${isActive
                      ? "bg-primary text-white shadow-xs font-semibold"
                      : "text-textBlack/60 hover:text-textBlack hover:bg-primary/5"
                    }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isActive
                          ? "bg-white/20 text-white"
                          : tab.value === "pending" && tab.count > 0
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-primary/10 text-textBlack/60"
                        }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <ReusableTable
          columns={requestColumns}
          data={paginatedData}
          isLoading={loadingRequests || isFetching}
          error={tableError ? "Failed to load tier upgrade requests" : null}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          hasSerialNo={true}
        />
      </div>

      {/* View Company Details Modal: Shows full details, CAC files, and enrolled staff roster */}
      {selectedCompanyForView && (
        <ViewCompanyModal
          selectedCompany={selectedCompanyForView}
          onClose={() => setSelectedCompanyForView(null)}
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

export default ManageCompanyVerification;
