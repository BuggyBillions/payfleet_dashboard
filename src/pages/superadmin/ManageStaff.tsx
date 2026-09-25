import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell, { type OtherActionProps } from "../../components/ui/ActionCell";
import EditStaffModal from "../../components/modal/view/EditStaffModal";
import ViewStaffModal from "../../components/modal/view/ViewStaffModal";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionButton from "../../components/ui/ActionButton";
import StatusBadge from "../../components/ui/StatusBadge";
import OverviewCards from "../../components/cards/OverviewCards";
import type { StaffProps, TableColumnProps } from "../../lib/interfaces";
import {
  useStaffs,
  useStaffStats,
  useActivateUser,
  useDeactivateUser,
  useDeleteUser,
} from "../../hooks/useStaff";
import { FaPlus, FaUserCheck, FaUserSlash } from "react-icons/fa6";
import { FiSearch, FiUsers, FiDollarSign, FiHeadphones, FiCheckCircle } from "react-icons/fi";

const ManageStaff: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [createStaff, setCreateStaff] = useState(false);
  const [editStaff, setEditStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffProps | null>(null);
  const [viewStaff, setViewStaff] = useState<StaffProps | null>(null);

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
    isLoading: loadingStaff,
    isFetching,
    error: tableError,
    refetch,
  } = useStaffs({
    page: currentPage,
    searchTerm: debouncedSearch,
    per_page: itemsPerPage,
    role: roleFilter || "all",
  });

  // Full staff stats query for top KPI cards
  const { data: statsData } = useStaffStats();

  const staffList = data?.items ?? [];
  const totalItems = data?.totalItems ?? staffList.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Dynamic KPI Metrics derived from /staff-stats or staff list
  const allStaff = statsData?.items && statsData.items.length > 0 ? statsData.items : staffList;
  const totalStaffCount = statsData?.totalStaff || statsData?.totalItems || totalItems;

  const isStaffActive = (staff?: StaffProps | null) => {
    if (!staff) return false;
    if (typeof staff.status === "boolean") return staff.status;
    const s = String(
      staff.status !== undefined && staff.status !== null
        ? staff.status
        : staff.is_active ?? staff.enabled ?? ""
    ).toLowerCase();
    return s === "active" || s === "1" || s === "true" || s === "successful";
  };

  const financeCount = useMemo(() => {
    if (statsData?.financeStaff !== undefined && statsData.financeStaff > 0) {
      return statsData.financeStaff;
    }
    return allStaff.filter((s) =>
      String(s.role || "").toLowerCase().includes("finance")
    ).length;
  }, [allStaff, statsData?.financeStaff]);

  const supportCount = useMemo(() => {
    if (statsData?.supportStaff !== undefined && statsData.supportStaff > 0) {
      return statsData.supportStaff;
    }
    return allStaff.filter((s) =>
      String(s.role || "").toLowerCase().includes("support")
    ).length;
  }, [allStaff, statsData?.supportStaff]);

  const activeCount = useMemo(() => {
    if (statsData?.activeStaff !== undefined && statsData.activeStaff > 0) {
      return statsData.activeStaff;
    }
    return allStaff.filter((s) => isStaffActive(s)).length;
  }, [allStaff, statsData?.activeStaff]);

  // Mutations
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const deleteMutation = useDeleteUser();

  const handleDelete = () => {
    if (!selectedStaff?.id) return;
    deleteMutation.mutate(selectedStaff.id, {
      onSuccess: () => {
        setDeleteModal(false);
        setSelectedStaff(null);
      },
    });
  };

  const handleToggleStatus = () => {
    if (!selectedStaff?.id) return;
    const currentlyActive = isStaffActive(selectedStaff);

    if (currentlyActive) {
      deactivateMutation.mutate(selectedStaff.id, {
        onSuccess: () => {
          setStatusModal(false);
          setSelectedStaff(null);
        },
      });
    } else {
      activateMutation.mutate(selectedStaff.id, {
        onSuccess: () => {
          setStatusModal(false);
          setSelectedStaff(null);
        },
      });
    }
  };

  const columns: TableColumnProps<StaffProps>[] = [
    {
      label: "Staff Member",
      key: "name",
      render: (item: StaffProps) => {
        const displayName =
          item.name ||
          (item.first_name
            ? `${item.first_name} ${item.last_name || ""}`.trim()
            : item.full_name || item.username || "Staff Member");
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-textBlack text-xs">{displayName}</span>
          </div>
        );
      },
    },
    {
      label: "Email",
      key: "email",
      render: (item: StaffProps) => (
        <span className="text-textBlack/70 text-xs lowercase">{item.email}</span>
      ),
    },
    {
      label: "Phone Number",
      key: "phoneNumber",
      render: (item: StaffProps) => (
        <span className="text-textBlack/70 text-xs">
          {item.phoneNumber || item.phone || "N/A"}
        </span>
      ),
    },
    {
      label: "Role",
      key: "role",
      render: (item: StaffProps) => {
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize`}
          >
            {item.role || "Staff"}
          </span>
        );
      },
    },
    {
      label: "Status",
      key: "status",
      render: (item: StaffProps) => {
        const statusStr = isStaffActive(item) ? "Active" : "Inactive";
        return <StatusBadge status={statusStr} />;
      },
    },
    {
      label: "Actions",
      key: "actions",
      render: (item: StaffProps) => {
        const currentlyActive = isStaffActive(item);

        const otherActions: OtherActionProps[] = [
          {
            name: currentlyActive ? "Deactivate User" : "Activate User",
            icon: currentlyActive ? (
              <FaUserSlash className="text-amber-500" />
            ) : (
              <FaUserCheck className="text-emerald-500" />
            ),
            action: () => {
              setSelectedStaff(item);
              setStatusModal(true);
            },
          },
        ];

        return (
          <ActionCell
            rowId={Number(item.id ?? 0)}
            canView={true}
            onView={() => setViewStaff(item)}
            onEdit={() => {
              setSelectedStaff(item);
              setEditStaff(true);
              setCreateStaff(false);
            }}
            onDelete={() => {
              setSelectedStaff(item);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack">Manage Staff</h2>
          <p className="text-xs text-textBlack/60">
            Create, activate, deactivate, and oversee internal financial and support officers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton
            text="Add Staff"
            icon={<FaPlus />}
            onClick={() => {
              setSelectedStaff(null);
              setEditStaff(false);
              setCreateStaff(true);
            }}
          />
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          icon={FiUsers}
          title="Total Staff"
          value={totalStaffCount}
        />
        <OverviewCards
          icon={FiDollarSign}
          title="Finance Officers"
          value={financeCount}
        />
        <OverviewCards
          icon={FiHeadphones}
          title="Support Officers"
          value={supportCount}
        />
        <OverviewCards
          icon={FiCheckCircle}
          title="Active Accounts"
          value={activeCount}
        />
      </div>

      {/* Main Staff Table Container */}
      <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
        {/* Filters and Search Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-sm text-textBlack outline-none w-56 md:w-72 focus:border-primary/30 transition-colors placeholder:text-textBlack/40"
              />
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-lg border border-primary/10 self-start sm:self-auto">
            {["all", "finance", "support"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRoleFilter(r);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer capitalize ${
                  roleFilter === r
                    ? "bg-primary text-white shadow-sm"
                    : "text-textBlack/60 hover:text-textBlack hover:bg-primary/5"
                }`}
              >
                {r === "all" ? "All Roles" : `${r} Officers`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <ReusableTable
          columns={columns}
          data={staffList}
          isLoading={loadingStaff || isFetching}
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
        isOpen={deleteModal && Boolean(selectedStaff)}
        title="Delete Staff Member"
        message={`Are you sure you want to remove ${
          selectedStaff?.name || selectedStaff?.email || "this staff member"
        }? This account will lose all system access and cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          setDeleteModal(false);
          setSelectedStaff(null);
        }}
        onConfirm={handleDelete}
      />

      {/* Activate / Deactivate Confirmation Modal */}
      <ConfirmDialog
        isOpen={statusModal && Boolean(selectedStaff)}
        title={
          isStaffActive(selectedStaff)
            ? "Deactivate Staff Account"
            : "Activate Staff Account"
        }
        message={
          isStaffActive(selectedStaff)
            ? `Are you sure you want to deactivate ${
                selectedStaff?.name || selectedStaff?.email || "this staff member"
              }? They will be suspended and temporarily unable to log in to the dashboard.`
            : `Are you sure you want to activate ${
                selectedStaff?.name || selectedStaff?.email || "this staff member"
              }? Their dashboard access and operational permissions will be restored.`
        }
        confirmText={
          isStaffActive(selectedStaff) ? "Yes, Deactivate" : "Yes, Activate"
        }
        isLoading={activateMutation.isPending || deactivateMutation.isPending}
        onCancel={() => {
          setStatusModal(false);
          setSelectedStaff(null);
        }}
        onConfirm={handleToggleStatus}
      />

      {/* Create / Edit Staff Modal */}
      {(editStaff || createStaff) && (
        <EditStaffModal
          selectedStaff={selectedStaff}
          isEdit={Boolean(editStaff && selectedStaff)}
          onClose={() => {
            setSelectedStaff(null);
            setCreateStaff(false);
            setEditStaff(false);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* View Staff Details Modal */}
      {viewStaff && (
        <ViewStaffModal
          staff={viewStaff}
          onClose={() => setViewStaff(null)}
        />
      )}
    </div>
  );
};

export default ManageStaff;