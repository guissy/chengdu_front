import { create } from 'zustand';
import { SpaceResponseSchema } from '@/service';
interface SpaceFormData {
  shopId: string;
  type: string;
  setting: Record<string, unknown>;
  count: number;
  state: string;
  price_factor: number;
  tag?: string;
  site?: string;
  stability?: string;
  photo?: string[];
  description?: string;
  design_attention?: string;
  construction_attention?: string;
}

interface SpaceState {
  // 表单相关状态
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  currentSpace: SpaceResponseSchema | null;
  formData: SpaceFormData;

  // 操作方法
  openAddDialog: () => void;
  closeAddDialog: () => void;
  openEditDialog: (space: SpaceResponseSchema) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (space: SpaceResponseSchema) => void;
  closeDeleteDialog: () => void;
  updateFormData: (data: Partial<SpaceFormData>) => void;
  resetFormData: () => void;
}

// 默认表单数据
const defaultFormData: SpaceFormData = {
  shopId: '',
  type: '',
  setting: {},
  count: 1,
  state: 'ENABLED',
  price_factor: 1.0,
};

export const useSpaceStore = create<SpaceState>((set) => ({
  // 表单相关状态
  isAddDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  currentSpace: null,
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
  openEditDialog: (space) => {
    set({
      isEditDialogOpen: true,
      currentSpace: space,
      formData: {
        shopId: space.shopId,
        type: space.type,
        setting: space.setting || {},
        count: space.count,
        state: space.state,
        price_factor: space.price_factor || 1.0,
        tag: space.tag,
        site: space.site,
        stability: space.stability,
        photo: space.photo,
        description: space.description,
        design_attention: space.design_attention,
        construction_attention: space.construction_attention,
      },
    });
  },
  closeEditDialog: () => {
    set({
      isEditDialogOpen: false,
      currentSpace: null,
      formData: { ...defaultFormData },
    });
  },
  openDeleteDialog: (space) => {
    set({
      isDeleteDialogOpen: true,
      currentSpace: space,
    });
  },
  closeDeleteDialog: () => {
    set({
      isDeleteDialogOpen: false,
      currentSpace: null,
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
