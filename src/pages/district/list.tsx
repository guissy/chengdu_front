import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCityCityListOptions, postDistrictListOptions } from '@/api/@tanstack/react-query.gen';
import { DistrictResponseSchema } from '@/api';


// Form schema for adding/editing districts
const districtFormSchema = z.object({
  name: z.string().min(1, '区域名称不能为空'),
  cityId: z.string().min(1, '请选择城市'),
});

type DistrictFormValues = z.infer<typeof districtFormSchema>;

const DistrictList: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<DistrictResponseSchema | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // React Hook Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
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
    refetch: refetchDistricts,
  } = useQuery({
    ...postDistrictListOptions({
      body: { parentId: selectedCity }
    }),
    enabled: !!selectedCity
  });
  const districts = useMemo(() => districtList?.data?.list, [districtList]);

  // Set default city when cities are loaded
  useEffect(() => {
    if (cities && cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0].id);
    }
  }, [cities, selectedCity]);

  // Open modal for adding a new district
  const handleAddDistrict = () => {
    setEditingDistrict(null);
    reset({ cityId: selectedCity, name: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing district
  const handleEditDistrict = (district: DistrictResponseSchema) => {
    setEditingDistrict(district);
    reset({
      name: district.name,
      cityId: selectedCity,
    });
    setIsModalOpen(true);
  };

  // Open confirmation modal for deleting a district
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Submit form for adding/editing a district
  const onSubmit = async (data: DistrictFormValues) => {
    try {
      if (editingDistrict) {
        // Update existing district
        await axios.patch(`/api/districts/${editingDistrict.id}`, data);
        toast.success('区域更新成功');
      } else {
        // Create new district
        await axios.post('/api/districts', data);
        toast.success('区域添加成功');
      }

      setIsModalOpen(false);
      refetchDistricts();
    } catch (error) {
      toast.error('操作失败，请重试');
      console.error(error);
    }
  };

  // Delete a district
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await axios.delete(`/api/districts/${deleteId}`);
      toast.success('区域删除成功');
      setIsDeleteModalOpen(false);
      refetchDistricts();
    } catch (error) {
      toast.error('删除失败，请重试');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">行政区划管理</h1>
        <button
          className="btn btn-primary"
          onClick={handleAddDistrict}
        >
          <FiPlus className="mr-2" /> 添加区域
        </button>
      </div>

      {/* City selection */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">选择城市</h2>

          {isLoadingCities ? (
            <div className="flex justify-center">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : (
            <select
              className="select select-bordered w-full max-w-xs"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="" disabled>选择城市</option>
              {cities?.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Districts list */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">区域列表</h2>

          {isLoadingDistricts ? (
            <div className="flex justify-center py-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : !selectedCity ? (
            <div className="alert alert-info">请先选择一个城市</div>
          ) : districts?.length === 0 ? (
            <div className="alert alert-warning">该城市下暂无区域数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>ID</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {districts?.map((district) => (
                    <tr key={district.id}>
                      <td className="font-medium">{district.name}</td>
                      <td className="text-gray-500 text-sm">{district.id}</td>
                      <td className="text-right">
                        <button
                          className="btn btn-ghost btn-sm mr-1"
                          onClick={() => handleEditDistrict(district)}
                        >
                          <FiEdit2 className="text-blue-500" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteClick(district.id)}
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

      {/* Add/Edit District Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingDistrict ? '编辑区域' : '添加区域'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">所属城市</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register('cityId')}
                  disabled={!!editingDistrict}
                >
                  <option value="" disabled>选择城市</option>
                  {cities?.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                {errors.cityId && (
                  <span className="text-error text-sm mt-1">{errors.cityId.message}</span>
                )}
              </div>

              <div className="form-control w-full mb-6">
                <label className="label">
                  <span className="label-text">区域名称</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="输入区域名称"
                  {...register('name')}
                />
                {errors.name && (
                  <span className="text-error text-sm mt-1">{errors.name.message}</span>
                )}
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
            <p className="py-4">你确定要删除这个区域吗？此操作不可撤销。</p>
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

export default DistrictList;
