import { create } from 'zustand';
import { z } from 'zod';
import { PositionListResponseSchema } from '@/lib/schema/position';

type Position = NonNullable<z.infer<typeof PositionListResponseSchema>['data']>['list'][number];

interface PositionFormData {
  cbdId: string;
  partId: string;
  no: string;
}

interface PositionState {
  // 列表页相关状态
  filterPartId: string;
  setFilterPartId: (cbdId: string) => void;

  // 详情页相关状态
  currentPosition: Position | null;
  setCurrentPosition: (position: Position | null) => void;

  // 表单相关状态
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isBindShopDialogOpen: boolean;
  formData: PositionFormData;

  // 操作方法
  openAddDialog: () => void;
  closeAddDialog: () => void;
  openEditDialog: (position: Position) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (position: Position) => void;
  closeDeleteDialog: () => void;
  openBindShopDialog: (position: Position) => void;
  closeBindShopDialog: () => void;
  updateFormData: (data: Partial<PositionFormData>) => void;
  resetFormData: () => void;
}

// 默认表单数据
const defaultFormData: PositionFormData = {
  cbdId: '',
  partId: '',
  no: '',
};

export const usePositionStore = create<PositionState>((set) => ({
  // 列表页相关状态
  filterPartId: '',
  setFilterPartId: (partId) => set({ filterPartId: partId }),

  // 详情页相关状态
  currentPosition: null,
  setCurrentPosition: (position) => set({ currentPosition: position }),

  // 表单相关状态
  isAddDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  isBindShopDialogOpen: false,
  formData: { ...defaultFormData },

  // 操作方法
  openAddDialog: () => {
    set({
      isAddDialogOpen: true,
      formData: { ...defaultFormData },
    });
  },
  closeAddDialog: () => {
    set({
      isAddDialogOpen: false,
      formData: { ...defaultFormData },
    });
  },
  openEditDialog: (position) => {
    set({
      isEditDialogOpen: true,
      currentPosition: position,
      formData: {
        cbdId: '', // 编辑时通常不能更改所属商圈
        partId: '', // 编辑时通常不能更改所属小区
        no: position.position_no,
      },
    });
  },
  closeEditDialog: () => {
    set({
      isEditDialogOpen: false,
      formData: { ...defaultFormData },
    });
  },
  openDeleteDialog: (position) => {
    set({
      isDeleteDialogOpen: true,
      currentPosition: position,
    });
  },
  closeDeleteDialog: () => {
    set({
      isDeleteDialogOpen: false,
      currentPosition: null,
    });
  },
  openBindShopDialog: (position) => {
    set({
      isBindShopDialogOpen: true,
      currentPosition: position,
    });
  },
  closeBindShopDialog: () => {
    set({
      isBindShopDialogOpen: false,
      currentPosition: null,
    });
  },
  updateFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },
  resetFormData: () => {
    set({
      formData: { ...defaultFormData },
    });
  },
}));
