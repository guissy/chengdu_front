import { useMemo } from 'react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { DataTable } from "chengdu_ui";

// 变更明细类型定义
type ChangeDetail = {
  key: string;
  oldValue: unknown;
  newValue: unknown;
};

// 日志详情预览组件
const LogChangesTable = ({ details }: { details: Record<string, { old: unknown; new: unknown }> }) => {
  // 格式化变更数据
  const formatChanges = (): ChangeDetail[] => {
    return Object.entries(details).map(([key, value]) => ({
      key,
      oldValue: value?.old ?? '-',
      newValue: value?.new ?? value
    }));
  };

  // 格式化显示的值
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // 表格列定义
  const columnHelper = createColumnHelper<ChangeDetail>();

  const columns = useMemo(() => [
    columnHelper.accessor('key', {
      header: '字段',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      size: 150,
    }),
    columnHelper.accessor('oldValue', {
      header: '变更前',
      cell: (info) => formatValue(info.getValue()),
    }),
    columnHelper.accessor('newValue', {
      header: '变更后',
      cell: (info) => formatValue(info.getValue()),
    }),
  ] as ColumnDef<ChangeDetail>[], [columnHelper]);

  // 准备数据
  const data = formatChanges();

  return (
    <div className="border rounded-md overflow-hidden">
      <DataTable
        columns={columns}
        data={data}
        pagination={false}
      />
    </div>
  );
};

export default LogChangesTable;
