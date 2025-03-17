import { create } from 'zustand';
import { ShopResponseSchema } from '@/service';


interface ShopStore {
  // 对话框状态
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // 当前选中的店铺
  currentShop: ShopResponseSchema | null;

  // 打开对话框方法
  openAddDialog: () => void;
  openEditDialog: (shop: ShopResponseSchema) => void;
  openDeleteDialog: (shop: ShopResponseSchema) => void;

  // 关闭对话框方法
  closeAddDialog: () => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;
}

// 店铺类型映射
export const shopTypeMap = {
  RESTAURANT: '餐饮',
  LIGHT_FOOD: '轻食',
  TEA_HOUSE: '茶楼',
  TEA_COFFEE: '茶饮/咖啡',
  COFFEE_SHOP: '咖啡馆',
  HOTEL: '酒店',
} as const;

export const useShopStore = create<ShopStore>((set) => ({
  // 初始状态
  isAddDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  currentShop: null,

  // 打开对话框
  openAddDialog: () => set({ isAddDialogOpen: true }),
  openEditDialog: (shop) => set({ isEditDialogOpen: true, currentShop: shop }),
  openDeleteDialog: (shop) => set({ isDeleteDialogOpen: true, currentShop: shop }),

  // 关闭对话框
  closeAddDialog: () => set({ isAddDialogOpen: false }),
  closeEditDialog: () => set({ isEditDialogOpen: false, currentShop: null }),
  closeDeleteDialog: () => set({ isDeleteDialogOpen: false, currentShop: null }),
}));
