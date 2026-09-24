import React, { useState } from 'react'
import type { CompanyProps, TableColumnProps } from '../../../lib/interfaces';
import Modal from '../Modal';
import { IoMdCall } from "react-icons/io";
import { CiMail } from "react-icons/ci";
import { LiaUserTagSolid } from "react-icons/lia";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import ReusableTable from "../../../utility/ReusableTable";


const ViewCompanyModal: React.FC<{
     onClose: () => void;
     selectedCompany: CompanyProps;
}> = ({ onClose, selectedCompany }) => {
     const [currentPage, setCurrentPage] = useState(1);
     const [itemsPerPage, setItemsPerPage] = useState(10);

     const getInitials = (name?: string) => {
          if (!name) return "CO";
          const parts = name.trim().split(/\s+/);
          if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
          return (parts[0][0] + parts[1][0]).toUpperCase();
     };

     const companyStats = [
          {
               label: "Company Name",
               value: selectedCompany?.companyName || "N/A",
          },
          {
               label: "Official Email",
               value: selectedCompany?.email || "N/A",
          },
          {
               label: "Phone Number",
               value: selectedCompany?.phoneNumber || "N/A",
          },
          {
               label: "Staff Count",
               value: `${selectedCompany?.staff ?? 0} Staff`,
          },
          {
               label: "Subscription Tier",
               value: selectedCompany?.tier || "Starter",
          },
          {
               label: "Account Status",
               value: selectedCompany?.status || "Active",
          },
     ];

     const columns: TableColumnProps<CompanyProps>[] = [
          {
               label: "Company Name",
               key: "companyName",
               render: (item: CompanyProps) => (
                    <span className="font-medium text-gray-800">{item?.companyName}</span>
               ),
          },
          {
               label: "Email",
               key: "email",
               render: (item: CompanyProps) => (
                    <span className="text-gray-600">{item?.email}</span>
               ),
          },
          {
               label: "Phone Number",
               key: "phoneNumber",
               render: (item: CompanyProps) => (
                    <span className="text-gray-600">{item?.phoneNumber}</span>
               ),
          },
          {
               label: "Staff Count",
               key: "staff",
               render: (item: CompanyProps) => <span>{item?.staff}</span>,
          },
          {
               label: "Tier",
               key: "tier",
               render: (item: CompanyProps) => (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                         {item?.tier}
                    </span>
               ),
          },
          {
               label: "Status",
               key: "status",
               render: (item: CompanyProps) => (
                    <span
                         className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item?.status?.toLowerCase() === "active"
                                   ? "bg-green-100 text-green-700"
                                   : "bg-gray-100 text-gray-700"
                         }`}
                    >
                         {item?.status}
                    </span>
               ),
          },
     ];

     const tableData: CompanyProps[] = selectedCompany ? [selectedCompany] : [];
     const totalPages = Math.ceil(tableData.length / itemsPerPage) || 1;
     const totalItems = tableData.length;

     return (
          <Modal onClose={onClose}>
               <div>
                    <h1 className="text-xl font-semibold">Company Details</h1>
                    <p className="text-sm text-tableHeading">
                         Company details and overview information
                    </p>
               </div>

               <div className="bg-secondary border border-primary/10 rounded-lg px-4 py-3 flex items-center gap-4 mt-5">
                    <div className="rounded-full bg-primary/10 border border-secondary w-16 h-16 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                         {getInitials(selectedCompany?.companyName)}
                    </div>

                    <div className="w-[calc(100%-(4rem+16px))]">
                         <span className="font-semibold text-lg text-gray-900">
                              {selectedCompany?.companyName}
                         </span>
                         <div className="flex flex-wrap gap-4 items-center mt-2">
                              <span className="flex items-center gap-1.5 text-tableHeading text-xs">
                                   <IoMdCall className="text-sm" /> {selectedCompany?.phoneNumber}
                              </span>
                              <span className="flex items-center gap-1.5 text-tableHeading text-xs">
                                   <CiMail className="text-sm" /> {selectedCompany?.email}
                              </span>
                              <span className="flex items-center gap-1.5 text-tableHeading text-xs">
                                   <LiaUserTagSolid className="text-sm" /> {selectedCompany?.staff} Staff
                              </span>
                              <span className="flex items-center gap-1.5 text-tableHeading text-xs">
                                   <HiOutlineBuildingOffice2 className="text-sm" /> Tier: {selectedCompany?.tier}
                              </span>
                         </div>
                    </div>
               </div>

               <div className="mt-6">
                    <h3 className="text-lg font-semibold">Company Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                         {companyStats.map((info, index) => (
                              <div
                                   key={index}
                                   className="p-3.5 rounded-xl border border-primary/10 bg-secondary"
                              >
                                   <h3 className="text-xs text-tableHeading mb-1 font-medium">
                                        {info.label}
                                   </h3>
                                   <p className="text-sm md:text-base font-semibold text-[#2A2727] truncate">
                                        {info.value}
                                   </p>
                              </div>
                         ))}
                    </div>

                    <div className="mt-8">
                         <h3 className="text-lg font-semibold mb-3">Company Record</h3>
                         <ReusableTable
                              columns={columns}
                              data={tableData}
                              isLoading={false}
                              error={null}
                              currentPage={currentPage}
                              totalPages={totalPages}
                              totalItems={totalItems}
                              itemsPerPage={itemsPerPage}
                              setCurrentPage={setCurrentPage}
                              setItemsPerPage={setItemsPerPage}
                              hasSerialNo={true}
                         />
                    </div>
               </div>
          </Modal>
     );
};

export default ViewCompanyModal;