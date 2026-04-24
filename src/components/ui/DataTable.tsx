import React from "react";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-auto rounded-md border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 transition-colors">
            {columns.map((col, idx) => (
              <th key={idx} className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center align-middle">
                No results.
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b transition-colors hover:bg-muted/50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="p-4 align-middle">
                    {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey]) : "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
