import React, { useState, useMemo } from "react";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import Modal from "../../components/modal/Modal";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionButton from "../../components/ui/ActionButton";
import StatusBadge from "../../components/ui/StatusBadge";
import OverviewCards from "../../components/cards/OverviewCards";
import { toast } from "sonner";
import { formatShortDate } from "../../helpers/formatterUtility";
import type { TableColumnProps, VerificationStatus, CompanyVerificationItem } from "../../lib/interfaces";
import { FiSearch, FiCheckCircle, FiXCircle, FiFileText } from "react-icons/fi";
import {
  LuClock,
  LuShieldAlert,
  LuShieldCheck,
  LuEye,
  LuDownload,
} from "react-icons/lu";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

export type { VerificationStatus, CompanyVerificationItem };

export const SEED_COMPANIES: CompanyVerificationItem[] = [
  {
    id: 1,
    companyName: "Acme Technologies Ltd",
    email: "compliance@acmetech.io",
    phoneNumber: "+234 802 345 6789",
    rcNumber: "RC-1849204",
    tinNumber: "TIN-92847102-0001",
    industry: "Information Technology",
    staffCount: 45,
    tier: "Enterprise",
    status: "Active",
    verificationStatus: "verified",
    submittedAt: "2026-09-10T11:00:00",
    registeredAddress: "Plot 12, Admiralty Way, Lekki Phase 1, Lagos",
    directorName: "Babatunde Adeleke",
    directorPhone: "+234 803 111 2233",
    documents: {
      cacCertificate: "CAC_Certificate_AcmeTech.pdf",
      statusReport: "CAC_StatusReport_Acme.pdf",
      proofOfAddress: "Utility_Bill_Lekki_Office.pdf",
      directorId: "National_ID_Babatunde.pdf",
    },
    verifiedBy: "Support Specialist Agent",
    verifiedAt: "2026-09-11T09:30:00",
  },
  {
    id: 2,
    companyName: "Sunmence Tech Limited",
    email: "support@sunmence.com",
    phoneNumber: "+234 814 990 1234",
    rcNumber: "RC-1920384",
    tinNumber: "TIN-88271039-0001",
    industry: "Software & Cloud Services",
    staffCount: 28,
    tier: "Business",
    status: "Active",
    verificationStatus: "pending_verification",
    submittedAt: "2026-09-24T08:15:00",
    registeredAddress: "45 Allen Avenue, Ikeja, Lagos",
    directorName: "Chinedu Okeke",
    directorPhone: "+234 805 444 5566",
    documents: {
      cacCertificate: "CAC_Cert_Sunmence_2026.pdf",
      statusReport: "CAC_Form1_1_Sunmence.pdf",
      proofOfAddress: "EKEDC_Power_Bill_Allen.pdf",
      directorId: "Intl_Passport_Chinedu.pdf",
    },
  },
  {
    id: 3,
    companyName: "Global Logistics Inc",
    email: "kyc@globallogistics.com",
    phoneNumber: "+234 803 777 8899",
    rcNumber: "RC-1049281",
    tinNumber: "TIN-77192840-0001",
    industry: "Logistics & Freight",
    staffCount: 110,
    tier: "Enterprise",
    status: "Active",
    verificationStatus: "pending_verification",
    submittedAt: "2026-09-23T14:30:00",
    registeredAddress: "Warehouse 4, Apapa Port Complex, Lagos",
    directorName: "Alhaji Musa Danjuma",
    directorPhone: "+234 802 999 0011",
    documents: {
      cacCertificate: "CAC_Global_Logistics_Cert.pdf",
      statusReport: "Status_Report_Global.pdf",
      proofOfAddress: "Tenancy_Agreement_Apapa.pdf",
      directorId: "Drivers_License_Musa.pdf",
    },
  },
  {
    id: 4,
    companyName: "Apex Health Systems",
    email: "admin@apexhealth.ng",
    phoneNumber: "+234 818 222 3344",
    rcNumber: "RC-1592038",
    tinNumber: "TIN-66281930-0001",
    industry: "Healthcare & Diagnostics",
    staffCount: 65,
    tier: "Enterprise",
    status: "Active",
    verificationStatus: "under_review",
    submittedAt: "2026-09-22T10:20:00",
    registeredAddress: "22 Victoria Island Crescent, Lagos",
    directorName: "Dr. Ngozi Eze",
    directorPhone: "+234 806 333 4455",
    documents: {
      cacCertificate: "Apex_CAC_Incorporation.pdf",
      statusReport: "Apex_Status_Report.pdf",
      proofOfAddress: "Water_Bill_VI.pdf",
      directorId: "NIN_Slip_Ngozi.pdf",
    },
  },
  {
    id: 5,
    companyName: "Sterling Retail Hub",
    email: "compliance@sterlinghub.com",
    phoneNumber: "+234 809 111 4455",
    rcNumber: "RC-2049182",
    tinNumber: "TIN-55192847-0001",
    industry: "E-Commerce & Retail",
    staffCount: 18,
    tier: "Starter",
    status: "Active",
    verificationStatus: "action_required",
    submittedAt: "2026-09-21T16:45:00",
    registeredAddress: "14 Broad Street, Marina, Lagos",
    directorName: "Folashade Balogun",
    directorPhone: "+234 807 555 6677",
    documents: {
      cacCertificate: "Sterling_CAC_Doc.pdf",
      statusReport: "Sterling_Form_CAC.pdf",
      proofOfAddress: "Electricity_Bill_Marina.pdf",
      directorId: "Voters_Card_Folashade.pdf",
    },
    rejectionReason: "Proof of business address is older than 3 months. Please upload a recent utility bill or tenancy agreement.",
  },
  {
    id: 6,
    companyName: "Bluecrest Energy Ltd",
    email: "legal@bluecrestenergy.com",
    phoneNumber: "+234 802 888 9900",
    rcNumber: "RC-1192837",
    tinNumber: "TIN-44182930-0001",
    industry: "Energy & Infrastructure",
    staffCount: 82,
    tier: "Enterprise",
    status: "Active",
    verificationStatus: "verified",
    submittedAt: "2026-09-15T09:00:00",
    registeredAddress: "Tower 3, Port Harcourt Oil Hub, Rivers State",
    directorName: "Chief Tonye Briggs",
    directorPhone: "+234 803 888 1234",
    documents: {
      cacCertificate: "Bluecrest_Energy_CAC.pdf",
      statusReport: "Bluecrest_StatusReport.pdf",
      proofOfAddress: "PHED_Utility_Bill.pdf",
      directorId: "Passport_Tonye_Briggs.pdf",
    },
    verifiedBy: "Senior Compliance Officer",
    verifiedAt: "2026-09-15T15:20:00",
  },
];

