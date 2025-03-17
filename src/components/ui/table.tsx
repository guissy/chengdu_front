import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronUp
} from 'react-icons/fi';
import Button from './button';

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: boolean;
  sorting?: boolean;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  globalFilter?: string;
  globalFilterFn?: FilterFn<TData>;
  loading?: boolean;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  pagination = true,
  sorting = true,
  pageSize = 10,
  onRowClick,
  globalFilter = '',
  globalFilterFn,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sortingState, setSortingState] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting: sortingState,
      globalFilter,
    },
    onSortingChange: setSortingState,
    getSortedRowModel: sorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    globalFilterFn,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border border-base-300">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${sorting && header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                          onClick={
                            sorting && header.column.getCanSort()
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sorting && header.column.getCanSort() && (
                            <span>
                              {header.column.getIsSorted() === 'asc' ? (
                                <FiChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <FiChevronDown className="h-4 w-4" />
                              ) : (
                                <div className="opacity-0 group-hover:opacity-100 h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    <div className="flex justify-center">
                      <span className="loading loading-spinner loading-md"></span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    没有找到数据
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={onRowClick ? 'cursor-pointer hover:bg-base-200' : ''}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-base-content/70">
            显示第 {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} 至{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            条，共 {table.getFilteredRowModel().rows.length} 条
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium min-w-12 text-right pr-2">每页</span>
              <select
                className="select select-bordered select-sm"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                icon={<FiChevronsLeft className="h-4 w-4" />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                icon={<FiChevronLeft className="h-4 w-4" />}
              />
              <span className="text-sm font-medium">
                第{' '}
                <strong>
                  {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                </strong>{' '}
                页
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                icon={<FiChevronRight className="h-4 w-4" />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                icon={<FiChevronsRight className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
