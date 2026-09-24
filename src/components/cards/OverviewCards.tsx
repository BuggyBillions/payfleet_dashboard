import React from "react";
import type { OverviewCardsProps } from "../../lib/interfaces";

const OverviewCards: React.FC<OverviewCardsProps> = ({
  title,
  icon: Icon,
  value,
}) => {
  return (
    <div className="flex relative flex-col gap-1 p-3 mt-5 rounded-lg bg-secondary border border-primary/10 text-tableData">
      <div className="flex items-center justify-between mb-1">
        {Icon && <Icon size={16} className="text-tableHeading" />}
      </div>
      <p className="text-xs text-tableHeading">{title}</p>
      <p className="text-xl font-medium">{value}</p>
    </div>
  );
};

export default OverviewCards;
