import React from "react";
import StatusBadge, { type StatusBadgeProps } from "../ui/StatusBadge";
import type { StatusType } from "../../lib/interfaces";

export interface StatusCardProps extends Omit<StatusBadgeProps, "type"> {
  type?: StatusType | string;
}

const StatusCard: React.FC<StatusCardProps> = ({ type, status, text, className, withDot }) => {
  return <StatusBadge status={status || type} text={text} className={className} withDot={withDot} />;
};

export default StatusCard;