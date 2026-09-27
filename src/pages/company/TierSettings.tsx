import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LuCrown, LuLayers, LuLoader, LuFileText, LuUsersRound } from "react-icons/lu";
import Modal from "../../components/modal/Modal";
import OverviewCards from "../../components/cards/OverviewCards";
import ReusableTable from "../../utility/ReusableTable";
import ActionCell from "../../components/ui/ActionCell";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import type { TableColumnProps } from "../../lib/interfaces";
import { getErrorMessage } from "../../helpers/api";
import { useUser } from "../../hooks/useUser";
import { useMyTierRequests, useRequestTierUpgrade } from "../../hooks/useTier";
import {
  getTiers,
  getEachTier,
  type Tier,
  getTierRequirements,
  findCompanyTier,
  getCompanyLevel,
  sortTiersByLevel,
  getMissingTierRequirements,
  normalizeTierRequest,
} from "../../services/tierService";

const getRequirements = getTierRequirements;

const humanize = (value: string): string =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

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

const TierSettings: React.FC<{ onGoToProfile?: () => void }> = ({ onGoToProfile }) => {
  const { user, token, refreshUser } = useUser();

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [detail, setDetail] = useState<{ id: number | string; fallback: Tier | null } | null>(null);
  const [pendingUpgrade, setPendingUpgrade] = useState<{ tier: Tier; missing: string[] } | null>(null);
  const [upgradingId, setUpgradingId] = useState<number | string | null>(null);

  const upgradeMutation = useRequestTierUpgrade();

  // The company's own pending tier requests, so an upgrade that is awaiting
  // review is visible on the page as well as right after submitting.
  const { data: myRequests = [], isLoading: loadingRequests, refetch: refetchRequests } =
    useMyTierRequests("pending");

  const loadTiers = useCallback(() => {
    setLoading(true);
    return getTiers()
      .then((data: Tier[]) => {
        setTiers(sortTiersByLevel(data));
      })
      .catch(() => {
        toast.error("Failed to load tiers");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    getTiers()
      .then((data: Tier[]) => {
        if (mounted) setTiers(sortTiersByLevel(data));
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

  const currentLevel = getCompanyLevel(user);
  const currentTier = findCompanyTier(tiers, user);
  const currentTierId = currentTier ? Number(currentTier.id) : null;
  const currentTierName = currentTier
    ? getTierName(currentTier)
    : currentLevel !== null
      ? `Level ${currentLevel}`
      : "—";

  const pendingRequests = useMemo(
    () => myRequests.map((r) => normalizeTierRequest(r, tiers)),
    [myRequests, tiers],
  );

  const pendingTierIds = useMemo(
    () =>
      new Set(
        pendingRequests
          .map((r) => r.requestedTierId)
          .filter((id): id is number => id !== null),
      ),
    [pendingRequests],
  );

  const handleView = (id: number | string) => {
    const found = tiers.find((t) => t.id === id) ?? null;
    setDetail({ id, fallback: found });
  };

  const submitUpgrade = (tier: Tier) => {
    // The id space is shared with `/me` (`company_details.tier.id`), so the
    // target plan is addressed by the id from the `/all-tiers` table.
    const requestedTier = Number(tier.id);
    if (!Number.isFinite(requestedTier) || requestedTier <= 0) {
      toast.error("This plan has an invalid id and cannot be requested.");
      return;
    }

    setUpgradingId(tier.id ?? null);
    upgradeMutation.mutate(
      { requested_tier: requestedTier },
      {
        onSettled: () => setUpgradingId(null),
        onSuccess: async () => {
          setPendingUpgrade(null);
          await Promise.all([loadTiers(), refetchRequests()]);
          if (token) await refreshUser(token);
        },
      }
    );
  };

  const handleUpgrade = (tier: Tier) => {
    const missing = getMissingTierRequirements(tier, user?.company_details as Record<string, unknown> | undefined);

    if (missing.length > 0) {
      setPendingUpgrade({ tier, missing });
      return;
    }

    submitUpgrade(tier);
  };

  const columns: TableColumnProps<Tier>[] = [
    {
      label: "Plan",
      render: (t) => {
        const isCurrent = currentTierId !== null && Number(t.id) === currentTierId;
        return (
          <span className="flex items-center gap-2 font-semibold text-textBlack capitalize">
            <LuCrown size={15} className="text-primary shrink-0" />
            {getTierName(t) || "Tier"}
            {isCurrent && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold normal-case">
                Current
              </span>
            )}
          </span>
        );
      },
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
        const tierLevel = Number(t.level ?? 0);
        const isCurrent = currentTierId !== null && Number(t.id) === currentTierId;
        // The API rejects a second upgrade with 422 "You already have a pending
        // tier upgrade request", so the action is withheld while one is open.
        const isPending = t.id != null && pendingTierIds.has(Number(t.id));
        const canUpgrade =
          !isCurrent &&
          !isPending &&
          (currentLevel === null || !Number.isFinite(tierLevel) || tierLevel > currentLevel);

        return (
          <div className="flex items-center gap-2">
            {isPending && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold whitespace-nowrap">
                Pending Review
              </span>
            )}
            <ActionCell
              rowId={t.id ?? -1}
              canView
              onView={handleView}
              otherActions={
                canUpgrade
                  ? [
                      {
                        name: upgradingId === (t.id ?? null) ? "Upgrading..." : "Upgrade",
                        icon: <LuCrown size={13} />,
                        action: () => handleUpgrade(t),
                      },
                    ]
                  : []
              }
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <OverviewCards
          icon={LuCrown}
          title="Current Plan"
          value={currentTierName}
        />
        <OverviewCards
          icon={LuLayers}
          title="Current Level"
          value={currentLevel ?? "—"}
        />
        <OverviewCards
          icon={LuUsersRound}
          title="Staff Capacity"
          value={currentTier ? getTierStaff(currentTier) : "—"}
        />
        <OverviewCards
          icon={LuFileText}
          title="Requirements"
          value={
            currentTier && getRequirements(currentTier).length > 0
              ? getRequirements(currentTier).join(", ").toUpperCase()
              : "None"
          }
        />
      </div>

      <div className="bg-secondary rounded-xl p-4 border border-primary/10">
        <div className="flex flex-col mb-4">
          <h3 className="font-semibold text-textBlack">My Tier Requests</h3>
          <p className="text-xs text-textBlack/60">
            Upgrade requests you have submitted and are awaiting review
          </p>
        </div>

        {loadingRequests ? (
          <div className="py-4 text-center text-xs text-textBlack/50 animate-pulse">
            Loading tier requests...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="py-4 text-center text-xs text-textBlack/50">
            You have no pending tier requests.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-primary/10 bg-white"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <LuLoader size={14} className="text-primary shrink-0" />
                  <span className="text-xs font-semibold text-textBlack">
                    {request.currentTierName}
                    <span className="font-normal text-textBlack/50"> → </span>
                    {request.requestedTierName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold uppercase">
                    {request.status}
                  </span>
                  <span className="text-[11px] text-textBlack/50">
                    {formatDate(request.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-secondary rounded-xl p-4 border border-primary/10">
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

      {pendingUpgrade && (
        <ConfirmDialog
          isOpen
          title="Documents required"
          cancelText="Cancel"
          confirmText="Go to Profile"
          isLoading={upgradeMutation.isPending}
          message={`Before upgrading to ${getTierName(
            pendingUpgrade.tier
          )}, please upload the following on your company profile: ${pendingUpgrade.missing
            .map(humanize)
            .join(", ")}.`}
          onCancel={() => setPendingUpgrade(null)}
          onConfirm={() => {
            setPendingUpgrade(null);
            onGoToProfile?.();
          }}
        />
      )}
    </div>
  );
};

export default TierSettings;