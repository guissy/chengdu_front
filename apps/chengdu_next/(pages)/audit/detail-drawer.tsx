import { format } from 'date-fns';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from 'chengdu_ui';
import { Badge } from "chengdu_ui";
import LogChangesTable from '@/(pages)/dashboard/LogChangesTable';
// import { AuditLog } from '@prisma/client';
import { targetTypeMap } from './table';
import { components } from '@/lib/api/schema';

type AuditLog = components["schemas"]["AuditLog"];

// 操作类型映射
const operationTypeMap = {
  'CREATE': { label: '新增', color: 'bg-green-100 text-green-800' },
  'UPDATE': { label: '编辑', color: 'bg-blue-100 text-blue-800' },
  'DELETE': { label: '删除', color: 'bg-red-100 text-red-800' },
};

interface AuditLogDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log?: AuditLog | null;
}

const AuditLogDetailDrawer = ({ open, onOpenChange, log }: AuditLogDetailDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px]" side="left">
        <SheetHeader>
          <SheetTitle>操作详情</SheetTitle>
          <SheetDescription>
            查看操作详细信息和变更内容
          </SheetDescription>
        </SheetHeader>

        {log && (
          <div className="mt-6 space-y-6 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">操作类型</h4>
                <Badge
                  className={operationTypeMap[log.operationType as keyof typeof operationTypeMap]?.color || 'bg-gray-100'}>
                  {operationTypeMap[log.operationType as keyof typeof operationTypeMap]?.label || log.operationType}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">操作对象</h4>
                <p>{targetTypeMap[log.targetType as keyof typeof targetTypeMap] || log.targetType}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">对象名称</h4>
                <p>{log.targetName}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">操作人</h4>
                <p>{log.operatorName}</p>
              </div>

              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">操作时间</h4>
                <p>{format(new Date(log.operationTime), 'yyyy-MM-dd HH:mm:ss')}</p>
              </div>

              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">操作内容</h4>
                <p>{log.content}</p>
              </div>

              {!!log.ipAddress && (
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">IP地址</h4>
                  <p>{String(log.ipAddress)}</p>
                </div>
              )}
            </div>

            {/* 变更详情 */}
            {log.details && Object.keys(log.details).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">变更详情</h4>
                <LogChangesTable details={log.details as unknown as Record<string, { old: unknown; new: unknown }>}/>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AuditLogDetailDrawer;
