import { create } from 'zustand';
import { PartListResponseSchema } from '@/lib/schema/part';
import { z } from 'zod';

type Part = NonNullable<z.infer<typeof PartListResponseSchema>['data']>['list'][number];

interface PartFormData {
  cbdId: string;
  name: string;
  sequence: number;
}

interface PartState {
  // 列表页相关状态
  filterCbdId: string;
  setFilterCbdId: (cbdId: string) => void;

  // 详情页相关状态
  currentPart: Part | null;
  setCurrentPart: (part: Part | null) => void;

  // 表单相关状态
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  formData: PartFormData;

  // 操作方法
  openAddDialog: () => void;
  closeAddDialog: () => void;
  openEditDialog: (part: Part) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (part: Part) => void;
  closeDeleteDialog: () => void;
  updateFormData: (data: Partial<PartFormData>) => void;
  resetFormData: () => void;
}

// 默认表单数据
const defaultFormData: PartFormData = {
  cbdId: '',
  name: '',
  sequence: 0,
};

export const usePartStore = create<PartState>((set) => ({
  // 列表页相关状态
  filterCbdId: '',
  setFilterCbdId: (cbdId) => set({ filterCbdId: cbdId }),

  // 详情页相关状态
  currentPart: null,
  setCurrentPart: (part) => set({ currentPart: part }),

  // 表单相关状态
  isAddDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
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
  openEditDialog: (part) => {
    set({
      isEditDialogOpen: true,
      currentPart: part,
      formData: {
        cbdId: '', // 编辑时通常不能更改所属商圈
        name: part.name,
        sequence: part.sequence,
      },
    });
  },
  closeEditDialog: () => {
    set({
      isEditDialogOpen: false,
      formData: { ...defaultFormData },
    });
  },
  openDeleteDialog: (part) => {
    set({
      isDeleteDialogOpen: true,
      currentPart: part,
    });
  },
  closeDeleteDialog: () => {
    set({
      isDeleteDialogOpen: false,
      currentPart: null,
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
