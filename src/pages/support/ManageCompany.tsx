import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell, { type OtherActionProps } from "../../components/ui/ActionCell";
import ViewCompanyModal from "../../components/modal/view/ViewCompanyModal";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import OverviewCards from "../../components/cards/OverviewCards";
import StatusBadge from "../../components/ui/StatusBadge";
import { toast } from "sonner";
import type { CompanyProps, TableColumnProps } from "../../lib/interfaces";
import { useCompanies, useCompanyStats, useDeleteCompany } from "../../hooks/useCompany";
import { getTierConfig } from "../../services/tierService";
import ChangeTierModal from "../../components/modal/tier/ChangeTierModal";
import { FiSearch } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { LuShieldCheck, LuUsersRound, LuBuilding, LuSlidersHorizontal } from "react-icons/lu";
import { FaUserCheck, FaUserSlash } from "react-icons/fa6";
import { useActivateUser, useDeactivateUser } from "../../hooks/useStaff";

const SupportManageCompany: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProps | null>(null);
  const [companyForTierChange, setCompanyForTierChange] = useState<CompanyProps | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Main paginated query
  const {
    data,
    isLoading: loadingCompany,
    isFetching,
    error: tableError,
    refetch,
  } = useCompanies({
    page: currentPage,
    searchTerm: debouncedSearch,
    per_page: itemsPerPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Full company stats query for top KPI cards
  const { data: statsData } = useCompanyStats();

  const companies = data?.items ?? [];
  const totalItems = data?.totalItems ?? companies.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Helper function to check active status
  const isCompanyActive = (company?: CompanyProps | null) => {
    if (!company) return false;
    if (typeof company.status === "boolean") return company.status;
    const s = String(
      company.status !== undefined && company.status !== null
        ? company.status
        : company.is_active ?? ""
    ).toLowerCase();
    return s === "active" || s === "1" || s === "true" || s === "successful" || s === "verified";
  };

  // Compute metrics dynamically from /company-stats or companies list
  const allCompanies = statsData?.items && statsData.items.length > 0 ? statsData.items : companies;
  const totalCompaniesCount = statsData?.totalCompanies || statsData?.totalItems || totalItems;

  const activeCount = useMemo(() => {
    if (statsData?.activeCompanies !== undefined && statsData.activeCompanies > 0) {
      return statsData.activeCompanies;
    }
    return allCompanies.filter((c) => isCompanyActive(c)).length;
  }, [allCompanies, statsData?.activeCompanies]);

  const totalStaffCount = useMemo(() => {
    if (statsData?.totalStaff !== undefined && statsData.totalStaff > 0) {
      return statsData.totalStaff;
    }
    return allCompanies.reduce(
      (sum, c) => sum + Number(c.no_of_employee ?? c.staff ?? c.staffCount ?? 0),
      0
    );
  }, [allCompanies, statsData?.totalStaff]);

  const verifiedCount = useMemo(() => {
    if (statsData?.verifiedCompanies !== undefined && statsData.verifiedCompanies > 0) {
      return statsData.verifiedCompanies;
    }
    return allCompanies.filter((c) => {
      const v = String(c.verificationStatus || c.status || "").toLowerCase();
      return v === "verified" || v === "successful";
    }).length;
  }, [allCompanies, statsData?.verifiedCompanies]);

  // Mutations
  const deleteCompanyMutation = useDeleteCompany();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  const handleDelete = async () => {
    if (!selectedCompany?.id) return;
    deleteCompanyMutation.mutate(selectedCompany.id, {
      onSuccess: () => {
        toast.success(
          `Company "${selectedCompany.name || selectedCompany.companyName || "Account"}" deleted successfully`
        );
        setDeleteModal(false);
        setSelectedCompany(null);
        refetch();
      },
    });
  };

  const handleToggleStatus = () => {
    if (!selectedCompany?.id) return;
    const currentlyActive = isCompanyActive(selectedCompany);

    if (currentlyActive) {
      deactivateMutation.mutate(selectedCompany.id, {
        onSuccess: () => {
          toast.success(
            `Company "${selectedCompany.name || selectedCompany.companyName || "Account"}" deactivated successfully`
          );
          setStatusModal(false);
          setSelectedCompany(null);
          refetch();
        },
      });
    } else {
      activateMutation.mutate(selectedCompany.id, {
        onSuccess: () => {
          toast.success(
            `Company "${selectedCompany.name || selectedCompany.companyName || "Account"}" activated successfully`
          );
          setStatusModal(false);
          setSelectedCompany(null);
          refetch();
        },
      });
    }
  };

  const columns: TableColumnProps<CompanyProps>[] = [
    {
      label: "Company Name",
      key: "name",
      render: (item: CompanyProps) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">
            {item.name || item.companyName || "N/A"}
          </span>
          {(item.rcNumber || item.rc_number) && (
            <span className="text-[10px] text-textBlack/50 font-mono">
              {item.rcNumber || item.rc_number}
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (item: CompanyProps) => (
        <span className="text-textBlack/70 text-xs lowercase">{item.email}</span>
      ),
    },
    {
      label: "Phone Number",
      key: "phone",
      render: (item: CompanyProps) => (
        <span className="text-textBlack/70 text-xs">
          {item.phone || item.phoneNumber || "N/A"}
        </span>
      ),
    },
    {
      label: "Number of Staff",
      key: "staff",
      render: (item: CompanyProps) => (
        <span className="text-textBlack font-medium text-xs">
          {item.no_of_employee ?? item.staff ?? item.staffCount ?? 0} Staff
        </span>
      ),
    },
    {
      label: "Tier",
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
      label: "Status",
      key: "status",
      render: (item: CompanyProps) => {
        const statusStr = isCompanyActive(item) ? "Active" : "Inactive";
        return <StatusBadge status={statusStr} />;
      },
    },
    {
      label: "Actions",
      key: "actions",
      render: (item: CompanyProps) => {
        const currentlyActive = isCompanyActive(item);

        const otherActions: OtherActionProps[] = [
          {
            name: "Modify Tier",
            icon: <LuSlidersHorizontal className="text-primary" />,
            action: () => setCompanyForTierChange(item),
          },
          {
            name: currentlyActive ? "Deactivate Account" : "Activate Account",
            icon: currentlyActive ? (
              <FaUserSlash className="text-amber-500" />
            ) : (
              <FaUserCheck className="text-emerald-500" />
            ),
            action: () => {
              setSelectedCompany(item);
              setStatusModal(true);
            },
          },
        ];

        return (
          <ActionCell
            rowId={Number(item.id ?? 0)}
            canView={true}
            onView={() => setSelectedCompany(item)}
            onDelete={() => {
              setSelectedCompany(item);
              setDeleteModal(true);
            }}
            otherActions={otherActions}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">
            Manage <span className="capitalize">Companies</span>
          </h2>
          <p className="text-xs text-textBlack/60">
            View, search, and manage registered corporate client accounts
          </p>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          icon={HiOutlineBuildingOffice2}
          title="Total Companies"
          value={totalCompaniesCount}
        />
        <OverviewCards
          icon={LuShieldCheck}
          title="Active Accounts"
          value={activeCount}
        />
        <OverviewCards
          icon={LuBuilding}
          title="Verified Companies"
          value={verifiedCount}
        />
        <OverviewCards
          icon={LuUsersRound}
          title="Total Staff Enrolled"
          value={`${totalStaffCount.toLocaleString()}`}
        />
      </div>

      {/* Main Companies Table */}
      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies, emails, phone..."
              className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-sm text-textBlack outline-none w-56 md:w-72 focus:border-primary/30 transition-colors placeholder:text-textBlack/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none cursor-pointer focus:border-primary/30"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Inactive Accounts</option>
              <option value="verified">Verified Accounts</option>
              <option value="pending">Pending Accounts</option>
            </select>
          </div>
        </div>

        <ReusableTable
          columns={columns}
          data={companies}
          isLoading={loadingCompany || isFetching}
          error={tableError}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          hasSerialNo={true}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModal && Boolean(selectedCompany)}
        title="Delete Company Account"
        message={`Are you sure you want to delete ${
          selectedCompany?.name || selectedCompany?.companyName || "this company"
        }? All associated staff rosters and payment history will be unlinked. This action cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={deleteCompanyMutation.isPending}
        onCancel={() => {
          setDeleteModal(false);
          setSelectedCompany(null);
        }}
        onConfirm={handleDelete}
      />

      {/* View Company Details Modal */}
      {selectedCompany && !deleteModal && !statusModal && (
        <ViewCompanyModal
          selectedCompany={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}

      {/* Change Tier Modal */}
      {companyForTierChange && (
        <ChangeTierModal
          company={companyForTierChange}
          onClose={() => {
            setCompanyForTierChange(null);
            refetch();
          }}
        />
      )}

      {/* Activate / Deactivate Confirmation Modal */}
      <ConfirmDialog
        isOpen={statusModal && Boolean(selectedCompany)}
        title={
          isCompanyActive(selectedCompany)
            ? "Deactivate Company Account"
            : "Activate Company Account"
        }
        message={
          isCompanyActive(selectedCompany)
            ? `Are you sure you want to deactivate ${
                selectedCompany?.name || selectedCompany?.companyName || "this company"
              }? The account will be suspended and users will be temporarily unable to log in.`
            : `Are you sure you want to activate ${
                selectedCompany?.name || selectedCompany?.companyName || "this company"
              }? Dashboard access and operational permissions will be restored.`
        }
        confirmText={
          isCompanyActive(selectedCompany) ? "Yes, Deactivate" : "Yes, Activate"
        }
        isLoading={activateMutation.isPending || deactivateMutation.isPending}
        onCancel={() => {
          setStatusModal(false);
          setSelectedCompany(null);
        }}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
};

export default SupportManageCompany;
