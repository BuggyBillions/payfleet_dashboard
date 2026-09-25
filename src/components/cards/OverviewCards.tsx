import React from "react";
import type { OverviewCardsProps } from "../../lib/interfaces";

const OverviewCards: React.FC<OverviewCardsProps> = ({
  title,
  icon: Icon,
  icon2: Icon2,
  value,
}) => {
  return (
    <div className="flex relative flex-col gap-1 p-3.5 rounded-xl bg-tertiary border border-primary/10 text-textBlack shadow-xs">
      <div className="flex items-center justify-between mb-1">
        {Icon && <Icon size={18} className="text-textBlack/80" />}
        {Icon2 && <Icon2 size={16} className="text-textBlack/40" />}
      </div>
      <p className="text-xs text-textBlack/70 font-medium">{title}</p>
      <p className="text-xl text-textBlack font-bold tracking-tight">{value}</p>
    </div>
  );
};

export default OverviewCards;
