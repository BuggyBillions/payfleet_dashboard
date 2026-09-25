import React, { useMemo, useState } from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import ReusableTable from "../../utility/ReusableTable";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import type {
  CompanyProps,
  TableColumnProps,
  TierUpgradeRequest,
  TierItem,
} from "../../lib/interfaces";
import { useCompanyStats } from "../../hooks/useCompany";
import { useTierRequests, useAllTiers, useDeleteTier } from "../../hooks/useTier";
import ChangeTierModal from "../../components/modal/tier/ChangeTierModal";
import ReviewTierRequestModal from "../../components/modal/tier/ReviewTierRequestModal";
import CreateEditTierModal from "../../components/modal/tier/CreateEditTierModal";
import ViewTierDetailsModal from "../../components/modal/tier/ViewTierDetailsModal";
import {
  LuBuilding2,
  LuUsersRound,
  LuClock,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuLayers,
  LuEye,
} from "react-icons/lu";
import { FiSearch } from "react-icons/fi";

const ManageTier: React.FC = () => {
  const [tierSearchTerm, setTierSearchTerm] = useState("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tierToEdit, setTierToEdit] = useState<TierItem | null>(null);
  const [tierToDelete, setTierToDelete] = useState<TierItem | null>(null);
  const [viewTierId, setViewTierId] = useState<number | string | null>(null);
  const [selectedCompanyForTier, setSelectedCompanyForTier] = useState<CompanyProps | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TierUpgradeRequest | null>(null);

  // Dynamic Tiers query from GET /all-tiers?search=...
  const { data: allTiersList = [], isLoading: loadingTiers } = useAllTiers(tierSearchTerm);

  // Delete tier mutation: DELETE /delete-tiers/{id}
  const deleteTierMutation = useDeleteTier();

  const { data: statsData } = useCompanyStats();
  const { data: tierRequests = [] } = useTierRequests();


  // Filtered companies based on search and tier filter

  // Dynamic statistics
  const totalCompaniesCount = statsData?.totalCompanies ?? statsData?.totalItems ;
  const pendingRequestsCount = useMemo(() => {
    return tierRequests.filter((r) => r.status === "pending").length;
  }, [tierRequests]);

  const handleDeleteTier = () => {
    if (!tierToDelete?.id) return;
    deleteTierMutation.mutate(tierToDelete.id, {
      onSuccess: () => {
        setTierToDelete(null);
      },
    });
  };

  // Table Columns for Tiers (GET /all-tiers)
  const tierColumns: TableColumnProps<TierItem>[] = [
    {
      label: "Tier Level",
      key: "level",
      render: (item: TierItem) => (
        <span className="text-xs font-semibold text-primary font-mono">
          Level {item.level}
        </span>
      ),
    },
    {
      label: "Tier Name",
      key: "name",
      render: (item: TierItem) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">{item.name}</span>
        </div>
      ),
    },
    {
      label: "Staff Capacity",
      key: "no_of_staff",
      render: (item: TierItem) => (
        <span className="text-xs text-textBlack font-medium">
          {String(item.no_of_staff).toLowerCase() === "unlimited"
            ? "Unlimited Staff"
            : `${item.no_of_staff} Staff`}
        </span>
      ),
    },
    {
      label: "Requirements",
      key: "requirements",
      render: (item: TierItem) => {
        const reqs = String(item.requirements || "")
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);

        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {reqs.length > 0 ? (
              reqs.map((req, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-secondary border border-primary/10 text-[10px] font-medium text-textBlack/80"
                >
                  {req}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-textBlack/40">None specified</span>
            )}
          </div>
        );
      },
    },
    {
      label: "Actions",
      key: "actions",
      render: (item: TierItem) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewTierId(item.id)}
            title="View Details"
            className="p-1.5 rounded-lg text-textBlack/60 hover:text-primary hover:bg-secondary transition cursor-pointer"
          >
            <LuEye size={15} />
          </button>
          <button
            onClick={() => setTierToEdit(item)}
            title="Edit Tier"
            className="p-1.5 rounded-lg text-textBlack/60 hover:text-primary hover:bg-secondary transition cursor-pointer"
          >
            <LuPencil size={15} />
          </button>
          <button
            onClick={() => setTierToDelete(item)}
            title="Delete Tier"
            className="p-1.5 rounded-lg text-textBlack/60 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
          >
            <LuTrash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  // Table Columns for Tier Upgrade Requests

  // Table Columns for Company Directory

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-textBlack">
            Tier & Limits Management
          </h2>
          <p className="text-xs text-textBlack/60">
            Configure subscription tiers, monitor corporate limits, and review compliance requests
          </p>
        </div>

        {/* Create Tier CTA: POST /create-tier */}
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          <LuPlus className="text-base" />
          <span>Create New Tier</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <OverviewCards
          icon={LuLayers}
          title="Configured Tiers"
          value={allTiersList.length}
        />
        <OverviewCards
          icon={LuBuilding2}
          title="Total Clients"
          value={totalCompaniesCount}
        />
        <OverviewCards
          icon={LuClock}
          title="Pending Upgrades"
          value={pendingRequestsCount}
        />
        <OverviewCards
          icon={LuUsersRound}
          title="Total Staff Enrolled"
          value={statsData?.totalStaff ?? 0}
        />
      </div>



      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          {/* Search Tiers: /all-tiers?search=... */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
            <input
              type="text"
              value={tierSearchTerm}
              onChange={(e) => setTierSearchTerm(e.target.value)}
              placeholder="Search tiers..."
              className="h-9 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none w-48 md:w-80 focus:border-primary/30"
            />
          </div>
        </div>

        <ReusableTable
          columns={tierColumns}
          data={allTiersList}
          isLoading={loadingTiers}
          error={null}
          currentPage={1}
          totalPages={1}
          totalItems={allTiersList.length}
          itemsPerPage={Math.max(10, allTiersList.length)}
          setCurrentPage={() => { }}
          setItemsPerPage={() => { }}
          hasSerialNo={true}
        />
      </div>

      {/* View Tier Details Modal: GET /each-tiers/{id} */}
      {viewTierId && (
        <ViewTierDetailsModal
          tierId={viewTierId}
          onClose={() => setViewTierId(null)}
          onEdit={(t) => {
            setViewTierId(null);
            setTierToEdit(t);
          }}
        />
      )}

      {/* Create / Edit Tier Modal: POST /create-tier OR POST /update-tier/{id} */}
      {(createModalOpen || tierToEdit) && (
        <CreateEditTierModal
          tier={tierToEdit}
          onClose={() => {
            setCreateModalOpen(false);
            setTierToEdit(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog: DELETE /delete-tiers/{id} */}
      <ConfirmDialog
        isOpen={Boolean(tierToDelete)}
        title="Delete Subscription Tier"
        message={`Are you sure you want to delete "${tierToDelete?.name}" (Level ${tierToDelete?.level})?`}
        confirmText="Yes, Delete Tier"
        isLoading={deleteTierMutation.isPending}
        onCancel={() => setTierToDelete(null)}
        onConfirm={handleDeleteTier}
      />

      {/* Admin Change Tier Modal */}
      {selectedCompanyForTier && (
        <ChangeTierModal
          company={selectedCompanyForTier}
          onClose={() => setSelectedCompanyForTier(null)}
        />
      )}

      {/* Admin Review Upgrade Request Modal */}
      {selectedRequest && (
        <ReviewTierRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

export default ManageTier;
