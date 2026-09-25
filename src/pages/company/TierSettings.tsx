import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { LuCrown, LuLoader, LuUsersRound } from "react-icons/lu";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
import Modal from "../../components/modal/Modal";
import OverviewCards from "../../components/cards/OverviewCards";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import type { TableColumnProps } from "../../lib/interfaces";
import { getErrorMessage } from "../../helpers/api";
import { useUser } from "../../hooks/useUser";
import {
  getTiers,
  getEachTier,
  moveTier,
  type Tier,
} from "../../services/tierService";
import type { CompanyTierProp } from "../../lib/interfaces";

const getTierInfo = (
  value: unknown,
): { id: number | null; label: string } => {
  if (value && typeof value === "object") {
    const obj = value as CompanyTierProp;
    return {
      id: Number(obj.id) || null,
      label: String(obj.name ?? obj.level ?? obj.id ?? "—").trim() || "—",
    };
  }
  return {
    id: Number(value) || null,
    label: String(value ?? "—"),
  };
};

const getTierName = (t: Partial<Tier>): string => String(t.name ?? "");
const getTierLevel = (t: Partial<Tier>): string => String(t.level ?? "—");
const getTierStaff = (t: Partial<Tier>): string => String(t.no_of_staff ?? "—");
const formatDate = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
const getRequirements = (t: Partial<Tier>): string[] => {
  const raw = t.requirements;
  if (Array.isArray(raw)) return raw.map((r) => String(r));
  if (typeof raw === "string")
    return raw
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
  return [];
};

const displayedFields = (tier: Partial<Tier>): Array<{ label: string; value: string }> => [
  { label: "Level", value: getTierLevel(tier) },
  { label: "No. of Staff", value: getTierStaff(tier) },
  {
    label: "Created",
    value: formatDate(tier.created_at),
  },
];

