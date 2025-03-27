import { create } from 'zustand';
import { z } from 'zod';
import { ShopListResponseSchema } from '@/lib/schema/shop';

type Shop = NonNullable<z.infer<typeof ShopListResponseSchema>['data']>['list'][number];



interface ShopStore {
  // 对话框状态
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // 当前选中的店铺
  currentShop: Shop | null;

  // 打开对话框方法
  openAddDialog: () => void;
  openEditDialog: (shop: Shop) => void;
  openDeleteDialog: (shop: Shop) => void;

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
