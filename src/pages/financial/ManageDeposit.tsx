import React from "react";
import SuperAdminManageDeposit, { type ManageDepositProps } from "../superadmin/ManageDeposit";

const FinancialManageDeposit: React.FC<ManageDepositProps> = (props) => {
  return <SuperAdminManageDeposit {...props} role="financial" />;
};

export default FinancialManageDeposit;
