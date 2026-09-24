import React from "react";
import type { OverviewCardsProps } from "../../lib/interfaces";

const OverviewCards: React.FC<OverviewCardsProps> = ({
  title,
  icon: Icon,
  value,
}) => {
  return (
    <div className="flex relative flex-col gap-1 p-3 rounded-lg bg-tertiary border border-primary/10 text-black">
      <div className="flex items-center justify-between mb-1">
        {Icon && <Icon size={16} className="text-textBlack" />}
      </div>
      <p className="text-xs text-textBlack">{title}</p>
      <p className="text-xl text-textBlack font-medium">{value}</p>
    </div>
  );
};

export default OverviewCards;
