import React, { useState, useEffect, useRef, useMemo } from "react";
import Modal from "./Modal";
import {
  LuUser,
  LuFileText,
  LuUpload,
  LuX,
  LuCheck,
  LuLoader,
} from "react-icons/lu";
import {
  DOCUMENT_FIELDS,
  type DocumentFiles,
  type DocumentKey,
} from "../../lib/companyDocuments";
import { useResolveCompanyRegNo } from "../../hooks/useCompany";
import { toast } from "sonner";
import { getErrorMessage } from "../../helpers/api";
import { IoAlertCircleOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

export interface ProfileFormValues {
  name: string;
  company_name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  address: string;
  about: string;
  bvn: string;
  nin: string;
  bn_number: string;
}

interface EditProfileModalProps {
  values: ProfileFormValues;
  onChange: (key: keyof ProfileFormValues, value: string) => void;
  onSubmit: (files: DocumentFiles, extra?: { company_name?: string }) => void;
  onClose: () => void;
  saving: boolean;
  isDirty: boolean;
  existingDocuments: Record<DocumentKey, string | null>;
}

const inputClass =
  "w-full text-textBlack border border-primary/10 bg-secondary rounded-lg px-4 h-11 text-xs outline-0 placeholder:text-textBlack/40 focus:border-primary/40 transition";

const DocumentInput: React.FC<{
  label: string;
  file?: File;
  existing: string | null;
  disabled: boolean;
  onSelect: (file: File | null) => void;
}> = ({ label, file, existing, disabled, onSelect }) => (
  <div className="flex flex-col gap-1.5">
    <span className="font-medium text-xs text-textBlack">{label}</span>
    <label
      className={`flex items-center gap-2 px-3 h-11 rounded-lg border border-dashed border-primary/20 bg-secondary text-xs transition ${
        disabled
          ? "opacity-60"
          : "hover:border-primary/40 cursor-pointer"
      }`}
    >
      <LuUpload size={13} className="text-primary shrink-0" />
      <span className="truncate">
        {file ? (
          <span className="font-semibold text-primary">{file.name}</span>
        ) : existing ? (
          <span className="text-textBlack/60 truncate">Uploaded</span>
        ) : (
          <span className="text-textBlack/40">Choose file (PDF, PNG, JPG)</span>
        )}
      </span>
      {file && !disabled && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.preventDefault();
            onSelect(null);
          }}
          className="ml-auto text-textBlack/50 hover:text-red-500 transition cursor-pointer shrink-0"
        >
          <LuX size={12} />
        </button>
      )}
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        disabled={disabled}
        className="hidden"
        onChange={(e) => onSelect(e.currentTarget.files?.[0] ?? null)}
      />
    </label>
  </div>
);

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  values,
  onChange,
  onSubmit,
  onClose,
  saving,
  isDirty,
  existingDocuments,
}) => {
  const [files, setFiles] = useState<DocumentFiles>({});
  const [regNoToVerify, setRegNoToVerify] = useState<string>("");
  const [initialRegNo] = useState<string>(() => (values.bn_number || "").trim());
  const lastToastedRef = useRef<string>("");

  const {
    data: resolvedData,
    isLoading: isQueryLoading,
    isFetching,
    isError: isRegNoError,
    error: regNoError,
    isSuccess: isRegNoSuccess,
    refetch: refetchRegNo,
  } = useResolveCompanyRegNo(regNoToVerify);

  const isChecking = isQueryLoading || isFetching;

  const resolvedCompanyName = useMemo(() => {
    if (!resolvedData) return "";
    if (typeof resolvedData === "string") return resolvedData;
    if (typeof resolvedData === "object") {
      const obj = resolvedData as Record<string, unknown>;
      return (
        (typeof obj.company_name === "string" && obj.company_name) ||
        (typeof obj.name === "string" && obj.name) ||
        (typeof obj.data === "string" && obj.data) ||
        (typeof obj.message === "string" && obj.message) ||
        String(resolvedData)
      );
    }
    return String(resolvedData);
  }, [resolvedData]);

  const currentRegNo = (values.bn_number || "").trim();
  const isRegNoEligible = currentRegNo.length >= 6 && currentRegNo.length <= 8;
  const isUnchangedExisting = Boolean(
    initialRegNo && currentRegNo === initialRegNo
  );

  const isVerified = Boolean(
    isRegNoSuccess &&
      resolvedCompanyName &&
      regNoToVerify === currentRegNo &&
      !isRegNoError
  );

  // If bn_number is inputted/edited, verification with CAC is required before submission
  const isRegNoValid = !currentRegNo || isUnchangedExisting || isVerified;

  useEffect(() => {
    if (
      isRegNoSuccess &&
      resolvedCompanyName &&
      regNoToVerify === currentRegNo &&
      lastToastedRef.current !== `success-${currentRegNo}`
    ) {
      lastToastedRef.current = `success-${currentRegNo}`;
      toast.success(`Registration verified: ${resolvedCompanyName}`);
      onChange("company_name", resolvedCompanyName);
    }
  }, [isRegNoSuccess, resolvedCompanyName, regNoToVerify, currentRegNo, onChange]);

  useEffect(() => {
    if (
      isRegNoError &&
      regNoError &&
      regNoToVerify === currentRegNo &&
      lastToastedRef.current !== `error-${currentRegNo}`
    ) {
      lastToastedRef.current = `error-${currentRegNo}`;
      toast.error(
        getErrorMessage(
          regNoError,
          "Failed to verify company registration number with CAC"
        )
      );
    }
  }, [isRegNoError, regNoError, regNoToVerify, currentRegNo]);

  const handleCheckRegNo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRegNoEligible || isChecking) return;
    if (regNoToVerify === currentRegNo) {
      refetchRegNo();
    } else {
      setRegNoToVerify(currentRegNo);
    }
  };

  const hasFiles = Object.values(files).some(Boolean);
  const canSave =
    (isDirty || hasFiles) && !saving && isRegNoValid && !isChecking;

  return (
    <Modal onClose={saving ? () => undefined : onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSave) {
            if (currentRegNo && !isRegNoValid) {
              toast.error(
                "Please verify your company registration number with the Check button before saving."
              );
            }
            return;
          }
          const verifiedName =
            (isVerified && resolvedCompanyName) ||
            values.company_name ||
            undefined;
          onSubmit(files, verifiedName ? { company_name: verifiedName } : undefined);
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center gap-2 text-primary">
          <LuUser size={16} />
          <h2 className="text-lg font-bold text-textBlack">Edit Company Profile</h2>
        </div>
        <p className="-mt-3 text-xs text-textBlack/60">
          Update your company information and verification documents.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col space-y-1.5">
            <span className="font-medium text-xs text-textBlack">Company Name</span>
            <input
              type="text"
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col space-y-1.5">
            <span className="font-medium text-xs text-textBlack">Company Email</span>
            <input
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col space-y-1.5">
            <span className="font-medium text-xs text-textBlack">Phone Number</span>
            <input
              type="text"
              value={values.phoneNumber}
              onChange={(e) => onChange("phoneNumber", e.target.value)}
              className={inputClass}
            />
          </label>

          {/* Registration Number with Check button */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs text-textBlack">
                Company Reg No. (RC / BN Number)
              </span>
              <span className="text-[10px] text-textBlack/50">6-8 digits</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={values.bn_number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  onChange("bn_number", val);
                }}
                placeholder="e.g. 1234567"
                className={`${inputClass} pr-24`}
              />
              <button
                type="button"
                onClick={handleCheckRegNo}
                disabled={!isRegNoEligible || isChecking || isVerified}
                className={`absolute right-1 px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                  isVerified
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default"
                    : isRegNoEligible && !isChecking
                    ? "bg-primary text-textBlack hover:bg-primary/90 cursor-pointer shadow-xs"
                    : "bg-gray-100 dark:bg-neutral-800 text-textBlack/40 border border-primary/10 cursor-not-allowed opacity-60"
                }`}
                title={
                  !isRegNoEligible
                    ? "Enter 6 to 8 digits to verify"
                    : isVerified
                    ? "Registration number verified"
                    : "Click to check registration number"
                }
              >
                {isChecking ? (
                  <>
                    <LuLoader size={13} className="animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : isVerified ? (
                  <>
                    <LuCheck size={13} />
                    <span>Verified</span>
                  </>
                ) : (
                  <span>Check</span>
                )}
              </button>
            </div>
            {isVerified && resolvedCompanyName && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <IoCheckmarkCircleOutline size={12} className="shrink-0" />
                <span className="truncate">CAC Verified: {resolvedCompanyName}</span>
              </div>
            )}
            {isRegNoError && regNoToVerify === currentRegNo && (
              <div className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
                <IoAlertCircleOutline size={12} className="shrink-0" />
                <span>Verification failed. Please ensure the RC number is valid.</span>
              </div>
            )}
            {!isVerified && !isChecking && !isRegNoError && currentRegNo && !isRegNoEligible && (
              <span className="text-[11px] text-textBlack/40">
                Registration number must be between 6 and 8 digits to check.
              </span>
            )}
            {!isVerified && isRegNoEligible && regNoToVerify !== currentRegNo && (
              <span className="text-[11px] text-amber-600">
                Click "Check" to verify your registration number before saving.
              </span>
            )}
          </div>

          <label className="flex flex-col space-y-1.5">
            <span className="font-medium text-xs text-textBlack">BVN</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={values.bvn}
              onChange={(e) => onChange("bvn", e.target.value.replace(/\D/g, ""))}
              placeholder="Enter your 11-digit BVN"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col space-y-1.5">
            <span className="font-medium text-xs text-textBlack">NIN</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={values.nin}
              onChange={(e) => onChange("nin", e.target.value.replace(/\D/g, ""))}
              placeholder="Enter your 11-digit NIN"
              className={inputClass}
            />
          </label>
        </div>

        {/* Address (textarea) and Proof of Address (file field) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col space-y-1.5">
            <span className="font-medium text-xs text-textBlack">Company Address</span>
            <textarea
              value={values.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="e.g. Tanke Estates Ilorin"
              className={`${inputClass} h-24 resize-none pt-2.5`}
            />
          </label>
          <div className="flex flex-col space-y-1.5">
            <DocumentInput
              label="Proof of Address"
              file={files.proof_of_address}
              existing={existingDocuments.proof_of_address}
              disabled={saving}
              onSelect={(file) =>
                setFiles((prev) => {
                  const next = { ...prev };
                  if (file) next.proof_of_address = file;
                  else delete next.proof_of_address;
                  return next;
                })
              }
            />
            <span className="text-[11px] text-textBlack/50">
              Upload utility bill, tenancy agreement, or bank statement (PDF, PNG, JPG).
            </span>
          </div>
        </div>

        <label className="flex flex-col space-y-1.5">
          <span className="font-medium text-xs text-textBlack">
            About / Description
          </span>
          <textarea
            value={values.about}
            onChange={(e) => onChange("about", e.target.value)}
            placeholder="Tell us about your business"
            className={`${inputClass} h-24 resize-none pt-3`}
          />
        </label>

        <div className="flex flex-col gap-3 border-t border-primary/10 pt-4">
          <div className="flex items-center gap-1.5">
            <LuFileText size={13} className="text-primary" />
            <span className="font-semibold text-xs text-textBlack">
              Company Documents
            </span>
          </div>
          <p className="text-[11px] text-textBlack/60 -mt-1">
            These are the documents checked when you request a plan upgrade.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DOCUMENT_FIELDS.filter((doc) => doc.key !== "proof_of_address").map((doc) => (
              <DocumentInput
                key={doc.key}
                label={doc.label}
                file={files[doc.key]}
                existing={existingDocuments[doc.key]}
                disabled={saving}
                onSelect={(file) =>
                  setFiles((prev) => {
                    const next = { ...prev };
                    if (file) next[doc.key] = file;
                    else delete next[doc.key];
                    return next;
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 text-xs rounded-lg border border-primary/20 bg-secondary hover:bg-primary/10 text-textBlack font-medium transition cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="px-5 py-2 text-xs rounded-lg bg-primary hover:bg-primary/90 text-textBlack font-medium transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
