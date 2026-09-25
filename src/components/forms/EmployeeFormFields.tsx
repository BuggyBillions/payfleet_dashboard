import React, { useCallback, useEffect, useRef, useState } from "react";
import type { FormikProps } from "formik";
import { LuLoaderCircle } from "react-icons/lu";
import { FiChevronDown } from "react-icons/fi";
import FormattedInput from "../ui/FormattedInput";
import type { EmployeeFormValues, Bank } from "../../lib/interfaces";
import {
  EMPLOYMENT_TYPES,
  getBanks,
  resolveAccount,
} from "../../services/employeeService";

const inputClass = (error?: string) =>
  `w-full text-textBlack border ${
    error ? "border-red-500" : "border-textBlack/10"
  } bg-backgroundBlack rounded-md px-4 h-[45px] text-sm outline-0 placeholder-black`;

const textareaClass = (error?: string) =>
  `w-full text-textBlack border ${
    error ? "border-red-500" : "border-textBlack/10"
  } bg-backgroundBlack rounded-md px-4 py-3 text-sm outline-0 placeholder-black resize-none`;

const fieldError = (
  formik: FormikProps<EmployeeFormValues>,
  key: keyof EmployeeFormValues,
): string | undefined =>
  formik.touched[key] && formik.errors[key]
    ? (formik.errors[key] as string)
    : undefined;

const formField = (
  label: string,
  children: React.ReactNode,
  error?: string,
  className?: string,
) => (
  <div className={`flex flex-col space-y-1 ${className ?? ""}`}>
    <label className="font-medium text-sm text-textBlack">{label}</label>
    {children}
    {error && <span className="text-red-500 pl-3 text-sm">{error}</span>}
  </div>
);

const sectionTitle = (title: string, sub: string) => (
  <div className="mb-4">
    <h3 className="font-semibold text-textBlack">{title}</h3>
    <p className="text-xs text-textBlack/50">{sub}</p>
  </div>
);

