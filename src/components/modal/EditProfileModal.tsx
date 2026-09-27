import React from "react";
import Modal from "./Modal";
import { LuUser } from "react-icons/lu";

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
  onSubmit: () => void;
  onClose: () => void;
  saving: boolean;
  isDirty: boolean;
}

const inputClass =
  "w-full text-textBlack border border-primary/10 bg-secondary rounded-lg px-4 h-11 text-xs outline-0 placeholder:text-textBlack/40 focus:border-primary/40 transition";

/**
 * Reusable modal wrapper around the company profile form. The Settings page
 * renders the profile read-only, so every editable control lives here and the
 * page itself stays a plain display surface.
 */
const EditProfileModal: React.FC<EditProfileModalProps> = ({
  values,
  onChange,
  onSubmit,
  onClose,
  saving,
  isDirty,
}) => (
  <Modal onClose={saving ? () => undefined : onClose}>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-2 text-primary">
        <LuUser size={16} />
        <h2 className="text-lg font-bold text-textBlack">Edit Company Profile</h2>
      </div>
      <p className="-mt-3 text-xs text-textBlack/60">
        Update your company information. Changes are saved to your account when
        you submit.
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
          disabled={saving || !isDirty}
          className="px-5 py-2 text-xs rounded-lg bg-primary hover:bg-primary/90 text-textBlack font-medium transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  </Modal>
);

export default EditProfileModal;
