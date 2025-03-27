import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'chengdu_ui';
import { Badge } from "chengdu_ui";
import { Button } from "chengdu_ui";
import { FiInfo } from 'react-icons/fi';
import { useToast } from "chengdu_ui";
import AuditLogDetailDrawer from './detail-drawer';
import { targetTypeMap } from './table';
import client from '@/lib/api/client';
import { components } from '@/lib/api/schema';
type AuditLog = components["schemas"]["AuditLog"];

// 操作类型映射
const operationTypeMap = {
  'BROWSE': { label: '浏览', color: 'bg-gray-100 text-gray-800' },
  'CREATE': { label: '新增', color: 'bg-green-100 text-green-800' },
  'UPDATE': { label: '编辑', color: 'bg-blue-100 text-blue-800' },
  'DELETE': { label: '删除', color: 'bg-red-100 text-red-800' },
};


interface RecentAuditLogsProps {
  title?: string;
  description?: string;
  limit?: number;
}

const RecentAuditLogs = ({
  title = "最近操作",
  description = "最近的系统操作记录",
  limit = 5
}: RecentAuditLogsProps) => {
  const { toast } = useToast();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

  // 使用固定的查询参数，只显示最近的几条记录
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["auditLog", "recent"],
    queryFn: () => client.GET(`/api/auditLog`, { params: { query: { page: 1, pageSize: limit } } }),
    select: (data) => data?.data?.data?.list || [],
  });

  // 处理数据加载错误
  useEffect(() => {
    if (isError && error) {
      toast({
        title: '获取最近操作记录失败',
        description: error.message || '请检查网络连接后重试',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  // 获取详情数据
  const { data: detailData, isError: isDetailError, error: detailError } = useQuery({
    // ...getAuditLogByIdOptions({ path: { id: detailLog?.id || '' } }),
    queryKey: ["auditLog", "detail", detailLog?.id],
    queryFn: () => client.GET('/api/auditLog/{id}', { params: { path: { id: detailLog?.id || '' } } }),
    enabled: !!detailLog?.id && selectedLog?.id !== detailLog?.id,
    select: (data) => data.data?.data,
  });

  // 当详情数据加载成功时，设置选中的日志并打开详情对话框
  useEffect(() => {
    if (detailData) {
      setSelectedLog(detailData);
      setDetailOpen(true);
    }
  }, [detailData]);

  // 处理详情数据加载错误
  useEffect(() => {
    if (isDetailError && !!detailError) {
      toast({
        title: '获取日志详情失败',
        description: detailError?.message || '请稍后重试',
        variant: 'destructive',
      });
    }
  }, [isDetailError, detailError, toast]);

  // 查看日志详情
  const handleViewDetail = (log: AuditLog) => {
    setDetailLog(log);
    setDetailOpen(true);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : data?.length ? (
          <div className="space-y-4">
            {data.map((log) => (
              <div key={log.id} className="border rounded-md p-3 shadow-sm ">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={operationTypeMap[log.operationType as keyof typeof operationTypeMap]?.color || 'bg-gray-500'}>
                      {operationTypeMap[log.operationType as keyof typeof operationTypeMap]?.label || log.operationType}
                    </Badge>
                    <span className="text-sm font-medium">
                      {targetTypeMap[log.targetType as keyof typeof targetTypeMap] || log.targetType}：{log.targetName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(log.operationTime), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>
                {/*<p className="text-sm text-gray-500 mb-2 line-clamp-1">{log.content}</p>*/}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>操作人：{log.operatorName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleViewDetail(log)}
                  >
                    <FiInfo className="h-3 w-3 mr-1" />
                    详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            暂无操作记录
          </div>
        )}

        {/* 详情抽屉组件 */}
        <AuditLogDetailDrawer
          open={detailOpen}
          onOpenChange={setDetailOpen}
          log={selectedLog}
        />
      </CardContent>
    </Card>
  );
};

export default RecentAuditLogs;
