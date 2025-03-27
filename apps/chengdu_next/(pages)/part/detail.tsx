"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {PageHeader} from "chengdu_ui";
import { Button } from "chengdu_ui";
import { useQuery } from '@tanstack/react-query';
import DeletePartDialog from '@/features/part/components/delete-part-dialog';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { usePartStore } from '@/features/part/part-store';
import { FiArrowLeft, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import {DataTable} from "chengdu_ui";
import EditPartDialog from '@/features/part/components/edit-part-dialog';
import client from "@/lib/api/client";
import { PartListResponseSchema } from '@/lib/schema/part';
import { z } from 'zod';
import { PositionListResponseSchema } from '@/lib/schema/position';

type Position = NonNullable<z.infer<typeof PositionListResponseSchema>['data']>['list'][number];
type Part = NonNullable<z.infer<typeof PartListResponseSchema>['data']>['list'][number];
interface PartDetailProps {
  params: {
    id: string;
  };
}
// 定义铺位表格列
const columnHelper = createColumnHelper<Position>();

const PartDetail = ({ params }: PartDetailProps) => {
  const router = useRouter();
  const { openEditDialog, openDeleteDialog, setCurrentPart } = usePartStore();
  const [part, setPart] = useState<Part | null>(null);

  const { data: partData, isLoading: isLoadingPart } = useQuery({
    queryKey: ["part", params.id],
    queryFn: async () => {
      const res = await client.GET(`/api/part/{id}`, {
        params: {
          path: {
            id: params.id
          }
        }
      });
      return res.data;
    },
    enabled:!!params.id,
  });
  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ["positionList", params.id],
    queryFn: async () => {
      const res = await client.POST("/api/position/list", {
        body: {
          partId: params.id
        }
      });
      return res.data?.data?.list! as unknown as Position[] || [];
    },
    enabled: !!params.id,
  });
  // 更新本地state和store中的小区数据
  useEffect(() => {
    if (partData) {
      setPart(partData as unknown as Part);
      setCurrentPart(partData as unknown as Part);
    }
  }, [partData, setCurrentPart]);

  // 处理返回按钮点击
  const handleBack = () => {
    router.push('/part');
  };

  // 处理编辑按钮点击
  const handleEdit = () => {
    if (part) {
      openEditDialog(part);
    }
  };

  // 处理删除按钮点击
  const handleDelete = () => {
    if (part) {
      openDeleteDialog(part);
    }
  };

  // 处理铺位行点击
  const handlePositionClick = (position: Position) => {
    router.push(`/position/${position.id}`);
  };

  // 铺位表格列定义
  const columns = [
    columnHelper.accessor('position_no', {
      header: '铺位编号',
      cell: (info) => info.getValue(),
    }),
    // columnHelper.accessor('shop_no', {
    //   header: '商家编号',
    //   cell: (info) => info.getValue() || '-',
    // }),
    columnHelper.accessor('total_space', {
      header: '广告位总数',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('put_space', {
      header: '已投放广告位',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('verified', {
      header: '认证状态',
      cell: (info) => (
        <div className="badge badge-sm">
          {info.getValue() ? '已认证' : '未认证'}
              </div>
      ),
    }),
    columnHelper.accessor('displayed', {
      header: '展示状态',
      cell: (info) => (
        <div className={`badge badge-sm ${info.getValue() ? 'badge-success' : 'badge-ghost'}`}>
          {info.getValue() ? '展示中' : '已隐藏'}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '操作',
      cell: (info) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<FiEdit2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/position/${info.row.original.id}`);
            }}
          >
            详情
          </Button>
              </div>
      ),
    }),
  ] as ColumnDef<Position>[];

  // 加载中状态
  if (isLoadingPart) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
              </div>
    );
  }

  // 小区不存在
  if (!part) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">小区不存在</h2>
        <p>未找到ID为 {params.id} 的小区</p>
        <Button
          variant="primary"
          icon={<FiArrowLeft className="h-5 w-5" />}
          onClick={handleBack}
        >
          返回小区列表
        </Button>
              </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`小区详情: ${part.name}`}
        subtitle={`排序值: ${part.sequence} | 广告位总数: ${part.total_space}`}
        action={
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              icon={<FiArrowLeft className="h-5 w-5" />}
              onClick={handleBack}
            >
              返回
            </Button>
            <Button
              variant="primary"
              icon={<FiEdit2 className="h-5 w-5" />}
              onClick={handleEdit}
            >
              编辑
            </Button>
            <Button
              variant="error"
              icon={<FiTrash2 className="h-5 w-5" />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </div>
        }
      />

      <div className="mt-6 rounded-lg bg-base-100 p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">铺位列表</h3>
          <Link href={`/position?partId=${params.id}`}>
            <Button
              variant="primary"
              icon={<FiPlus className="h-5 w-5" />}
            >
              新增铺位
            </Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={positionsData || []}
          loading={isLoadingPositions}
          onRowClick={handlePositionClick}
        />
      </div>

      {/* 对话框组件 */}
      <EditPartDialog />
      <DeletePartDialog />
    </div>
  );
};

export default PartDetail;
