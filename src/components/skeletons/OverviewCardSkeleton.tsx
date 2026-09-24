import React from "react";

const OverviewCardSkeleton: React.FC = () => {
  return (
    <div className="flex relative flex-col gap-1 py-4 px-4 mt-5 rounded-xl bg-secondary border border-primary/10 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 w-5 rounded bg-primary/10" />
      </div>
      <div className="h-3 w-24 rounded bg-primary/10" />
      <div className="h-6 w-20 rounded bg-primary/10 mt-1" />
    </div>
  );
};

export default OverviewCardSkeleton;
