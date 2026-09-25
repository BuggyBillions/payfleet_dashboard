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

const ManageCompanyVerification: React.FC = () => {
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
  const { data: tierRequests = [], isLoading: loadingRequests, refetch: refetchRequests } = useTierRequests();

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


      <div className="bg-tertiary rounded-2xl p-4 border border-primary/10 shadow-xs space-y-4">
        
        <ReusableTable
          columns={requestColumns}
          data={tierRequests}
          isLoading={loadingRequests}
          error={null}
          currentPage={1}
          totalPages={1}
          totalItems={tierRequests.length}
          itemsPerPage={20}
          setCurrentPage={() => { }}
          setItemsPerPage={() => { }}
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

export default ManageCompanyVerification;
