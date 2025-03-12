import { useState, useEffect } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FiFilter, FiRefreshCw, FiActivity } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
// import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/useToast';
import { getAuditLogByIdOptions, getAuditLogOptions } from '@/api/@tanstack/react-query.gen.ts';
import { AuditLog } from '@/api';
import AuditLogTable from './table';
import AuditLogDetailDrawer from './detail-drawer';

// 操作类型选项
const operationTypeOptions = [
  { value: '', label: '全部类型' },
  { value: 'CREATE', label: '新增' },
  { value: 'UPDATE', label: '编辑' },
  { value: 'DELETE', label: '删除' },
];

// 目标类型选项
const targetTypeOptions = [
  { value: '', label: '全部对象' },
  { value: 'CBD', label: '商圈' },
  { value: 'PART', label: '物业分区' },
  { value: 'POSITION', label: '铺位' },
  { value: 'SHOP', label: '店铺' },
  { value: 'SPACE', label: '广告位' },
  { value: 'CAMPAIGN', label: '广告活动' },
];

const AuditLogList = () => {
  const { toast } = useToast();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

  // 过滤条件
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    operationType: '',
    targetType: '',
    startDate: '',
    endDate: '',
    keyword: '',
  });

  // 使用 TanStack Query 获取数据
  const { data, isLoading, refetch, isError, error } = useQuery({
    ...getAuditLogOptions({
      query: filters
    }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: '获取审计日志失败',
        description: error.message || '请检查网络连接后重试',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  const { data: detailData, isError: isDetailError, error: detailError } = useQuery({
    ...getAuditLogByIdOptions({ path: { id: detailLog?.id || '' } }),
    enabled: !!detailLog?.id && selectedLog?.id !== detailLog?.id,
    select: (data) => data.data,
  });

  // 当数据加载成功时，设置选中的日志并打开详情对话框
  useEffect(() => {
    if (detailData) {
      setSelectedLog(detailData);
      setDetailOpen(true);
    }
  }, [detailData]);

  useEffect(() => {
    if (isDetailError && !!detailError) {
      toast({
        title: '获取日志详情失败',
        description: detailError?.message || '请稍后重试',
        variant: 'destructive',
      });
    }
  }, [isDetailError, detailError, toast]);

  // 处理过滤条件变更
  const handleFilterChange = (name: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 处理日期范围变更
  /*const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      setFilters((prev) => ({
        ...prev,
        startDate: format(range.from!, 'yyyy-MM-dd'),
        endDate: range.to ? format(range.to, 'yyyy-MM-dd') : '',
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: '',
        endDate: '',
      }));
    }
  };*/

  // 重置过滤条件
  const resetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      operationType: '',
      targetType: '',
      startDate: '',
      endDate: '',
      keyword: '',
    });
  };

  // 应用过滤条件
  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
    refetch();
  };

  // 查看日志详情
  const handleViewDetail = (log: AuditLog) => {
    setDetailLog(log);
    setDetailOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>操作日志</CardTitle>
        <CardDescription>
          系统操作记录和变更历史
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 过滤器 */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Select
              options={operationTypeOptions}
              value={filters.operationType}
              onChange={(e) => handleFilterChange('operationType', e.target.value)}
              leftIcon={<FiActivity className="h-4 w-4"/>}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Select
              options={targetTypeOptions}
              value={filters.targetType}
              onChange={(e) => handleFilterChange('targetType', e.target.value)}
              leftIcon={<FiFilter className="h-4 w-4"/>}
            />
          </div>

          {/*<div className="flex items-center space-x-2">*/}
          {/*  <DateRangePicker*/}
          {/*    onChange={handleDateRangeChange}*/}
          {/*    placeholder="选择日期范围"*/}
          {/*  />*/}
          {/*</div>*/}

          <div className="flex items-center space-x-2 flex-1">
            <Input
              placeholder="搜索操作内容、对象名称或操作人"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="w-full"
            />
          </div>

          <Button onClick={applyFilters} className="flex items-center gap-1">
            <FiFilter className="h-4 w-4"/>
            <span>筛选</span>
          </Button>

          <Button variant="ghost" onClick={resetFilters} className="flex items-center gap-1">
            <FiRefreshCw className="h-4 w-4"/>
            <span>重置</span>
          </Button>
        </div>

        {/* 数据表格组件 */}
        <AuditLogTable
          data={data?.data?.items || []}
          isLoading={isLoading}
          onViewDetail={handleViewDetail}
        />

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

export default AuditLogList;
