import React from "react";
import PaginationControls from "./PaginationControls";
import type { ReusableTableProps, TableColumnProps } from "../lib/interfaces";
import { LuLoaderCircle } from "react-icons/lu";

const ReusableTable = <T extends { id?: number | string }>({
  columns,
  data,
  isLoading,
  error,
  currentPage,
  totalPages,
  totalItems,
  setCurrentPage,
  hasSerialNo = true,
  tableType,
  itemsPerPage,
  setItemsPerPage,
  selectable = false,
  selectedRowIds = [],
  onToggleRowSelection,
  onToggleAllRows,
  getRowId,
}: ReusableTableProps<T>) => {
  const selectedRowSet = new Set(selectedRowIds);
  const selectableRowIds = data
    .map((item, index) => (getRowId ? getRowId(item, index) : item.id))
    .filter((id): id is number | string => id !== undefined && id !== null);
  const allRowsSelected =
    selectableRowIds.length > 0 &&
    selectableRowIds.every((id) => selectedRowSet.has(id));

  const columnsWithSN: TableColumnProps<T>[] = [
    ...(selectable
      ? [
          {
            label: (
              <label
                htmlFor="rowCheckBox"
                className="relative flex items-center cursor-pointer text-center"
              >
                <input
                  type="checkbox"
                  id="rowCheckBox"
                  className="peer appearance-none hidden size-4 rounded-md border border-tableBorder bg-secondary outline-0"
                  checked={allRowsSelected}
                  onChange={(e) => onToggleAllRows?.(e.target.checked)}
                />
                <span className="relative size-5 mx-auto pointer-events-none rounded border border-tableBorder bg-secondary peer-checked:bg-primary peer-checked:border-primary transition-all"></span>
                <span className="hidden peer-checked:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-0.5 w-[7px] h-3 border-r-3 border-b-3 border-white rotate-45"></span>
              </label>
            ),
            key: "bulk-select",
            render: (item: T, index: number) => {
              const rowId = getRowId ? getRowId(item, index) : item.id;

              if (rowId === undefined || rowId === null) return null;

              return (
                <input
                  type="checkbox"
                  aria-label="Select row"
                  checked={selectedRowSet.has(rowId)}
                  onChange={() => onToggleRowSelection?.(rowId)}
                  className="size-5 rounded outline-0 cursor-pointer row-checkbox"
                />
              );
            },
            className:
              "p-3 text-center border-x border-tableBorder first:border-s-0 last:border-e-0",
            tableHeadingClassName: "text-center!",
          },
        ]
      : []),

    ...(hasSerialNo
      ? [
          {
            label: "S/N",
            key: "sn",
            render: (_: T, index: number) => {
              const serial = (currentPage - 1) * itemsPerPage + index + 1;
              return serial.toString().padStart(3, "0");
            },
            className:
              "px-3 py-2 text-[10px] text-start whitespace-nowrap font-medium",
          },
        ]
      : []),

    ...columns,
  ];

  return (
    <div className="space-y-5 pb-10">
      <div className="overflow-x-auto no-scrollbar w-full lg:p-0 pe-4">
        <table className="w-full min-w-250 bg-white mb-2">
          <thead>
            <tr className="bg-[#E0E5DC69] h-11 rounded-xl">
              {columnsWithSN.map((col, idx) => (
                <th
                  key={col.key ?? idx}
                  className={`px-3 py-1 text-[10px] font-medium text-tableHeading text-start border-x border-tableBorder first:border-s-0 last:border-e-0 whitespace-nowrap ${col.tableHeadingClassName}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr className="h-12 border-y border-tableBorder">
                <td colSpan={columnsWithSN.length}>
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <LuLoaderCircle className="animate-spin" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr className="h-12 border-y border-tableBorder">
                <td
                  colSpan={columnsWithSN.length}
                  className="px-3 py-1 text-[10px] text-center"
                >
                  {typeof error === "string"
                    ? error
                    : error instanceof Error
                      ? error.message
                      : "An error occurred"}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr className="h-11 border-y border-tableBorder">
                <td
                  colSpan={columnsWithSN.length}
                  className="px-3 py-1 text-[10px] text-center"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={(getRowId ? getRowId(item, index) : item.id) || index}
                  className={`h-11 border-y border-tableBorder`}
                >
                  {columnsWithSN.map((col, idx) => (
                    <td
                      key={col.key ?? idx}
                      className={
                        col.className ||
                        "px-3 py-1 text-[10px] whitespace-nowrap text-tableData font-medium border-x border-tableBorder first:border-s-0 last:border-e-0"
                      }
                    >
                      {col.render
                        ? col.render(item, index)
                        : col.key
                          ? (item as Record<string, React.ReactNode>)[col.key]
                          : "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && !error && data.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            tableType={tableType}
          />
        )}
      </div>
    </div>
  );
};

export default ReusableTable;
