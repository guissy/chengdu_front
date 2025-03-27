"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FiEdit2, FiPlus, FiTarget, FiTrash2 } from "react-icons/fi";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse, ListResponse } from '@/types/api';
import Link from "next/link";
import { Button } from "chengdu_ui";
import { DataTable } from "chengdu_ui";
import {PageHeader} from "chengdu_ui";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import client from "@/lib/api/client";
import { CBD } from "@prisma/client";
import { CBDListResponseSchema } from "@/lib/schema/location";

const cbdFormSchema = z.object({
  name: z.string().min(1, "商圈名称不能为空"),
  districtId: z.string().min(1, "请选择行政区划"),
  addr: z.string().optional(),
});


type CBDListResponse = z.infer<typeof CBDListResponseSchema>;
type CBDItem = NonNullable<CBDListResponse['data']>['list'][number];
type CbdFormValues = z.infer<typeof cbdFormSchema>;



const columnHelper = createColumnHelper<CBDItem>();

const CbdList: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCbd, setEditingCbd] = useState<CBD | null>(null);
  // const [deleteId, setDeleteId] = useState<string | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CbdFormValues>({
    resolver: zodResolver(cbdFormSchema),
  });

  // Fetch cities data
const { data: cities, isLoading: isLoadingCities } = useQuery({
    queryKey: ["cityList"],
    queryFn: async () => {
      const res = await client.GET("/api/city/list", {});
      return res.data?.data?.list || [];
    }
  });

  // Fetch districts data based on selected city
  const { data: districts, isLoading: isLoadingDistricts } = useQuery({
    queryKey: ["districtList", selectedCity],
    queryFn: async () => {
      const res = await client.POST("/api/district/list", {
        body: { parentId: selectedCity }
      });
      return res.data?.data?.list || [];
    },
    enabled: !!selectedCity,
  });

  // Fetch CBDs data based on selected district
  const {
    data: cbds,
    isLoading,
    refetch: refetchCbds,
  } = useQuery({
    queryKey: ["cbdList", selectedDistrict],
    queryFn: async () => {
      const res = await client.POST("/api/cbd/list", {
        body: { districtId: selectedDistrict }
      });
      return res.data?.data?.list || [];
    },
    enabled: !!selectedDistrict,
  });

  // Set default city when cities are loaded
  useEffect(() => {
    if (cities && cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0].id);
    }
  }, [cities, selectedCity]);

  // Reset district when city changes
  useEffect(() => {
    setSelectedDistrict("");
  }, [selectedCity]);

  // Set default district when districts are loaded
  useEffect(() => {
    if (districts && districts?.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districts[0].id);
    }
  }, [districts, selectedDistrict]);

  // Open modal for adding a new CBD
  const handleAddCbd = () => {
    setEditingCbd(null);
    reset({ districtId: selectedDistrict, name: "", addr: "" });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing CBD
  // const handleEditCbd = (cbd: CBD) => {
  //   setEditingCbd(cbd);
  //   reset({
  //     name: cbd.name,
  //     districtId: selectedDistrict,
  //     addr: String(cbd.addr) || "",
  //   });
  //   setIsModalOpen(true);
  // };

  // Open confirmation modal for deleting a CBD
  // const handleDeleteClick = (id: string) => {
  //   setDeleteId(id);
  //   setIsDeleteModalOpen(true);
  // };

  // Submit form for adding/editing a CBD
  const onSubmit = async (data: CbdFormValues) => {
    try {
      if (editingCbd) {
        // TODO: Update existing CBD
        await axios.patch(`/api/cbds/${editingCbd.id}`, data);
        toast.success("商圈更新成功");
      } else {
        // Create new CBD
        await axios.post("/api/cbds", data);
        toast.success("商圈添加成功");
      }

      setIsModalOpen(false);
      refetchCbds();
    } catch (error) {
      toast.error("操作失败，请重试");
      console.error(error);
    }
  };

  // Delete a CBD
  const handleDeleteConfirm = async () => {
    // if (!deleteId) return;
    const deleteId = 1;
    try {
      await axios.delete(`/api/cbds/${deleteId}`);
      toast.success("商圈删除成功");
      setIsDeleteModalOpen(false);
      refetchCbds();
    } catch (error) {
      toast.error("删除失败，请重试");
      console.error(error);
    }
  };

  // Find district name by ID
  // const getDistrictName = (districtId: string) => {
  //   return (
  //     districts?.find(
  //       (district: District) => district.id === districtId
  //     )?.name || ""
  //   );
  // };

  const columns = [
    columnHelper.accessor("name", {
      header: "名称",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("addr", {
      header: "地址",
      cell: (info) => {
        const addr = info.getValue();
        return (typeof addr === "string" && addr) || "暂无地址";
      },
    }),
    // columnHelper.accessor("district", {
    //   header: "所属区域",
    //   cell: (info) => info.getValue(),
    // }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">操作</div>,
      cell: (info) => (
        <div className="flex justify-end space-x-1">
          <Link
            href={`/cbd/${info.row.original.id}/parts`}
            className="btn btn-ghost btn-sm"
            title="查看小区"
            onClick={(e) => e.stopPropagation()}
          >
            <FiTarget className="h-4 w-4 text-green-500" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={<FiEdit2 className="h-4 w-4 text-blue-500" />}
            onClick={(e) => {
              e.stopPropagation();
              // Replace with your edit handler
              // handleEditCbd(info.row.original);
            }}
            title="编辑"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<FiTrash2 className="h-4 w-4 text-red-500" />}
            onClick={(e) => {
              e.stopPropagation();
              // Replace with your delete handler
              // handleDeleteClick(info.row.original.id);
            }}
            title="删除"
          />
        </div>
      ),
    }),
  ] as ColumnDef<CBDItem>[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="商圈管理"
        subtitle="管理所有商圈信息"
        action={
          <button
            className="btn btn-primary"
            onClick={handleAddCbd}
            disabled={!selectedDistrict}
          >
            <FiPlus className="mr-2" /> 添加商圈
          </button>
        }
      />
      {/* Location selection */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">位置选择</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City selection */}
            <div>
              <label className="label">
                <span className="label-text">城市</span>
              </label>
              {isLoadingCities ? (
                <div className="flex items-center h-12">
                  <div className="loading loading-spinner loading-sm"></div>
                </div>
              ) : (
                <select
                  className="select select-bordered w-full"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="" disabled>
                    选择城市
                  </option>
                  {cities?.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* District selection */}
            <div>
              <label className="label">
                <span className="label-text">行政区划</span>
              </label>
              {isLoadingDistricts ? (
                <div className="flex items-center h-12">
                  <div className="loading loading-spinner loading-sm"></div>
                </div>
              ) : !selectedCity ? (
                <select className="select select-bordered w-full" disabled>
                  <option>请先选择城市</option>
                </select>
              ) : districts?.length === 0 ? (
                <div className="alert alert-warning py-2">
                  该城市下暂无区域数据
                </div>
              ) : (
                <select
                  className="select select-bordered w-full"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="" disabled>
                    选择区域
                  </option>
                  {districts?.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>


      <DataTable<CBDItem>
        columns={columns}
        data={cbds || []}
        loading={isLoading}
      />

      {/* Add/Edit CBD Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingCbd ? "编辑商圈" : "添加商圈"}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">所属区域</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("districtId")}
                  disabled={!!editingCbd}
                >
                  <option value="" disabled>
                    选择区域
                  </option>
                  {districts?.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.districtId && (
                  <span className="text-error text-sm mt-1">
                    {errors.districtId.message}
                  </span>
                )}
              </div>

              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">商圈名称</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="输入商圈名称"
                  {...register("name")}
                />
                {errors.name && (
                  <span className="text-error text-sm mt-1">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="form-control w-full mb-6">
                <label className="label">
                  <span className="label-text">商圈地址</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="输入商圈地址（可选）"
                  {...register("addr")}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          ></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">确认删除</h3>
            <p className="py-4">
              你确定要删除这个商圈吗？此操作不可撤销，并且可能影响关联的小区和商家数据。
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                取消
              </button>
              <button className="btn btn-error" onClick={handleDeleteConfirm}>
                删除
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default CbdList;
