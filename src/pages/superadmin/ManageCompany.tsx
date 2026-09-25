import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import ViewCompanyModal from "../../components/modal/view/ViewCompanyModal";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import OverviewCards from "../../components/cards/OverviewCards";
import StatusBadge from "../../components/ui/StatusBadge";
import type { CompanyProps, TableColumnProps } from "../../lib/interfaces";
import { useCompanies, useCompanyStats, useDeleteCompany } from "../../hooks/useCompany";
import { getTierConfig } from "../../services/tierService";
import ChangeTierModal from "../../components/modal/tier/ChangeTierModal";
import { FiSearch } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { LuShieldCheck, LuUsersRound, LuBuilding, LuSlidersHorizontal } from "react-icons/lu";

const ManageCompany: React.FC = () => {
     const [searchTerm, setSearchTerm] = useState("");
     const [debouncedSearch, setDebouncedSearch] = useState("");
     const [currentPage, setCurrentPage] = useState(1);
     const [itemsPerPage, setItemsPerPage] = useState(10);

     const [deleteModal, setDeleteModal] = useState(false);
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
     } = useCompanies({
          page: currentPage,
          searchTerm: debouncedSearch,
          per_page: itemsPerPage,
     });

     // Full company stats query for top KPI cards
     const { data: statsData } = useCompanyStats();

     const companies = data?.items ?? [];
     const totalItems = data?.totalItems ?? companies.length;
     const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));

     // Compute metrics dynamically from /company-stats or companies list
     const allCompanies = statsData?.items && statsData.items.length > 0 ? statsData.items : companies;
     const totalCompaniesCount = statsData?.totalCompanies || statsData?.totalItems || totalItems;

     const activeCount = useMemo(() => {
          if (statsData?.activeCompanies !== undefined && statsData.activeCompanies > 0) {
               return statsData.activeCompanies;
          }
          return allCompanies.filter((c) => {
               const s =
                    typeof c.status === "boolean"
                         ? c.status
                              ? "active"
                              : "inactive"
                         : String(c.status || (c.is_active ? "active" : "inactive")).toLowerCase();
               return s === "active" || s === "successful" || s === "verified";
          }).length;
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

     const enterpriseCount = useMemo(() => {
          if (statsData?.enterpriseCompanies !== undefined && statsData.enterpriseCompanies > 0) {
               return statsData.enterpriseCompanies;
          }
          return allCompanies.filter(
               (c) => String(c.tier || "").toLowerCase() === "enterprise"
          ).length;
     }, [allCompanies, statsData?.enterpriseCompanies]);

     // Delete mutation hook
     const deleteCompanyMutation = useDeleteCompany();

     const handleDelete = async () => {
          if (!selectedCompany?.id) return;
          deleteCompanyMutation.mutate(selectedCompany.id, {
               onSuccess: () => {
                    setDeleteModal(false);
                    setSelectedCompany(null);
               },
          });
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
                         <button
                              type="button"
                              onClick={() => setCompanyForTierChange(item)}
                              title="Click to modify tier"
                              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer flex items-center gap-1"
                         >
                              <span>{t.badge} ({t.name})</span>
                              <LuSlidersHorizontal className="text-[10px] opacity-70" />
                         </button>
                    );
               },
          },
          {
               label: "Status",
               key: "status",
               render: (item: CompanyProps) => {
                    const statusStr =
                         typeof item.status === "boolean"
                              ? item.status
                                   ? "Active"
                                   : "Inactive"
                              : item.status || (item.is_active ? "Active" : "Inactive");
                    return <StatusBadge status={statusStr} />;
               },
          },
          {
               label: "Actions",
               key: "actions",
               render: (item: CompanyProps) => (
                    <ActionCell
                         rowId={Number(item.id ?? 0)}
                         canView={true}
                         onView={() => setSelectedCompany(item)}
                         otherActions={[
                              {
                                   name: "Modify Tier",
                                   action: () => setCompanyForTierChange(item),
                              },
                         ]}
                         onDelete={() => {
                              setSelectedCompany(item);
                              setDeleteModal(true);
                         }}
                    />
               ),
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
                         title="Enterprise Tier"
                         value={enterpriseCount}
                    />
                    <OverviewCards
                         icon={LuUsersRound}
                         title="Total Staff Enrolled"
                         value={`${totalStaffCount.toLocaleString()}`}
                    />
               </div>

               {/* Main Companies Table */}
               <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 shadow-sm space-y-4">
                    {/* Search Bar */}
                    <div className="flex items-center gap-3">
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
                    message={`Are you sure you want to delete ${selectedCompany?.name || selectedCompany?.companyName || "this company"}? All associated staff rosters and payment history will be unlinked. This action cannot be undone.`}
                    confirmText="Yes, Delete"
                    isLoading={deleteCompanyMutation.isPending}
                    onCancel={() => {
                         setDeleteModal(false);
                         setSelectedCompany(null);
                    }}
                    onConfirm={handleDelete}
               />

               {/* View Company Details Modal */}
               {selectedCompany && !deleteModal && (
                    <ViewCompanyModal
                         selectedCompany={selectedCompany}
                         onClose={() => setSelectedCompany(null)}
                    />
               )}

               {/* Change Tier Modal */}
               {companyForTierChange && (
                    <ChangeTierModal
                         company={companyForTierChange}
                         onClose={() => setCompanyForTierChange(null)}
                    />
               )}
          </div>
     );
};

export default ManageCompany;