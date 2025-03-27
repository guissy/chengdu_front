import { useMemo } from 'react';
import { format } from 'date-fns';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { FiInfo } from 'react-icons/fi';
import { DataTable } from "chengdu_ui";
import { Button } from "chengdu_ui";
import { Badge } from "chengdu_ui";
// import { AuditLog } from '@prisma/client';
import { components } from '@/lib/api/schema';

type AuditLog = components["schemas"]["AuditLog"];

// 操作类型映射
const operationTypeMap = {
  'BROWSE': { label: '浏览', color: 'bg-gray-100 text-gray-800' },
  'CREATE': { label: '新增', color: 'bg-green-100 text-green-800' },
  'UPDATE': { label: '编辑', color: 'bg-blue-100 text-blue-800' },
  'DELETE': { label: '删除', color: 'bg-red-100 text-red-800' },
};

// 操作对象映射
export const targetTypeMap = {
  'CBD': '商圈',
  'PART': '物业小区',
  'POSITION': '铺位',
  'SHOP': '商家',
  'SPACE': '广告位',
  'CITY': '城市',
  'DISTRICT': '行政区划',
  'DASHBOARD': '仪表盘',
};

interface AuditLogTableProps {
  data: AuditLog[];
  isLoading: boolean;
  onViewDetail: (log: AuditLog) => void;
}

const AuditLogTable = ({ data, isLoading, onViewDetail }: AuditLogTableProps) => {
  // 表格列定义
  const columnHelper = createColumnHelper<AuditLog>();

  const columns = useMemo(() => [
    columnHelper.accessor('operationType', {
      header: '操作类型',
      cell: (info) => (
        <Badge className={operationTypeMap[info.getValue() as keyof typeof operationTypeMap]?.color || 'bg-gray-100'}>
          {operationTypeMap[info.getValue() as keyof typeof operationTypeMap]?.label || info.getValue()}
        </Badge>
      ),
      size: 100,
    }),
    columnHelper.accessor('targetType', {
      header: '操作对象',
      cell: (info) => targetTypeMap[info.getValue() as keyof typeof targetTypeMap] || info.getValue(),
      size: 120,
    }),
    columnHelper.accessor('targetName', {
      header: '对象名称',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('content', {
      header: '操作内容',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('operatorName', {
      header: '操作人',
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor('operationTime', {
      header: '操作时间',
      cell: (info) => format(new Date(info.getValue()), 'yyyy-MM-dd HH:mm:ss'),
      size: 180,
    }),
    columnHelper.display({
      id: 'actions',
      header: '操作',
      cell: (info) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(info.row.original as AuditLog);
            }}
          >
            <FiInfo className="h-4 w-4"/>
            <span className="ml-1">详情</span>
          </Button>
        </div>
      ),
      size: 80,
    }),
  ] as ColumnDef<AuditLog>[], [columnHelper, onViewDetail]);

  return (
    <DataTable
      columns={columns}
      data={data || []}
      loading={isLoading}
    />
  );
};

export default AuditLogTable;