const TierDetailModal: React.FC<{
  tierId: number | string;
  fallback: Tier | null;
  onClose: () => void;
}> = ({ tierId, fallback, onClose }) => {
  const [tier, setTier] = useState<Tier | null>(fallback);
  const [loading, setLoading] = useState(Boolean(fallback) === false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fallback) return;
    let mounted = true;
    getEachTier(tierId)
      .then((data: Tier) => {
        if (mounted) setTier(data);
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(getErrorMessage(err, "Failed to load tier details"));
          toast.error(getErrorMessage(err, "Failed to load tier details"));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tierId, fallback]);

  const requirements = getRequirements(tier || {});

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <LuCrown size={20} className="text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-textBlack capitalize">
              {getTierName(tier || {}) || "Tier"}
            </h2>
            <p className="text-xs text-textBlack/60">Tier details</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <LuLoader size={20} className="animate-spin" />
            <span className="text-xs">Loading tier details...</span>
          </div>
        ) : error && !tier ? (
          <div className="flex items-center justify-center py-12 text-red-500 text-xs">
            {error}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-secondary border border-primary/10 rounded-xl p-5 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-textBlack/60 font-medium">Level</p>
                <p className="text-2xl font-bold text-textBlack">
                  {getTierLevel(tier || {})}
                </p>
              </div>
              <p className="text-4xl text-primary/20 font-bold">Tier</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayedFields(tier || {}).map((item) => (
                <div
                  key={item.label}
                  className="bg-secondary/50 p-3 rounded-lg border border-primary/10 space-y-1"
                >
                  <p className="text-xs text-textBlack/60 font-medium">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-textBlack truncate">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {requirements.length > 0 && (
              <div className="bg-secondary/50 p-4 rounded-lg border border-primary/10">
                <p className="text-xs text-textBlack/60 font-medium mb-2">
                  Requirements
                </p>
                <ul className="flex flex-col gap-1.5">
                  {requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs text-textBlack"
                    >
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-lg border border-primary/10 bg-secondary hover:bg-primary/10 text-textBlack font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const TierUpgradeModal: React.FC<{
  tier: Tier;
  onClose: () => void;
  onUpgraded: () => void;
}> = ({ tier, onClose, onUpgraded }) => {
  const [saving, setSaving] = useState(false);

  const handleUpgrade = async () => {
    if (!tier.id) return;
    setSaving(true);
    try {
      await moveTier(tier.id);
      toast.success("Tier upgrade request sent successfully");
      onUpgraded();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to request tier upgrade"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <LuCrown size={20} className="text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-textBlack capitalize">
              Upgrade to {getTierName(tier)}?
            </h2>
            <p className="text-xs text-textBlack/60">
              Level {getTierLevel(tier)} · {getTierStaff(tier)} staff
            </p>
          </div>
        </div>

        <p className="text-xs text-textBlack/70 leading-relaxed">
          You are requesting to move your company to this tier. A confirmation
          will be sent once the request is approved.
        </p>

        {getRequirements(tier).length > 0 && (
          <div className="bg-secondary/50 p-4 rounded-lg border border-primary/10">
            <p className="text-xs text-textBlack/60 font-medium mb-2">
              Required documents
            </p>
            <div className="flex flex-wrap gap-2">
              {getRequirements(tier).map((req, index) => (
                <span
                  key={index}
                  className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-lg border border-primary/10 bg-secondary hover:bg-primary/10 text-textBlack font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={saving}
            className="px-5 py-2 text-sm rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition cursor-pointer disabled:opacity-60"
          >
            {saving ? "Sending..." : "Request Upgrade"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const TierSettings: React.FC = () => {
  const { user } = useUser();
  const rawCompanyTier = user?.company_details?.tier ?? user?.tier;
  const { id: currentTierId, label: currentTierLabel } =
    getTierInfo(rawCompanyTier);

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [detail, setDetail] = useState<{ id: number | string; fallback: Tier | null } | null>(null);
  const [upgrading, setUpgrading] = useState<Tier | null>(null);

  useEffect(() => {
    let mounted = true;
    getTiers()
      .then((data: Tier[]) => {
        if (mounted) setTiers(data);
      })
      .catch(() => {
        if (mounted) toast.error("Failed to load tiers");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleView = (id: number | string) => {
    const found = tiers.find((t) => t.id === id) ?? null;
    setDetail({ id, fallback: found });
  };

  const columns: TableColumnProps<Tier>[] = [
    {
      label: "Tier",
      render: (t) => (
        <span className="flex items-center gap-2 font-semibold text-textBlack capitalize">
          <LuCrown size={15} className="text-primary shrink-0" />
          {getTierName(t) || "Tier"}
        </span>
      ),
    },
    {
      label: "Level",
      render: (t) => <span className="font-medium">{getTierLevel(t)}</span>,
    },
    {
      label: "No. of Staff",
      render: (t) => (
        <span className="flex items-center gap-1.5 font-medium">
          <LuUsersRound size={14} className="text-textBlack/50" />
          {getTierStaff(t)}
        </span>
      ),
    },
    {
      label: "Requirements",
      render: (t) => {
        const reqs = getRequirements(t);
        return (
          <span className="text-[11px] text-textBlack/70 max-w-60 truncate">
            {reqs.length > 0 ? reqs.join(", ") : "—"}
          </span>
        );
      },
    },
    {
      label: "Action",
      render: (t) => {
        const isCurrent = currentTierId !== null && Number(t.id) === currentTierId;
        return (
          <ActionCell
            rowId={t.id ?? -1}
            canView
            onView={handleView}
            otherActions={
              isCurrent
                ? []
                : [
                    {
                      name: "Upgrade",
                      icon: <LuCrown size={13} />,
                      action: () => setUpgrading(t),
                    },
                  ]
            }
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuCrown}
          title="Current Tier"
          value={currentTierLabel}
          icon2={HiOutlineArrowTrendingUp}
        />
      </div>

      <div className="bg-tertiary rounded-xl p-4 border border-primary/10">
        <div className="flex flex-col mb-4">
          <h3 className="font-semibold text-textBlack">Available Tiers</h3>
          <p className="text-xs text-textBlack/60">
            View available tiers and request an upgrade
          </p>
        </div>
        <ReusableTable
          columns={columns}
          data={tiers}
          isLoading={loading}
          error={null}
          currentPage={currentPage}
          totalPages={Math.ceil(tiers.length / itemsPerPage) || 1}
          totalItems={tiers.length}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      {detail && (
        <TierDetailModal
          tierId={detail.id}
          fallback={detail.fallback}
          onClose={() => setDetail(null)}
        />
      )}

      {upgrading && (
        <TierUpgradeModal
          tier={upgrading}
          onClose={() => setUpgrading(null)}
          onUpgraded={() => undefined}
        />
      )}
    </div>
  );
};

export default TierSettings;