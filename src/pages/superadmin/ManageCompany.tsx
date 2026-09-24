import React, { useCallback, useEffect, useState } from 'react'
import ReusableTable from '../../utility/ReusableTable'
import ActionCell from '../../components/ui/ActionCell'
import ViewCompanyModal from '../../components/modal/view/ViewCompanyModal'
import ConfirmDialog from '../../components/modal/ConfirmDialog'
import { getErrorMessage } from '../../helpers/api'
import { toast } from "sonner"
import type { CompanyProps } from '../../lib/interfaces'


const ManageCompany: React.FC = () => {

     const [company, setCompany] = useState<CompanyProps[]>([]);
     const [loadingCompany, setLoadingCompany] = useState(false);
     const [searchTerm] = useState("");
     const [currentPage, setCurrentPage] = useState(1);
     const [itemsPerPage, setItemsPerPage] = useState(10);
     const [totalItems, setTotalItems] = useState(1);
     const [totalPages, setTotalPages] = useState(1);

     const [deleteModal, setDeleteModal] = useState(false);
     const [selectedCompany, setSelectedCompany] = useState<CompanyProps | null>(
          null,
     );
     const [loading, setLoading] = useState(false)
     const columns: Array<{
          label: string | React.ReactNode;
          key?: string;
          render: (item: CompanyProps) => React.ReactNode
          className?: string;
          tableHeadingClassName?: string;
     }> = [
               {
                    label: 'Company Name',
                    key: 'companyName',
                    render: (item: CompanyProps) => <div>{item.companyName}</div>
               },
               {
                    label: 'Email',
                    key: 'email',
                    render: (item: CompanyProps) => <div>{item.email}</div>
               },
               {
                    label: 'Phone Number',
                    key: 'phoneNumber',
                    render: (item: CompanyProps) => <div>{item.phoneNumber}</div>
               },
               {
                    label: 'Number of Staffs',
                    key: 'staff',
                    render: (item: CompanyProps) => <div>{item.staff}</div>

               },
               {
                    label: 'Tier',
                    key: 'tier',
                    render: (item: CompanyProps) => <div>{item.tier}</div>

               },
               {
                    label: 'Status',
                    key: 'status',
                    render: (item: CompanyProps) => <div>{item.status}</div>
               },
               {
                    label: 'Actions',
                    key: 'actions',
                    render: (item: CompanyProps) => (
                         <ActionCell
                              rowId={Number(item.id ?? 0)}
                              canView={true}
                              onView={() => setSelectedCompany(item)}
                              onDelete={() => {
                                   setSelectedCompany(item);
                                   setDeleteModal(true);
                              }}
                         />)
               },
          ]

     const data: CompanyProps[] = [
          {
               id: 1,
               companyName: 'Company A',
               email: 'companyA@example.com',
               phoneNumber: '+1234567890',
               staff: 5,
               tier: "Starter",
               status: 'Active',
          },
          {
               id: 2,
               companyName: 'Company B',
               email: 'companyB@example.com',
               phoneNumber: '+1234567890',
               staff: 5,
               tier: "Starter",
               status: 'Active',
          },
          {
               id: 3,
               companyName: 'Company C',
               email: 'companyC@example.com',
               phoneNumber: '+1234567890',
               staff: 5,
               tier: "Starter",
               status: 'Active',
          },
          {
               id: 4,
               companyName: 'Company D',
               email: 'companyD@example.com',
               phoneNumber: '+1234567890',
               staff: 5,
               tier: "Starter",
               status: 'Active',
          },
          {
               id: 5,
               companyName: 'Company E',
               email: 'companyE@example.com',
               phoneNumber: '+1234567890',
               staff: 5,
               tier: "Starter",
               status: 'Active',
          }
     ]

     const pagination = {
          total: 5,
          last_page: 1
     }

     const fetchCompany = useCallback(async () => {
          setLoadingCompany(true);

          try {

               setCompany(data);
               setTotalItems(pagination?.total || 0);
               setTotalPages(pagination?.last_page || 1);
          } catch (error: unknown) {
               console.error("Failed to perform action: ", error);
               toast.error(getErrorMessage(error, "Failed to perform action"));
          } finally {
               setLoadingCompany(false);
          }
     }, [currentPage, itemsPerPage]);

     useEffect(() => {
          queueMicrotask(() => {
               void fetchCompany();
          });
     }, [fetchCompany, searchTerm]);

     const handleDelete = async () => {
          setLoading(true);
          try {
               toast.success("Company deleted successfully");
               setDeleteModal(false);
          } catch (error) {
               toast.error(getErrorMessage(error, "Failed to delete company"));
          } finally {
               setLoading(false);
          }
     };
     return (
          <div className='space-y-6'>
               <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                         <h2 className="text-lg font-semibold">
                              Manage <span className="capitalize">Companies</span>
                         </h2>
                         <p className="text-sm text-gray-500">Here you can manage all the companies in the system</p>
                    </div>
               </div>
               <ReusableTable columns={columns} data={company}
                    isLoading={loadingCompany}
                    error={null}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setCurrentPage}
                    setItemsPerPage={setItemsPerPage}
                    hasSerialNo={true} />



               <ConfirmDialog
                    isOpen={deleteModal && Boolean(selectedCompany)}
                    isLoading={loading}
                    onCancel={() => setDeleteModal(false)}
                    onConfirm={handleDelete}
               />

               {selectedCompany && !deleteModal && (
                    <ViewCompanyModal
                         selectedCompany={selectedCompany}
                         onClose={() => setSelectedCompany(null)}
                    />
               )}
          </div>
     )
}

export default ManageCompany