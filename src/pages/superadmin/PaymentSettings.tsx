import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "../../hooks/useUser";
import {
  usePaymentSettings,
  useCreatePaymentSettings,
  useUpdatePaymentSettings,
} from "../../hooks/usePaymentSettings";
import { formatterUtility } from "../../helpers/formatterUtility";
import { roundToTwoDecimals } from "../../helpers/feeCalculator";
import { toast } from "sonner";
import {
  LuReceipt,
  LuShieldCheck,
  LuCoins,
  LuSave,
  LuLoader,
  LuRefreshCw,
  LuInfo,
  LuCircleCheck,
  LuCircleAlert,
  LuCalendar,
} from "react-icons/lu";
import { FaBuildingColumns } from "react-icons/fa6";

const PaymentSettings: React.FC = () => {
  const { user, role, loading: userLoading } = useUser();

  // Authorization check following existing admin patterns
  const currentRole = (role || user?.role || "").toLowerCase();
  const isAdmin =
    currentRole.includes("admin") ||
    currentRole.includes("superadmin") ||
    window.location.pathname.startsWith("/admin");

  // Fetch payment settings
  const {
    data: settings,
    isLoading: loadingSettings,
    isError,
    error,
    refetch,
    isFetching,
  } = usePaymentSettings();

  const createMutation = useCreatePaymentSettings();
  const updateMutation = useUpdatePaymentSettings();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Determine whether configuration exists (to switch between Create and Update mode)
  const hasExistingSettings = Boolean(
    settings &&
      (settings.id !== undefined ||
        settings.singleton !== undefined ||
        settings.vat !== undefined)
  );

  // Form input states
  const [vat, setVat] = useState("");
  const [federalGovernmentFee, setFederalGovernmentFee] = useState("");
  const [payfleetFee, setPayfleetFee] = useState("");
  const [touched, setTouched] = useState(false);

  // Sync inputs with fetched settings
  useEffect(() => {
    if (settings) {
      setVat(settings.vat !== undefined && settings.vat !== null ? String(settings.vat) : "");
      setFederalGovernmentFee(
        settings.federal_government_fee !== undefined && settings.federal_government_fee !== null
          ? String(settings.federal_government_fee)
          : ""
      );
      setPayfleetFee(
        settings.payfleet_fee !== undefined && settings.payfleet_fee !== null
          ? String(settings.payfleet_fee)
          : ""
      );
    }
  }, [settings]);

  // Live calculation preview
  const livePreview = useMemo(() => {
    const v = Number(vat) || 0;
    const f = Number(federalGovernmentFee) || 0;
    const p = Number(payfleetFee) || 0;
    const perEmployee = roundToTwoDecimals(v + f + p);
    return {
      vat: v,
      fedGovt: f,
      payfleet: p,
      perEmployee,
      for5: roundToTwoDecimals(perEmployee * 5),
      for10: roundToTwoDecimals(perEmployee * 10),
      for25: roundToTwoDecimals(perEmployee * 25),
      for50: roundToTwoDecimals(perEmployee * 50),
    };
  }, [vat, federalGovernmentFee, payfleetFee]);

  // Input validation
  const validationError = useMemo(() => {
    if (!touched) return null;
    const v = Number(vat);
    const f = Number(federalGovernmentFee);
    const p = Number(payfleetFee);

    if (vat.trim() === "" || isNaN(v) || v < 0) {
      return "VAT must be a valid, non-negative number";
    }
    if (federalGovernmentFee.trim() === "" || isNaN(f) || f < 0) {
      return "Federal Government Fee must be a valid, non-negative number";
    }
    if (payfleetFee.trim() === "" || isNaN(p) || p < 0) {
      return "Payfleet Fee must be a valid, non-negative number";
    }
    return null;
  }, [vat, federalGovernmentFee, payfleetFee, touched]);

  // Handle form submission (Create or Update based on existence)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const v = Number(vat);
    const f = Number(federalGovernmentFee);
    const p = Number(payfleetFee);

    if (vat.trim() === "" || isNaN(v) || v < 0) {
      toast.error("VAT must be a valid, non-negative number");
      return;
    }
    if (federalGovernmentFee.trim() === "" || isNaN(f) || f < 0) {
      toast.error("Federal Government Fee must be a valid, non-negative number");
      return;
    }
    if (payfleetFee.trim() === "" || isNaN(p) || p < 0) {
      toast.error("Payfleet Fee must be a valid, non-negative number");
      return;
    }

    const payload = {
      vat: v.toFixed(2),
      federal_government_fee: f.toFixed(2),
      payfleet_fee: p.toFixed(2),
    };

    if (hasExistingSettings) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // Unauthorized access guard
  if (!userLoading && !isAdmin) {
    return (
      <div className="p-8 text-center bg-tertiary rounded-2xl border border-red-500/20 max-w-lg mx-auto mt-12 space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <LuCircleAlert size={24} />
        </div>
        <h3 className="text-base font-bold text-textBlack">Access Restricted</h3>
        <p className="text-xs text-textBlack/60">
          You do not have administrative permissions to view or configure payment fee settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-textBlack flex items-center gap-2">
            <span>Payment Settings</span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                hasExistingSettings
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}
            >
              {hasExistingSettings ? "Configured" : "Unconfigured"}
            </span>
          </h2>
          <p className="text-xs text-textBlack/60">
            Manage statutory transaction fees and platform levies charged per employee payout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-medium bg-secondary text-textBlack hover:bg-secondary/80 border border-primary/10 transition cursor-pointer"
            title="Refresh fee settings"
          >
            <LuRefreshCw size={13} className={isFetching ? "animate-spin text-primary" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loadingSettings ? (
        <div className="p-12 text-center text-xs text-primary animate-pulse bg-tertiary rounded-2xl border border-primary/10 flex flex-col items-center justify-center gap-3">
          <LuLoader size={26} className="animate-spin text-primary" />
          <span>Loading payment fee settings...</span>
        </div>
      ) : isError ? (
        /* Error Alert */
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-red-600 font-semibold">
            <LuCircleAlert size={16} />
            <span>Failed to load payment fee settings</span>
          </div>
          <p className="text-textBlack/70">
            {(error as Error)?.message || "An unexpected error occurred while fetching configuration."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium cursor-pointer transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Active Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: VAT */}
            <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-textBlack/60">Value Added Tax (VAT)</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <LuReceipt size={16} />
                </div>
              </div>
              <div className="text-xl font-bold text-textBlack">
                {settings ? formatterUtility(Number(settings.vat)) : "₦0.00"}
              </div>
              <p className="text-[10px] text-textBlack/50">Charged per employee</p>
            </div>

            {/* Card 2: Federal Government Fee */}
            <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-textBlack/60">Fed. Government Fee</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <FaBuildingColumns size={15} />
                </div>
              </div>
              <div className="text-xl font-bold text-textBlack">
                {settings ? formatterUtility(Number(settings.federal_government_fee)) : "₦0.00"}
              </div>
              <p className="text-[10px] text-textBlack/50">Charged per employee</p>
            </div>

            {/* Card 3: Payfleet Fee */}
            <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-textBlack/60">Payfleet Service Fee</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <LuCoins size={16} />
                </div>
              </div>
              <div className="text-xl font-bold text-textBlack">
                {settings ? formatterUtility(Number(settings.payfleet_fee)) : "₦0.00"}
              </div>
              <p className="text-[10px] text-textBlack/50">Charged per employee</p>
            </div>

            {/* Card 4: Total Per Employee */}
            <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">Total Fee Per Employee</span>
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                  <LuShieldCheck size={16} />
                </div>
              </div>
              <div className="text-xl font-bold text-primary">
                {settings
                  ? formatterUtility(
                      roundToTwoDecimals(
                        (Number(settings.vat) || 0) +
                          (Number(settings.federal_government_fee) || 0) +
                          (Number(settings.payfleet_fee) || 0)
                      )
                    )
                  : "₦0.00"}
              </div>
              <p className="text-[10px] text-primary/70">Sum of all statutory & platform fees</p>
            </div>
          </div>

          {/* Configuration Form & Live Preview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column (2 Cols) */}
            <div className="lg:col-span-2 bg-tertiary rounded-2xl p-6 border border-primary/10 space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-textBlack">
                  {hasExistingSettings ? "Update Payment Fee Configuration" : "Create Payment Fee Configuration"}
                </h3>
                <p className="text-xs text-textBlack/60">
                  {hasExistingSettings
                    ? "Modify the active statutory and service fees. New fees will apply immediately to subsequent employee payouts."
                    : "No payment fee settings found. Please define the baseline fees to initialize the platform fee configuration."}
                </p>
              </div>

              {validationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <LuCircleAlert size={15} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field 1: VAT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textBlack flex items-center justify-between">
                    <span>Value Added Tax (VAT)</span>
                    <span className="text-[11px] text-textBlack/50 font-normal">Per employee (₦)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-xs text-textBlack/60">
                      ₦
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={vat}
                      onChange={(e) => {
                        setVat(e.target.value);
                        setTouched(true);
                      }}
                      placeholder="e.g. 50.00"
                      className="w-full pl-8 pr-4 h-11 text-xs bg-secondary text-textBlack border border-primary/10 rounded-xl outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-textBlack/50">
                    Statutory VAT levy billed per individual employee payment.
                  </p>
                </div>

                {/* Field 2: Federal Government Fee */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textBlack flex items-center justify-between">
                    <span>Federal Government Fee</span>
                    <span className="text-[11px] text-textBlack/50 font-normal">Per employee (₦)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-xs text-textBlack/60">
                      ₦
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={federalGovernmentFee}
                      onChange={(e) => {
                        setFederalGovernmentFee(e.target.value);
                        setTouched(true);
                      }}
                      placeholder="e.g. 50.00"
                      className="w-full pl-8 pr-4 h-11 text-xs bg-secondary text-textBlack border border-primary/10 rounded-xl outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-textBlack/50">
                    Federal Government statutory transaction fee per individual employee payout.
                  </p>
                </div>

                {/* Field 3: Payfleet Fee */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textBlack flex items-center justify-between">
                    <span>Payfleet Processing Fee</span>
                    <span className="text-[11px] text-textBlack/50 font-normal">Per employee (₦)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-xs text-textBlack/60">
                      ₦
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payfleetFee}
                      onChange={(e) => {
                        setPayfleetFee(e.target.value);
                        setTouched(true);
                      }}
                      placeholder="e.g. 50.00"
                      className="w-full pl-8 pr-4 h-11 text-xs bg-secondary text-textBlack border border-primary/10 rounded-xl outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-textBlack/50">
                    Platform technology service fee charged per recipient employee.
                  </p>
                </div>

                {/* Submit Action */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-primary/10">
                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(validationError)}
                    className="px-6 h-11 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <LuLoader size={14} className="animate-spin" />
                        <span>Saving Settings...</span>
                      </>
                    ) : (
                      <>
                        <LuSave size={14} />
                        <span>{hasExistingSettings ? "Update Payment Settings" : "Create Payment Settings"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Calculation Preview & Audit Info (1 Col) */}
            <div className="space-y-6">
              {/* Live Fee Calculator Preview */}
              <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-textBlack">
                  <LuInfo className="text-primary" size={15} />
                  <span>Live Fee Calculation Preview</span>
                </div>

                <div className="bg-secondary rounded-xl p-3.5 border border-primary/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-textBlack/70">
                    <span>Total Fee Per Employee</span>
                    <span className="font-bold text-primary text-sm">
                      {formatterUtility(livePreview.perEmployee)}
                    </span>
                  </div>
                  <p className="text-[10px] text-textBlack/50">
                    ₦{livePreview.vat.toFixed(2)} (VAT) + ₦{livePreview.fedGovt.toFixed(2)} (Govt) + ₦{livePreview.payfleet.toFixed(2)} (Payfleet)
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-[11px] font-semibold text-textBlack/60 uppercase tracking-wider">
                    Volume Multipliers
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                      <span className="text-textBlack/70">5 Employees</span>
                      <span className="font-semibold text-textBlack">{formatterUtility(livePreview.for5)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                      <span className="text-textBlack/70">10 Employees</span>
                      <span className="font-semibold text-textBlack">{formatterUtility(livePreview.for10)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                      <span className="text-textBlack/70">25 Employees</span>
                      <span className="font-semibold text-textBlack">{formatterUtility(livePreview.for25)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                      <span className="text-textBlack/70">50 Employees</span>
                      <span className="font-semibold text-textBlack">{formatterUtility(livePreview.for50)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit / Metadata Card */}
              {hasExistingSettings && settings && (
                <div className="bg-tertiary rounded-2xl p-5 border border-primary/10 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-textBlack">
                    <LuCircleCheck className="text-emerald-500" size={15} />
                    <span>Configuration Metadata</span>
                  </div>

                  <div className="space-y-2 text-[11px] text-textBlack/70">
                    {settings.updated_at && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-textBlack/50">
                          <LuCalendar size={12} /> Last Modified
                        </span>
                        <span className="font-medium text-textBlack">
                          {new Date(settings.updated_at).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    )}
                    {settings.created_at && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-textBlack/50">
                          <LuCalendar size={12} /> Created
                        </span>
                        <span className="font-medium text-textBlack">
                          {new Date(settings.created_at).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    )}
                    {settings.updated_by !== undefined && settings.updated_by !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-textBlack/50">Updated By (Admin ID)</span>
                        <span className="font-mono font-medium text-textBlack">{String(settings.updated_by)}</span>
                      </div>
                    )}
                    {settings.id !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-textBlack/50">Record ID</span>
                        <span className="font-mono font-medium text-textBlack">#{String(settings.id)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSettings;