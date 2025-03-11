import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FiEdit2, FiPlus, FiTrash2, FiTarget } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CbdResponseSchema, CityResponseSchema, DistrictResponseSchema } from '@/api';
import {
  getCityCityListOptions,
  postCbdListOptions,
  postDistrictListOptions
} from '@/api/@tanstack/react-query.gen.ts';


// Form schema for adding/editing CBDs
const cbdFormSchema = z.object({
  name: z.string().min(1, '商圈名称不能为空'),
  districtId: z.string().min(1, '请选择行政区划'),
  addr: z.string().optional(),
});

type CbdFormValues = z.infer<typeof cbdFormSchema>;

const CbdList: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCbd, setEditingCbd] = useState<CbdResponseSchema | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // React Hook Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CbdFormValues>({
    resolver: zodResolver(cbdFormSchema),
  });

  // Fetch cities data
  const { data, isLoading: isLoadingCities } = useQuery({
    ...getCityCityListOptions()
  });
  const cities = useMemo(() => data?.data?.list, [data]);

  // Fetch districts data based on selected city
  const {
    data: districtList,
    isLoading: isLoadingDistricts,
  } = useQuery({
    ...postDistrictListOptions({
      body: { parentId: selectedCity }
    }),
    enabled: !!selectedCity
  });
  const districts = useMemo(() => districtList?.data?.list, [districtList]);

  // Fetch CBDs data based on selected district
  const {
    data: cbdsList,
    isLoading: isLoadingCbds,
    refetch: refetchCbds
  } = useQuery({
    ...postCbdListOptions({
      body: { districtId: selectedDistrict }
    }),
    enabled: !!selectedDistrict,
  });

  const cbds = useMemo(() => cbdsList?.data?.list, [cbdsList]);

  // Set default city when cities are loaded
  useEffect(() => {
    if (cities && cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0].id);
    }
  }, [cities, selectedCity]);

  // Reset district when city changes
  useEffect(() => {
    setSelectedDistrict('');
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
    reset({ districtId: selectedDistrict, name: '', addr: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing CBD
  const handleEditCbd = (cbd: CbdResponseSchema) => {
    setEditingCbd(cbd);
    reset({
      name: cbd.name,
      districtId: selectedDistrict,
      addr: String(cbd.addr) || '',
    });
    setIsModalOpen(true);
  };

  // Open confirmation modal for deleting a CBD
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Submit form for adding/editing a CBD
  const onSubmit = async (data: CbdFormValues) => {
    try {
      if (editingCbd) {
        // Update existing CBD
        await axios.patch(`/api/cbds/${editingCbd.id}`, data);
        toast.success('商圈更新成功');
      } else {
        // Create new CBD
        await axios.post('/api/cbds', data);
        toast.success('商圈添加成功');
      }

      setIsModalOpen(false);
      refetchCbds();
    } catch (error) {
      toast.error('操作失败，请重试');
      console.error(error);
    }
  };

  // Delete a CBD
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await axios.delete(`/api/cbds/${deleteId}`);
      toast.success('商圈删除成功');
      setIsDeleteModalOpen(false);
      refetchCbds();
    } catch (error) {
      toast.error('删除失败，请重试');
      console.error(error);
    }
  };

  // // Find city name by ID
  // const getCityName = (cityId: string) => {
  //   return cities?.find(city => city.id === cityId)?.name || '';
  // };

  // Find district name by ID
  const getDistrictName = (districtId: string) => {
    return districts?.find((district: DistrictResponseSchema) => district.id === districtId)?.name || '';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">商圈管理</h1>
        <button
          className="btn btn-primary"
          onClick={handleAddCbd}
          disabled={!selectedDistrict}
        >
          <FiPlus className="mr-2" /> 添加商圈
        </button>
      </div>

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
                  <option value="" disabled>选择城市</option>
                  {cities?.map((city: CityResponseSchema) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
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
                <div className="alert alert-warning py-2">该城市下暂无区域数据</div>
              ) : (
                <select
                  className="select select-bordered w-full"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="" disabled>选择区域</option>
                  {districts?.map((district: DistrictResponseSchema) => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CBDs list */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">商圈列表</h2>

          {isLoadingCbds ? (
            <div className="flex justify-center py-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : !selectedDistrict ? (
            <div className="alert alert-info">请先选择行政区划</div>
          ) : cbds?.length === 0 ? (
            <div className="alert alert-warning">该区域下暂无商圈数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>地址</th>
                    <th>所属区域</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {cbds?.map((cbd) => (
                    <tr key={cbd.id}>
                      <td className="font-medium">{cbd.name}</td>
                      <td>{typeof cbd.addr === 'string' && cbd.addr || '暂无地址'}</td>
                      <td>{getDistrictName(selectedDistrict)}</td>
                      <td className="text-right">
                        <Link
                          to={`/cbd/${cbd.id}/parts`}
                          className="btn btn-ghost btn-sm mr-1"
                          title="查看分区"
                        >
                          <FiTarget className="text-green-500" />
                        </Link>
                        <button
                          className="btn btn-ghost btn-sm mr-1"
                          onClick={() => handleEditCbd(cbd)}
                          title="编辑"
                        >
                          <FiEdit2 className="text-blue-500" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteClick(cbd.id)}
                          title="删除"
                        >
                          <FiTrash2 className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit CBD Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingCbd ? '编辑商圈' : '添加商圈'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">所属区域</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register('districtId')}
                  disabled={!!editingCbd}
                >
                  <option value="" disabled>选择区域</option>
                  {districts?.map((district) => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
                {errors.districtId && (
                  <span className="text-error text-sm mt-1">{errors.districtId.message}</span>
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
                  {...register('name')}
                />
                {errors.name && (
                  <span className="text-error text-sm mt-1">{errors.name.message}</span>
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
                  {...register('addr')}
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
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">确认删除</h3>
            <p className="py-4">你确定要删除这个商圈吗？此操作不可撤销，并且可能影响关联的分区和店铺数据。</p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                取消
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteConfirm}
              >
                删除
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
};

export default CbdList;