const EmployeeFormFields: React.FC<{
  formik: FormikProps<EmployeeFormValues>;
}> = ({ formik }) => {
  const grid = "grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4";

  const [bankResults, setBankResults] = useState<Bank[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  const selectedBankRef = useRef<Bank | null>(null);
  const searchTimerRef = useRef<number | null>(null);
  const resolveIdRef = useRef(0);

  useEffect(
    () => () => {
      if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    },
    [],
  );

  const triggerBankSearch = (query: string, immediate = false) => {
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(async () => {
      setBankLoading(true);
      try {
        const results = await getBanks(query.trim());
        setBankResults(results);
      } catch {
        setBankResults([]);
      } finally {
        setBankLoading(false);
      }
    }, immediate ? 0 : 500);
  };

  const getAccountDigits = () =>
    String(formik.values.account_number || "").replace(/\D/g, "");

  const triggerResolution = useCallback(
    async (accountNumber: string, bankCode: string) => {
      if (accountNumber.length < 10 || !bankCode) return;
      const id = ++resolveIdRef.current;
      setResolving(true);
      setResolveError("");
      try {
        const result = await resolveAccount(accountNumber, bankCode);
        if (id !== resolveIdRef.current) return;
        const name = result?.account_name;
        formik.setFieldValue("account_name", name ?? "");
        setResolveError(
          name
            ? ""
            : "Unable to resolve the account holder name automatically",
        );
      } catch {
        if (id !== resolveIdRef.current) return;
        formik.setFieldValue("account_name", "");
        setResolveError(
          "Could not resolve account. Check the number and try again.",
        );
      } finally {
        if (id === resolveIdRef.current) setResolving(false);
      }
    },
    [formik],
  );

  const handleBankNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue("bank_name", e.target.value);
    formik.setFieldValue("bank_code", "");
    selectedBankRef.current = null;
    setBankOpen(true);
    triggerBankSearch(e.target.value);
  };

  const handleBankFocus = () => {
    setBankOpen(true);
    const needsReload =
      bankResults.length === 0 ||
      (selectedBankRef.current &&
        selectedBankRef.current.name === formik.values.bank_name.trim());
    if (needsReload && !bankLoading) {
      triggerBankSearch("", true);
    }
  };

  const handleBankToggle = () => {
    if (bankOpen) {
      setBankOpen(false);
      return;
    }
    handleBankFocus();
  };

  const handleBankBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    formik.handleBlur(e);
    setBankOpen(false);
  };

  const handleBankSelect = (bank: Bank) => {
    selectedBankRef.current = bank;
    formik.setFieldValue("bank_name", bank.name);
    formik.setFieldValue("bank_code", bank.code);
    formik.setFieldTouched("bank_name", true, false);
    setBankOpen(false);
    const accountNumber = getAccountDigits();
    if (accountNumber.length >= 10) {
      triggerResolution(accountNumber, bank.code);
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    formik.setFieldValue("account_number", digits);
    formik.setFieldValue("account_name", "");
    setResolveError("");
    if (digits.length >= 10 && formik.values.bank_code) {
      triggerResolution(digits, formik.values.bank_code);
    }
  };

  return (
    <>
      <section className="flex flex-col space-y-4">
        {sectionTitle("Personal Information", "Basic details about the employee")}
        <div className={grid}>
          {formField(
            "First Name",
            <input
              type="text"
              name="first_name"
              placeholder="Enter first name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "first_name"))}
            />,
            fieldError(formik, "first_name"),
          )}
          {formField(
            "Last Name",
            <input
              type="text"
              name="last_name"
              placeholder="Enter last name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "last_name"))}
            />,
            fieldError(formik, "last_name"),
          )}
          {formField(
            "Email Address",
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "email"))}
            />,
            fieldError(formik, "email"),
          )}
          {formField(
            "Phone Number",
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "phone"))}
            />,
            fieldError(formik, "phone"),
          )}
          <div className="md:col-span-2 xl:col-span-2">
            {formField(
              "Address",
              <textarea
                name="address"
                rows={2}
                placeholder="Enter address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={textareaClass(fieldError(formik, "address"))}
              />,
              fieldError(formik, "address"),
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col space-y-4 border-t border-textBlack/5 pt-6">
        {sectionTitle("Employment Details", "Job and employment information")}
        <div className={grid}>
          {formField(
            "Job Title",
            <input
              type="text"
              name="job_title"
              placeholder="Enter job title"
              value={formik.values.job_title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "job_title"))}
            />,
            fieldError(formik, "job_title"),
          )}
          {formField(
            "Employment Type",
            <select
              name="employment_type"
              value={formik.values.employment_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "employment_type"))}
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>,
            fieldError(formik, "employment_type"),
          )}
        </div>
      </section>

      <section className="flex flex-col space-y-4 border-t border-textBlack/5 pt-6">
        {sectionTitle("Payment Details", "Bank and pay information")}
        <div className={grid}>
          {formField(
            "Bank Name",
            <div className="relative">
              <input
                type="text"
                name="bank_name"
                placeholder="Search or select bank..."
                autoComplete="off"
                value={formik.values.bank_name}
                onChange={handleBankNameChange}
                onFocus={handleBankFocus}
                onBlur={handleBankBlur}
                className={inputClass(
                  fieldError(formik, "bank_name"),
                ).concat(" pr-9")}
              />
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleBankToggle}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-primary cursor-pointer"
                aria-label="Toggle bank list"
              >
                <FiChevronDown
                  size={16}
                  className={`transition-transform ${bankOpen ? "rotate-180" : ""}`}
                />
              </button>
              {bankOpen && (
                <ul className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-black/10 bg-white shadow-lg">
                  {bankLoading && bankResults.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      Loading banks...
                    </li>
                  ) : bankResults.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      No banks found
                    </li>
                  ) : (
                    bankResults.map((bank) => (
                      <li
                        key={bank.code}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleBankSelect(bank);
                        }}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-secondary"
                      >
                        {bank.name}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>,
            fieldError(formik, "bank_name"),
          )}

          {formField(
            "Account Number",
            <input
              type="text"
              name="account_number"
              inputMode="numeric"
              placeholder="Enter account number"
              value={formik.values.account_number}
              onChange={handleAccountNumberChange}
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "account_number"))}
            />,
            fieldError(formik, "account_number"),
          )}

          {formField(
            "Account Name",
            <div className="relative">
              <input
                type="text"
                name="account_name"
                readOnly
                placeholder={
                  resolving
                    ? "Resolving account..."
                    : "Select a bank and enter account number"
                }
                value={formik.values.account_name}
                className={inputClass(
                  fieldError(formik, "account_name"),
                ).concat(" pr-9 opacity-90")}
              />
              {resolving && (
                <LuLoaderCircle className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-primary" />
              )}
            </div>,
            fieldError(formik, "account_name") || resolveError,
          )}

          {formField(
            "Estimate Pay (₦)",
            <FormattedInput
              name="estimate_pay"
              placeholder="Enter estimated pay"
              value={formik.values.estimate_pay}
              onChange={({ target }) =>
                formik.setFieldValue("estimate_pay", target.value)
              }
              onBlur={formik.handleBlur}
              className={inputClass(fieldError(formik, "estimate_pay"))}
            />,
            fieldError(formik, "estimate_pay"),
          )}
        </div>
      </section>
    </>
  );
};

export default EmployeeFormFields;