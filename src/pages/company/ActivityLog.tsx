import React, { useState } from "react";
import ReusableTable from "../../utility/ReusableTable";
import PageHeader from "../../components/navs/PageHeader";
import type { CompanyActivityLog, TableColumnProps } from "../../lib/interfaces";
import { formatShortDate } from "../../helpers/formatterUtility";
import { useUser } from "../../hooks/useUser";
import { useCompanyActivityLogs } from "../../hooks/useCompany";

const ActivityLog: React.FC = () => {
  const { user } = useUser();
  const companyId = user?.company_details?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data, isLoading, isError, error } = useCompanyActivityLogs(
    {
      company_id: companyId,
      page: currentPage,
      per_page: itemsPerPage,
    },
    Boolean(companyId),
  );

  const logs = data?.items ?? [];

  const columns: TableColumnProps<CompanyActivityLog>[] = [
    {
      label: "Action",
      render: (item) => (
        <span className="font-semibold text-inherit">
          {item.action || "—"}
        </span>
      ),
    },
    {
      label: "Type",
      render: (item) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium capitalize">
          {item.type || "—"}
        </span>
      ),
    },
    {
      label: "Details",
      render: (item) => (
        <span className="whitespace-normal max-w-xl text-left font-normal">
          {item.description || "—"}
        </span>
      ),
    },
    {
      label: "Date",
      render: (item) => (
        <span>{item.createdAt ? formatShortDate(item.createdAt) : "—"}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        heading="Activity Log"
        value="Audit trail of actions on your account"
      />

      <div className="bg-tertiary rounded-xl p-4">
        <ReusableTable
          columns={columns}
          data={logs}
          isLoading={isLoading}
          error={isError ? error : null}
          currentPage={currentPage}
          totalPages={data?.totalPages ?? 1}
          totalItems={data?.totalItems ?? logs.length}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          tableType="Activity Log"
        />
      </div>
    </div>
  );
};

export default ActivityLog;