const CLARIFICATION_REASONS = [
  "Uploaded CAC document is blurry or unreadable",
  "Proof of business address is older than 3 months",
  "Business registration name mismatch with TIN certificate",
  "Director Government ID is expired",
  "Incomplete Form CAC 1.1 / Status report pages",
  "Additional proof of physical office lease required",
  "Other Reason (Specify below)",
];

const SupportManageCompany: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyVerificationItem[]>(SEED_COMPANIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending_verification");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [selectedCompany, setSelectedCompany] = useState<CompanyVerificationItem | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReasonSelect, setRejectionReasonSelect] = useState(CLARIFICATION_REASONS[0]);
  const [customRejectionReason, setCustomRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered List
  const filteredCompanies = useMemo(() => {
    return companies.filter((comp) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        comp.companyName.toLowerCase().includes(term) ||
        comp.email.toLowerCase().includes(term) ||
        comp.rcNumber.toLowerCase().includes(term) ||
        comp.tinNumber.toLowerCase().includes(term) ||
        comp.directorName.toLowerCase().includes(term) ||
        comp.industry.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || comp.verificationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const totalItems = filteredCompanies.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, currentPage, itemsPerPage]);

  // Statistics KPI
  const stats = useMemo(() => {
    const total = companies.length;
    const verified = companies.filter((c) => c.verificationStatus === "verified").length;
    const pending = companies.filter(
      (c) => c.verificationStatus === "pending_verification" || c.verificationStatus === "under_review"
    ).length;
    const actionRequired = companies.filter(
      (c) => c.verificationStatus === "action_required"
    ).length;

    return { total, verified, pending, actionRequired };
  }, [companies]);

  // Handlers
  const handleApproveVerification = async (companyToApprove?: CompanyVerificationItem) => {
    const target = companyToApprove || selectedCompany;
    if (!target) return;

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === target.id
            ? {
                ...c,
                verificationStatus: "verified",
                verifiedBy: "Support Verification Desk",
                verifiedAt: new Date().toISOString(),
                rejectionReason: undefined,
              }
            : c
        )
      );

      toast.success(`${target.companyName} business verification approved successfully!`);
      setApproveModal(false);
      setReviewModal(false);
      setSelectedCompany(null);
    } catch {
      toast.error("Failed to approve business verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOrRequestInfo = async () => {
    if (!selectedCompany) return;

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      const reason =
        rejectionReasonSelect === "Other Reason (Specify below)"
          ? customRejectionReason || "Clarification required on submitted business documents"
          : rejectionReasonSelect;

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id
            ? {
                ...c,
                verificationStatus: "action_required",
                rejectionReason: reason,
              }
            : c
        )
      );

      toast.info(
        `Verification feedback sent to ${selectedCompany.companyName}. Status marked as Action Required.`
      );
      setRejectModal(false);
      setReviewModal(false);
      setSelectedCompany(null);
      setCustomRejectionReason("");
    } catch {
      toast.error("Failed to send verification feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns
  const columns: TableColumnProps<CompanyVerificationItem>[] = [
    {
      label: "Company / Organization",
      render: (item) => (
        <div className="flex items-center gap-2.5 min-w-[190px]">
          <div className="size-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
            {item.companyName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-textBlack text-xs truncate max-w-[160px]">
              {item.companyName}
            </span>
            <span className="text-[11px] text-textBlack/50 lowercase truncate max-w-[160px]">
              {item.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Registration (CAC / TIN)",
      render: (item) => (
        <div className="flex flex-col min-w-[140px]">
          <span className="font-mono font-semibold text-xs text-textBlack tracking-wide">
            {item.rcNumber}
          </span>
          <span className="font-mono text-[10px] text-textBlack/50">{item.tinNumber}</span>
        </div>
      ),
    },
    {
      label: "Industry & Plan",
      render: (item) => (
        <div className="flex flex-col min-w-[130px]">
          <span className="text-xs text-textBlack font-medium">{item.industry}</span>
          <span className="text-[10px] text-primary/80 font-semibold">{item.tier} Tier</span>
        </div>
      ),
    },
    {
      label: "Director / Contact",
      render: (item) => (
        <div className="flex flex-col min-w-[140px]">
          <span className="text-xs text-textBlack font-medium">{item.directorName}</span>
          <span className="text-[10px] text-textBlack/50">{item.phoneNumber}</span>
        </div>
      ),
    },
    {
      label: "Verification Status",
      render: (item) => <StatusBadge status={item.verificationStatus} />,
    },
    {
      label: "Submitted Date",
      render: (item) => (
        <span className="text-xs text-textBlack/50 whitespace-nowrap">
          {formatShortDate(item.submittedAt)}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (item) => {
        const otherActions = [
          {
            name: "Review Documents & KYC",
            icon: <LuEye size={14} className="text-primary" />,
            action: () => {
              setSelectedCompany(item);
              setReviewModal(true);
            },
          },
        ];

        if (item.verificationStatus !== "verified") {
          otherActions.push({
            name: "Approve Verification",
            icon: <FiCheckCircle size={14} className="text-emerald-600" />,
            action: () => {
              setSelectedCompany(item);
              setApproveModal(true);
            },
          });
          otherActions.push({
            name: "Request Clarification",
            icon: <FiXCircle size={14} className="text-rose-600" />,
            action: () => {
              setSelectedCompany(item);
              setRejectModal(true);
            },
          });
        }

        return (
          <ActionCell
            rowId={Number(item.id)}
            canView={true}
            onView={() => {
              setSelectedCompany(item);
              setReviewModal(true);
            }}
            otherActions={otherActions}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textBlack tracking-tight">
            Manage Companies & Business Verification
          </h2>
          <p className="text-sm text-textBlack/50 mt-0.5">
            Review company KYC submissions, verify corporate documents, and manage account approval queues.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          title="Total Companies"
          value={stats.total}
          icon={HiOutlineBuildingOffice2}
        />
        <OverviewCards
          title="Verified Businesses"
          value={stats.verified}
          icon={LuShieldCheck}
        />
        <OverviewCards
          title="Pending Verification"
          value={stats.pending}
          icon={LuClock}
        />
        <OverviewCards
          title="Action Required"
          value={stats.actionRequired}
          icon={LuShieldAlert}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-secondary border border-primary/10 flex flex-col gap-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <FiSearch
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textBlack/50 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search company name, RC number, TIN, director..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-textBlack placeholder:text-textBlack/50"
            />
          </div>

          {/* Quick Tab Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All Companies" },
              { key: "pending_verification", label: "Pending Verification" },
              { key: "verified", label: "Verified" },
              { key: "action_required", label: "Action Required" },
            ].map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white dark:bg-[#1A1921] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Companies Table */}
      <ReusableTable
        columns={columns}
        data={paginatedData}
        isLoading={false}
        error={null}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />

      {/* Modal 1: Comprehensive Document & KYC Review */}
      {reviewModal && selectedCompany && (
        <Modal onClose={() => setReviewModal(false)}>
          <div className="flex flex-col gap-5 p-2">
            {/* Top Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {selectedCompany.companyName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-textBlack">
                    {selectedCompany.companyName}
                  </h3>
                  <p className="text-xs text-textBlack/50">
                    Business Verification Dossier & Registration Review
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={selectedCompany.verificationStatus} />
              </div>
            </div>

            {/* Rejection / Action Required Notice Banner */}
            {selectedCompany.rejectionReason && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start gap-2 text-rose-800 dark:text-rose-300 text-xs">
                <LuShieldAlert size={18} className="shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Current Compliance Notice</p>
                  <p className="mt-0.5 text-rose-700 dark:text-rose-300">
                    {selectedCompany.rejectionReason}
                  </p>
                </div>
              </div>
            )}

            {/* Corporate Profile Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#1A1921] flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Corporate Registration
                </span>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                  <span className="text-textBlack/50">CAC Registration (RC):</span>
                  <span className="font-mono font-semibold text-textBlack">{selectedCompany.rcNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                  <span className="text-textBlack/50">Tax ID Number (TIN):</span>
                  <span className="font-mono font-semibold text-textBlack">{selectedCompany.tinNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                  <span className="text-textBlack/50">Industry & Sector:</span>
                  <span className="text-textBlack font-medium">{selectedCompany.industry}</span>
                </div>
                <div className="flex flex-col py-1">
                  <span className="text-textBlack/50">Registered Physical Address:</span>
                  <span className="text-textBlack font-medium mt-0.5">{selectedCompany.registeredAddress}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#1A1921] flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Authorized Director / Contact
                </span>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                  <span className="text-textBlack/50">Principal Director:</span>
                  <span className="font-semibold text-textBlack">{selectedCompany.directorName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                  <span className="text-textBlack/50">Director Phone:</span>
                  <span className="text-textBlack font-mono">{selectedCompany.directorPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                  <span className="text-textBlack/50">Company Email:</span>
                  <span className="text-textBlack lowercase">{selectedCompany.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-textBlack/50">Staff Payroll Size:</span>
                  <span className="text-textBlack font-medium">{selectedCompany.staffCount} Registered Employees</span>
                </div>
              </div>
            </div>

            {/* Submitted Business Documents */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-textBlack flex items-center gap-1.5">
                <FiFileText size={14} className="text-primary" />
                <span>Submitted KYC & Registration Documents</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    title: "CAC Certificate of Incorporation",
                    file: selectedCompany.documents.cacCertificate,
                    tag: "Primary Registration",
                  },
                  {
                    title: "Form CAC 1.1 / Status Report",
                    file: selectedCompany.documents.statusReport,
                    tag: "Shareholding & Directors",
                  },
                  {
                    title: "Proof of Business Address",
                    file: selectedCompany.documents.proofOfAddress,
                    tag: "Utility / Lease",
                  },
                  {
                    title: "Director Government ID",
                    file: selectedCompany.documents.directorId,
                    tag: "Identity Verification",
                  },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#131217] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <FiFileText size={16} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-semibold text-textBlack truncate">{doc.title}</span>
                        <span className="text-[10px] text-textBlack/50 truncate font-mono">{doc.file}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing ${doc.file}`)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition cursor-pointer shrink-0"
                      title="View document"
                    >
                      <LuDownload size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-white/10">
              <ActionButton
                text="Close"
                onClick={() => setReviewModal(false)}
                overideBg={true}
                buttonStyle="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 text-xs h-9 px-4 rounded-xl"
              />
              {selectedCompany.verificationStatus !== "verified" && (
                <>
                  <ActionButton
                    text="Request Clarification / Reject"
                    icon={<FiXCircle size={14} />}
                    onClick={() => setRejectModal(true)}
                    overideBg={true}
                    buttonStyle="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs h-9 px-3 rounded-xl"
                  />
                  <ActionButton
                    text="Approve Business Verification"
                    icon={<FiCheckCircle size={14} />}
                    onClick={() => handleApproveVerification(selectedCompany)}
                    disabled={isSubmitting}
                    overideBg={true}
                    buttonStyle="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 rounded-xl shadow-xs"
                  />
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Approve Verification Dialog */}
      {approveModal && selectedCompany && (
        <ConfirmDialog
          isOpen={approveModal}
          onCancel={() => setApproveModal(false)}
          onConfirm={() => handleApproveVerification()}
          title="Approve Business Verification"
          message={`Are you sure you want to approve the business registration and KYC documents for ${selectedCompany.companyName} (${selectedCompany.rcNumber})? This will grant the company full verified operating privileges.`}
          confirmText="Confirm & Verify Business"
          isLoading={isSubmitting}
        />
      )}

      {/* Modal 3: Request Clarification / Reject Verification */}
      {rejectModal && selectedCompany && (
        <Modal onClose={() => setRejectModal(false)}>
          <div className="flex flex-col gap-4 p-2">
            <div>
              <h3 className="text-lg font-bold text-textBlack">Request Verification Clarification</h3>
              <p className="text-xs text-textBlack/50">
                Notify {selectedCompany.companyName} of document issues needing attention.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textBlack">
                Reason / Clarification Subject
              </label>
              <select
                value={rejectionReasonSelect}
                onChange={(e) => setRejectionReasonSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-textBlack"
              >
                {CLARIFICATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {rejectionReasonSelect === "Other Reason (Specify below)" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textBlack">
                  Specific Compliance Feedback
                </label>
                <textarea
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  placeholder="Explain exactly what documents need to be re-uploaded..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-white dark:bg-[#1A1921] border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-primary text-textBlack"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
              <ActionButton
                text="Cancel"
                onClick={() => setRejectModal(false)}
                overideBg={true}
                buttonStyle="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 text-xs h-9 px-3 rounded-xl"
              />
              <ActionButton
                text="Send Notice to Company"
                onClick={handleRejectOrRequestInfo}
                disabled={isSubmitting}
                overideBg={true}
                buttonStyle="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-3 rounded-xl"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupportManageCompany;
