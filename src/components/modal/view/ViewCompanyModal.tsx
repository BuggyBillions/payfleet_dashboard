import React, { useState } from 'react';
import type { CompanyProps, TableColumnProps } from '../../../lib/interfaces';
import Modal from '../Modal';
import StatusBadge from '../../ui/StatusBadge';
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

     const compName = selectedCompany?.name || selectedCompany?.companyName || "Company";
     const compPhone = selectedCompany?.phone || selectedCompany?.phoneNumber || "N/A";
     const compEmail = selectedCompany?.email || "N/A";
     const compStaff = selectedCompany?.no_of_employee ?? selectedCompany?.staff ?? 0;
     const compTier = selectedCompany?.tier || "Starter";
     const compStatus = typeof selectedCompany?.status === "boolean"
          ? (selectedCompany.status ? "Active" : "Inactive")
          : (selectedCompany?.status || (selectedCompany?.is_active ? "Active" : "Inactive"));

     const getInitials = (name?: string) => {
          if (!name) return "CO";
          const parts = name.trim().split(/\s+/);
          if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
          return (parts[0][0] + parts[1][0]).toUpperCase();
     };

     const companyStats = [
          {
               label: "Company Name",
               value: compName,
          },
          {
               label: "Official Email",
               value: compEmail,
          },
          {
               label: "Phone Number",
               value: compPhone,
          },
          {
               label: "Staff Count",
               value: `${compStaff} Staff`,
          },
          {
               label: "Subscription Tier",
               value: compTier,
          },
          {
               label: "Account Status",
               value: compStatus,
          },
     ];

     const columns: TableColumnProps<CompanyProps>[] = [
          {
               label: "Company Name",
               key: "name",
               render: (item: CompanyProps) => (
                    <span className="font-semibold text-textBlack">
                         {item?.name || item?.companyName}
                    </span>
               ),
          },
          {
               label: "Email",
               key: "email",
               render: (item: CompanyProps) => (
                    <span className="text-textBlack/70 text-xs">{item?.email}</span>
               ),
          },
          {
               label: "Phone Number",
               key: "phone",
               render: (item: CompanyProps) => (
                    <span className="text-textBlack/70 text-xs">{item?.phone || item?.phoneNumber}</span>
               ),
          },
          {
               label: "Staff Count",
               key: "staff",
               render: (item: CompanyProps) => (
                    <span className="text-textBlack/80 text-xs font-medium">
                         {item?.no_of_employee ?? item?.staff ?? 0}
                    </span>
               ),
          },
          {
               label: "Tier",
               key: "tier",
               render: (item: CompanyProps) => (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                         {item?.tier || "Standard"}
                    </span>
               ),
          },
          {
               label: "Status",
               key: "status",
               render: (item: CompanyProps) => {
                    const st = typeof item?.status === "boolean"
                         ? (item.status ? "Active" : "Inactive")
                         : (item?.status || (item?.is_active ? "Active" : "Inactive"));
                    return <StatusBadge status={st} />;
               },
          },
     ];

     const tableData: CompanyProps[] = selectedCompany ? [selectedCompany] : [];
     const totalPages = Math.ceil(tableData.length / itemsPerPage) || 1;
     const totalItems = tableData.length;

     return (
          <Modal onClose={onClose}>
               <div>
                    <h1 className="text-xl font-semibold text-textBlack">Company Details</h1>
                    <p className="text-sm text-textBlack/60">
                         Company profile and subscription breakdown
                    </p>
               </div>

               <div className="bg-secondary border border-primary/10 rounded-xl px-4 py-3 flex items-center gap-4 mt-5">
                    <div className="rounded-full bg-primary/10 border border-primary/20 w-16 h-16 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                         {getInitials(compName)}
                    </div>

                    <div className="w-[calc(100%-(4rem+16px))]">
                         <span className="font-semibold text-lg text-textBlack">
                              {compName}
                         </span>
                         <div className="flex flex-wrap gap-4 items-center mt-2">
                              <span className="flex items-center gap-1.5 text-textBlack/60 text-xs">
                                   <IoMdCall className="text-sm text-primary" /> {compPhone}
                              </span>
                              <span className="flex items-center gap-1.5 text-textBlack/60 text-xs">
                                   <CiMail className="text-sm text-primary" /> {compEmail}
                              </span>
                              <span className="flex items-center gap-1.5 text-textBlack/60 text-xs">
                                   <LiaUserTagSolid className="text-sm text-primary" /> {compStaff} Staff
                              </span>
                              <span className="flex items-center gap-1.5 text-textBlack/60 text-xs">
                                   <HiOutlineBuildingOffice2 className="text-sm text-primary" /> Tier: {compTier}
                              </span>
                         </div>
                    </div>
               </div>

               <div className="mt-6">
                    <h3 className="text-base font-semibold text-textBlack">Company Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                         {companyStats.map((info, index) => (
                              <div
                                   key={index}
                                   className="p-3.5 rounded-xl border border-primary/10 bg-secondary"
                              >
                                   <h3 className="text-xs text-textBlack/60 mb-1 font-medium">
                                        {info.label}
                                   </h3>
                                   <p className="text-sm md:text-base font-semibold text-textBlack truncate">
                                        {info.value}
                                   </p>
                              </div>
                         ))}
                    </div>

                    <div className="mt-8">
                         <h3 className="text-base font-semibold text-textBlack mb-3">Company Record</h3>
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