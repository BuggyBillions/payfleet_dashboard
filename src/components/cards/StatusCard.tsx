import { formatUnderScores } from "../../helpers/formatterUtility";
import type { StatusType } from "../../lib/interfaces";

const StatusCard = ({
  type,
  text,
}: {
  type: StatusType;
  text?: string;
}) => {
  const statusStyles = {
    all: "",

    // Blue guys
    offer_sent: "bg-[#E3EFFE] border border-[#025FD6] text-[#025FD6]",
    verified: "bg-[#E3EFFE] border border-[#025FD6] text-[#025FD6]",

    // Purple guys
    payment_processing: "bg-[#6633992a] border border-[#663399] text-[#663399]",

    // Yellow guys
    pending: "bg-[#F9DF75]/25 border border-[#B59201] text-[#B59201]",

    // Green guys
    successful: "bg-[#94F975]/25 border border-[#1A8701] text-[#1A8701]",

    // Red guys
    failed: "bg-[#F6E7E6] border border-[#A80B00] text-[#A80B00]",
  };

  const finaltext = text ? text : type;

  return (
    <div
      className={`px-3 py-1 rounded-full inline-flex ${statusStyles[type]}`}
    >
      <span className="text-[10px] font-medium">
        {formatUnderScores(finaltext, true)}
      </span>
    </div>
  );
};

export default StatusCard;