import React, { useState } from "react";
import Modal from "./Modal";
import { LuUser, LuFileText, LuUpload, LuX } from "react-icons/lu";
import {
  DOCUMENT_FIELDS,
  type DocumentFiles,
  type DocumentKey,
} from "../../lib/companyDocuments";

export interface ProfileFormValues {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  address: string;
  about: string;
  bvn: string;
  nin: string;
}

interface EditProfileModalProps {
  values: ProfileFormValues;
  onChange: (key: keyof ProfileFormValues, value: string) => void;
  onSubmit: (files: DocumentFiles) => void;
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

  const hasFiles = Object.values(files).some(Boolean);
  const canSave = (isDirty || hasFiles) && !saving;

  return (
    <Modal onClose={saving ? () => undefined : onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSave) return;
          onSubmit(files);
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
          <label className="flex flex-col space-y-1.5">
            <span className="font-medium text-xs text-textBlack">Company Address</span>
            <input
              type="text"
              value={values.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="e.g. Tanke Estates Ilorin"
              className={inputClass}
            />
          </label>
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
            {DOCUMENT_FIELDS.map((doc) => (
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
