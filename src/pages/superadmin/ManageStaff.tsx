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
  const [roleFilter, setRoleFilter] = useState<string>("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [createStaff, setCreateStaff] = useState(false);
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
    role: roleFilter || "",
  });

  // Full staff stats query for top KPI cards
  const { data: statsData } = useStaffStats();

  const staffList = data?.items ?? [];
  const totalItems = data?.totalItems ?? staffList.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Dynamic KPI Metrics derived from statsData
  const allStaff = statsData?.items ?? staffList;
  const totalStaffCount = statsData?.totalItems ?? totalItems;

  const financeCount = useMemo(() => {
    return allStaff.filter((s) =>
      String(s.role || "").toLowerCase().includes("finance")
    ).length;
  }, [allStaff]);

  const supportCount = useMemo(() => {
    return allStaff.filter((s) =>
      String(s.role || "").toLowerCase().includes("support")
    ).length;
  }, [allStaff]);

  const activeCount = useMemo(() => {
    return allStaff.filter((s) => {
      const statusStr =
        typeof s.status === "boolean"
          ? s.status
            ? "active"
            : "inactive"
          : String(s.status || (s.is_active ?? s.enabled ? "active" : "inactive")).toLowerCase();
      return statusStr === "active" || statusStr === "successful" || statusStr === "1";
    }).length;
  }, [allStaff]);

  // Mutations
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const deleteMutation = useDeleteUser();

  const handleDelete = async () => {
    if (!selectedStaff?.id) return;
    deleteMutation.mutate(selectedStaff.id, {
      onSuccess: () => {
        setDeleteModal(false);
        setSelectedStaff(null);
      },
    });
  };

  const handleToggleStatus = (staff: StaffProps) => {
    if (!staff.id) return;
    const isCurrentlyActive =
      typeof staff.status === "boolean"
        ? staff.status
        : String(staff.status || (staff.is_active ?? staff.enabled ? "active" : "")).toLowerCase() === "active";

    if (isCurrentlyActive) {
      deactivateMutation.mutate(staff.id);
    } else {
      activateMutation.mutate(staff.id);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-textBlack text-xs">{displayName}</span>
              {item.id && (
                <span className="text-[10px] text-textBlack/50 font-mono">ID: #{item.id}</span>
              )}
            </div>
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
        const isFinance = String(item.role || "").toLowerCase().includes("finance");
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isFinance
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            } capitalize`}
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
        const statusStr =
          typeof item.status === "boolean"
            ? item.status
              ? "Active"
              : "Inactive"
            : item.status !== undefined && item.status !== null
            ? String(item.status)
            : item.is_active ?? item.enabled
            ? "Active"
            : "Inactive";
        return <StatusBadge status={statusStr} />;
      },
    },
    {
      label: "Actions",
      key: "actions",
      render: (item: StaffProps) => {
        const isCurrentlyActive =
          typeof item.status === "boolean"
            ? item.status
            : String(item.status || (item.is_active ?? item.enabled ? "active" : "")).toLowerCase() === "active";

        const otherActions: OtherActionProps[] = [
          {
            name: isCurrentlyActive ? "Deactivate User" : "Activate User",
            icon: isCurrentlyActive ? (
              <FaUserSlash className="text-amber-500" />
            ) : (
              <FaUserCheck className="text-emerald-500" />
            ),
            action: () => handleToggleStatus(item),
          },
        ];

        return (
          <ActionCell
            rowId={Number(item.id ?? 0)}
            canView={true}
            onView={() => setViewStaff(item)}
            onEdit={() => {
              setSelectedStaff(item);
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
            {["", "finance", "support"].map((r) => (
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
                {r === "" ? "All Roles" : `${r} Officers`}
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
        }? This account will lose all system access.`}
        confirmText="Yes, Delete"
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          setDeleteModal(false);
          setSelectedStaff(null);
        }}
        onConfirm={handleDelete}
      />

      {/* Create / Edit Staff Modal */}
      {(Boolean(selectedStaff) || createStaff) && !deleteModal && (
        <EditStaffModal
          selectedStaff={selectedStaff}
          isEdit={Boolean(selectedStaff)}
          onClose={() => {
            setSelectedStaff(null);
            setCreateStaff(false);
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