import React, { useState } from "react";
import type {
  CompanyProps,
  Employee,
  TableColumnProps,
} from "../../../lib/interfaces";
import Modal from "../Modal";
import StatusBadge from "../../ui/StatusBadge";
import { getTierConfig } from "../../../services/tierService";
import { getEmployees } from "../../../services/employeeService";
import { useQuery } from "@tanstack/react-query";
import { formatterUtility } from "../../../helpers/formatterUtility";
import ReusableTable from "../../../utility/ReusableTable";
import {
  LuBuilding2,
  LuPhone,
  LuMail,
  LuUsers,
  LuFileText,
  LuExternalLink,
  LuMapPin,
  LuLayers,
  LuWallet,
  LuInfo,
} from "react-icons/lu";
import { FiSearch } from "react-icons/fi";

interface ViewCompanyModalProps {
  onClose: () => void;
  selectedCompany: CompanyProps;
}

const ViewCompanyModal: React.FC<ViewCompanyModalProps> = ({
  onClose,
  selectedCompany,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "staff" | "documents">("overview");
  const [staffPage, setStaffPage] = useState(1);
  const [staffItemsPerPage, setStaffItemsPerPage] = useState(10);
  const [staffSearch, setStaffSearch] = useState("");

  const compId = selectedCompany?.id;
  const compName = selectedCompany?.name || selectedCompany?.companyName || "Company";
  const compPhone = selectedCompany?.phone || selectedCompany?.phoneNumber || "N/A";
  const compEmail = selectedCompany?.email || "N/A";
  const compAddress = selectedCompany?.address || selectedCompany?.registeredAddress || "N/A";
  const compAbout = selectedCompany?.about || "";
  const compBalance = Number(selectedCompany?.balance) || 0;
  const compRC = selectedCompany?.rcNumber || selectedCompany?.rc_number || "N/A";
  const compTIN = selectedCompany?.tinNumber || selectedCompany?.tin_number || "N/A";
  const compBVN = selectedCompany?.bvn || "N/A";
  const compNIN = selectedCompany?.nin || "N/A";
  const compDirector = selectedCompany?.directorName || "N/A";
  const compDirectorPhone = selectedCompany?.directorPhone || "N/A";
  const compTier = getTierConfig(selectedCompany?.tier);

  const isVerified =
    selectedCompany?.user?.is_verified === 1 ||
    selectedCompany?.is_verified === 1 ||
    selectedCompany?.verificationStatus === "verified" ||
    selectedCompany?.status === "verified";

  const isActive =
    selectedCompany?.user?.is_active === 1 ||
    selectedCompany?.is_active === 1 ||
    selectedCompany?.status === "active" ||
    selectedCompany?.status === true;

  const compStatus = isActive ? "Active" : "Inactive";
  const verificationStatus = isVerified ? "Verified" : "Pending Verification";

  // Check if employees are already embedded in the company object
  const embeddedEmployees = Array.isArray(selectedCompany?.employees)
    ? selectedCompany.employees
    : [];

  // Fetch real enrolled staff for this company if not embedded
  const {
    data: employeesData,
    isLoading: loadingEmployees,
  } = useQuery({
    queryKey: ["employees", "company_roster", compId, staffPage, staffItemsPerPage, staffSearch],
    queryFn: () =>
      getEmployees({
        company_id: compId,
        page: staffPage,
        per_page: staffItemsPerPage,
        search: staffSearch || undefined,
      }),
    enabled: Boolean(compId && embeddedEmployees.length === 0),
  });

  const staffList = embeddedEmployees.length > 0 ? embeddedEmployees : (employeesData?.items ?? []);
  const totalStaff = selectedCompany?.no_of_employee ?? (embeddedEmployees.length > 0 ? embeddedEmployees.length : (employeesData?.totalItems ?? staffList.length));
  const totalStaffPages = embeddedEmployees.length > 0 ? 1 : (employeesData?.totalPages ?? Math.max(1, Math.ceil(totalStaff / staffItemsPerPage)));

  const getInitials = (name?: string) => {
    if (!name) return "CO";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Uploaded documents checklist
  const documentsList = [
    {
      title: "CAC Certificate of Incorporation",
      type: "Certificate",
      url: selectedCompany?.cac || selectedCompany?.documents?.cacCertificate,
      filename: selectedCompany?.cac || selectedCompany?.documents?.cacCertificate || `CAC_Certificate_${compName.replace(/\s+/g, "_")}.pdf`,
    },
    {
      title: "MERMAT / Memorandum of Association",
      type: "Corporate Articles",
      url: selectedCompany?.mermat,
      filename: selectedCompany?.mermat || `MERMAT_${compName.replace(/\s+/g, "_")}.pdf`,
    },
    {
      title: "Form CAC 1.1 / Status Report",
      type: "Corporate Status",
      url: selectedCompany?.status_report || selectedCompany?.documents?.statusReport,
      filename: selectedCompany?.status_report || selectedCompany?.documents?.statusReport || `Status_Report_${compName.replace(/\s+/g, "_")}.pdf`,
    },
    {
      title: "Proof of Business Address",
      type: "Utility / Lease",
      url: selectedCompany?.documents?.proofOfAddress,
      filename: selectedCompany?.documents?.proofOfAddress || `Utility_Bill_${compName.replace(/\s+/g, "_")}.pdf`,
    },
    {
      title: "Director Government Identification",
      type: "National ID / Passport",
      url: selectedCompany?.documents?.directorId,
      filename: selectedCompany?.documents?.directorId || `Director_ID_${compName.replace(/\s+/g, "_")}.pdf`,
    },
  ];

  // Employee Table Columns
  const staffColumns: TableColumnProps<Employee>[] = [
    {
      label: "Employee Name",
      key: "name",
      render: (item: Employee) => (
        <div className="flex flex-col">
          <span className="font-semibold text-textBlack text-xs">
            {item.first_name} {item.last_name}
          </span>
          <span className="text-[10px] text-textBlack/50 font-mono lowercase">
            {item.email}
          </span>
        </div>
      ),
    },
    {
      label: "Phone",
      key: "phone",
      render: (item: Employee) => (
        <span className="text-xs text-textBlack/70">{item.phone || "N/A"}</span>
      ),
    },
    {
      label: "Job Title / Role",
      key: "job_title",
      render: (item: Employee) => (
        <span className="text-xs text-textBlack font-medium">{item.job_title}</span>
      ),
    },
    {
      label: "Type",
      key: "employment_type",
      render: (item: Employee) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary capitalize">
          {item.employment_type || "Full-time"}
        </span>
      ),
    },
    {
      label: "Estimated Pay",
      key: "estimate_pay",
      render: (item: Employee) => (
        <span className="text-xs text-textBlack font-semibold">
          {formatterUtility(Number(item.estimate_pay) || 0)}
        </span>
      ),
    },
    {
      label: "Settlement Account",
      key: "bank",
      render: (item: Employee) => (
        <div className="flex flex-col text-xs">
          <span className="text-textBlack font-medium">{item.bank_name || "Bank"}</span>
          <span className="text-[10px] text-textBlack/50 font-mono">
            {item.account_number} ({item.account_name || "Account"})
          </span>
        </div>
      ),
    },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="space-y-5 max-h-[85vh] overflow-y-auto pr-1">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-primary/10">
          <div>
            <div className="flex items-center gap-2 text-primary font-medium text-xs">
              <LuBuilding2 className="text-base" />
              <span>Corporate Client Profile</span>
            </div>
            <h2 className="text-xl font-bold text-textBlack mt-0.5">{compName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {compTier.name} ({compTier.badge})
            </span>
            <StatusBadge status={verificationStatus} />
            <StatusBadge status={compStatus} />
          </div>
        </div>

        {/* Company Header Card */}
        <div className="bg-secondary border border-primary/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          {selectedCompany?.logo ? (
            <img
              src={selectedCompany.logo}
              alt={compName}
              className="rounded-2xl w-14 h-14 object-cover border border-primary/10 bg-white"
            />
          ) : (
            <div className="rounded-2xl bg-primary text-white w-14 h-14 flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
              {getInitials(compName)}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-between flex-wrap gap-2">
              <h3 className="font-bold text-base text-textBlack">{compName}</h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                <LuWallet size={14} /> Balance: {formatterUtility(compBalance)}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-textBlack/70">
              <span className="flex items-center gap-1">
                <LuMail className="text-primary text-xs" /> {compEmail}
              </span>
              <span className="flex items-center gap-1">
                <LuPhone className="text-primary text-xs" /> {compPhone}
              </span>
              <span className="flex items-center gap-1">
                <LuUsers className="text-primary text-xs" /> {totalStaff} Staff Enrolled
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-primary text-white shadow-xs"
                : "text-textBlack/70 hover:text-textBlack hover:bg-secondary"
            }`}
          >
            Company Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "staff"
                ? "bg-primary text-white shadow-xs"
                : "text-textBlack/70 hover:text-textBlack hover:bg-secondary"
            }`}
          >
            <LuUsers size={13} />
            <span>Enrolled Staff ({totalStaff})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "documents"
                ? "bg-primary text-white shadow-xs"
                : "text-textBlack/70 hover:text-textBlack hover:bg-secondary"
            }`}
          >
            <LuFileText size={13} />
            <span>Uploaded CAC & Documents</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  Wallet Liquidity
                </span>
                <p className="text-xs font-mono font-bold text-primary">
                  {formatterUtility(compBalance)}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  CAC Registration (RC)
                </span>
                <p className="text-xs font-mono font-bold text-textBlack">{compRC}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  Tax Identification (TIN)
                </span>
                <p className="text-xs font-mono font-bold text-textBlack">{compTIN}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  Bank Verification (BVN)
                </span>
                <p className="text-xs font-mono font-bold text-textBlack">{compBVN}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  National ID (NIN)
                </span>
                <p className="text-xs font-mono font-bold text-textBlack">{compNIN}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  Active Subscription Tier
                </span>
                <p className="text-xs font-bold text-primary">
                  {compTier.name} ({compTier.badge})
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  Total Staff Capacity
                </span>
                <p className="text-xs font-semibold text-textBlack">
                  {String(compTier.no_of_staff).toLowerCase() === "unlimited"
                    ? "Unlimited Staff"
                    : `${compTier.no_of_staff} Staff Limit`}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  Authorized Director
                </span>
                <p className="text-xs font-semibold text-textBlack">{compDirector}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary border border-primary/10 space-y-1">
                <span className="text-[10px] text-textBlack/50 uppercase font-semibold">
                  Director Phone
                </span>
                <p className="text-xs font-semibold text-textBlack">{compDirectorPhone}</p>
              </div>
            </div>

            {/* About Company */}
            {compAbout && (
              <div className="p-4 rounded-xl bg-secondary border border-primary/10 space-y-1.5">
                <span className="text-[11px] font-semibold text-textBlack/70 flex items-center gap-1.5 uppercase tracking-wider">
                  <LuInfo className="text-primary text-xs" /> About Business
                </span>
                <p className="text-xs text-textBlack leading-relaxed whitespace-pre-line">
                  {compAbout}
                </p>
              </div>
            )}

            {/* Address */}
            <div className="p-4 rounded-xl bg-secondary border border-primary/10 space-y-2">
              <span className="text-[11px] font-semibold text-textBlack/70 flex items-center gap-1.5 uppercase tracking-wider">
                <LuMapPin className="text-primary text-xs" /> Physical Registered Address
              </span>
              <p className="text-xs text-textBlack font-medium">{compAddress}</p>
            </div>

            {/* Compliance Requirements */}
            {compTier.requirements && (
              <div className="p-4 rounded-xl bg-secondary border border-primary/10 space-y-1.5">
                <span className="text-[11px] font-semibold text-textBlack/70 flex items-center gap-1.5 uppercase tracking-wider">
                  <LuLayers className="text-primary text-xs" /> Tier Compliance Requirements
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {compTier.requirements.split(",").map((req, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded bg-tertiary border border-primary/10 text-xs font-medium text-textBlack"
                    >
                      {req.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ENROLLED STAFF */}
        {activeTab === "staff" && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-textBlack">
                  Staff Enrolled Under {compName}
                </h3>
                <p className="text-xs text-textBlack/60">
                  Total of {totalStaff} employee records currently active
                </p>
              </div>

              {/* Staff search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textBlack/40 text-xs" />
                <input
                  type="text"
                  value={staffSearch}
                  onChange={(e) => {
                    setStaffSearch(e.target.value);
                    setStaffPage(1);
                  }}
                  placeholder="Search staff by name/email..."
                  className="h-9 pl-8 pr-3 rounded-lg border border-primary/10 bg-secondary text-xs text-textBlack outline-none w-48 md:w-60 focus:border-primary/30"
                />
              </div>
            </div>

            <ReusableTable
              columns={staffColumns}
              data={staffList}
              isLoading={loadingEmployees}
              error={null}
              currentPage={staffPage}
              totalPages={totalStaffPages}
              totalItems={totalStaff}
              itemsPerPage={staffItemsPerPage}
              setCurrentPage={setStaffPage}
              setItemsPerPage={setStaffItemsPerPage}
              hasSerialNo={true}
            />
          </div>
        )}

        {/* TAB 3: UPLOADED CAC & DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-textBlack">
                Uploaded Verification & CAC Documents
              </h3>
              <p className="text-xs text-textBlack/60">
                Official registration documents uploaded by {compName}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {documentsList.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-secondary border border-primary/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <LuFileText size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-textBlack">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-textBlack/50">{doc.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-primary text-white text-xs hover:bg-primary/90 transition shadow-xs"
                        title="View Document"
                      >
                        <LuExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 rounded text-[10px] font-medium bg-primary/10 text-primary font-mono">
                        {doc.filename}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium rounded-lg border border-primary/10 bg-secondary hover:bg-primary/10 text-textBlack transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewCompanyModal;