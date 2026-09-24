import React, { useMemo, useState } from 'react'
import ReusableTable from '../../utility/ReusableTable'
import ActionCell from '../../components/ui/ActionCell'
import EditStaffModal from '../../components/modal/view/EditStaffModal'
import ConfirmDialog from '../../components/modal/ConfirmDialog'
import { getErrorMessage } from '../../helpers/api'
import { toast } from "sonner"
import type { StaffProps, TableColumnProps } from '../../lib/interfaces'
import ActionButton from '../../components/ui/ActionButton'
import StatusBadge from '../../components/ui/StatusBadge'
import { FaPlus } from 'react-icons/fa6'
import { FiSearch } from 'react-icons/fi'

const INITIAL_STAFF_DATA: StaffProps[] = [
     {
          id: 1,
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@payfleet.io',
          phoneNumber: '+2348012345678',
          role: "support",
          status: 'Active',
     },
     {
          id: 2,
          name: 'Michael Adebayo',
          email: 'michael.adebayo@payfleet.io',
          phoneNumber: '+2348023456789',
          role: "Finance",
          status: 'Active',
     },
     {
          id: 3,
          name: 'Chiamaka Eze',
          email: 'chiamaka.eze@payfleet.io',
          phoneNumber: '+2348034567890',
          role: "Support",
          status: 'Active',
     },
     {
          id: 4,
          name: 'David Johnson',
          email: 'david.johnson@payfleet.io',
          phoneNumber: '+2348045678901',
          role: "finance",
          status: 'Active',
     },
     {
          id: 5,
          name: 'Fatima Aliyu',
          email: 'fatima.aliyu@payfleet.io',
          phoneNumber: '+2348056789012',
          role: "finance",
          status: 'Active',
     }
];

const ManageStaff: React.FC = () => {
     const [staffList, setStaffList] = useState<StaffProps[]>(INITIAL_STAFF_DATA);
     const [searchTerm, setSearchTerm] = useState("");
     const [loadingStaff] = useState(false);
     const [currentPage, setCurrentPage] = useState(1);
     const [itemsPerPage, setItemsPerPage] = useState(10);

     const [deleteModal, setDeleteModal] = useState(false);
     const [createStaff, setCreateStaff] = useState(false);
     const [selectedStaff, setSelectedStaff] = useState<StaffProps | null>(null);
     const [loading, setLoading] = useState(false);

     const filteredStaff = useMemo(() => {
          if (!searchTerm.trim()) return staffList;
          const term = searchTerm.toLowerCase();
          return staffList.filter(
               (item) =>
                    item.name.toLowerCase().includes(term) ||
                    item.email.toLowerCase().includes(term) ||
                    item.role.toLowerCase().includes(term) ||
                    item.phoneNumber.includes(term)
          );
     }, [staffList, searchTerm]);

     const totalItems = filteredStaff.length;
     const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

     const paginatedData = useMemo(() => {
          const startIndex = (currentPage - 1) * itemsPerPage;
          return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
     }, [filteredStaff, currentPage, itemsPerPage]);

     const handleSaveStaff = (savedStaff: Partial<StaffProps>) => {
          if (selectedStaff) {
               // Update existing staff member
               setStaffList((prev) =>
                    prev.map((item) =>
                         item.id === selectedStaff.id
                              ? { ...item, ...savedStaff }
                              : item
                    )
               );
          } else {
               // Add new staff member
               const newStaff: StaffProps = {
                    id: Date.now(),
                    name: savedStaff.name || "",
                    email: savedStaff.email || "",
                    phoneNumber: savedStaff.phoneNumber || "",
                    role: savedStaff.role || "Starter",
                    status: "Active",
               };
               setStaffList((prev) => [newStaff, ...prev]);
          }
          setSelectedStaff(null);
          setCreateStaff(false);
     };

     const handleDelete = async () => {
          if (!selectedStaff) return;
          setLoading(true);
          try {
               setStaffList((prev) => prev.filter((item) => item.id !== selectedStaff.id));
               toast.success(`${selectedStaff.name} removed successfully`);
               setDeleteModal(false);
               setSelectedStaff(null);
          } catch (error) {
               toast.error(getErrorMessage(error, "Failed to delete staff"));
          } finally {
               setLoading(false);
          }
     };

     const columns: TableColumnProps<StaffProps>[] = [
          {
               label: 'Staff Name',
               key: 'name',
               render: (item: StaffProps) => <div className="font-medium text-gray-800">{item.name}</div>
          },
          {
               label: 'Email',
               key: 'email',
               render: (item: StaffProps) => <div className="text-gray-600 lowercase">{item.email}</div>
          },
          {
               label: 'Phone Number',
               key: 'phoneNumber',
               render: (item: StaffProps) => <div className="text-gray-600">{item.phoneNumber}</div>
          },
          {
               label: 'Role',
               key: 'role',
               render: (item: StaffProps) => (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                         {item.role}
                    </span>
               )
          },
          {
               label: 'Status',
               key: 'status',
               render: (item: StaffProps) => <StatusBadge status={item.status} />,
          },
          {
               label: 'Actions',
               key: 'actions',
               render: (item: StaffProps) => (
                    <ActionCell
                         rowId={Number(item.id ?? 0)}
                         canView={false}
                         onEdit={() => {
                              setSelectedStaff(item);
                              setCreateStaff(false);
                         }}
                         onDelete={() => {
                              setSelectedStaff(item);
                              setDeleteModal(true);
                         }}
                    />
               )
          },
     ];

     return (
          <div className='space-y-6'>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                         <h2 className="text-lg font-semibold">
                              Manage Staff
                         </h2>
                         <p className="text-sm text-gray-500">Here you can manage staff access on the system</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input
                                   type="text"
                                   value={searchTerm}
                                   onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                   }}
                                   placeholder="Search staff..."
                                   className="h-10 pl-9 pr-3 rounded-lg border border-primary/10 bg-secondary text-sm outline-none w-48 md:w-64"
                              />
                         </div>
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

               <ReusableTable
                    columns={columns}
                    data={paginatedData}
                    isLoading={loadingStaff}
                    error={null}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setCurrentPage}
                    setItemsPerPage={setItemsPerPage}
                    hasSerialNo={true}
               />

               <ConfirmDialog
                    isOpen={deleteModal && Boolean(selectedStaff)}
                    title="Remove Staff Member"
                    message={`Are you sure you want to remove ${selectedStaff?.name || "this staff member"}? This action cannot be undone.`}
                    confirmText="Yes, Delete"
                    isLoading={loading}
                    onCancel={() => {
                         setDeleteModal(false);
                         setSelectedStaff(null);
                    }}
                    onConfirm={handleDelete}
               />

               {(Boolean(selectedStaff) || createStaff) && !deleteModal && (
                    <EditStaffModal
                         selectedStaff={selectedStaff}
                         isEdit={Boolean(selectedStaff)}
                         onClose={() => {
                              setSelectedStaff(null);
                              setCreateStaff(false);
                         }}
                         onSuccess={handleSaveStaff}
                    />
               )}
          </div>
     );
};

export default ManageStaff;