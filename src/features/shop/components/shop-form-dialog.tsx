import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { shopTypeMap, useShopStore } from '@/features/shop-store';
import FormDialog from '@/components/ui/form-dialog';
import {
  postShopAddMutation,
  postShopUpdateMutation,
  getShopListUnbindQueryKey,
  getShopByIdQueryKey,
  getShopListQueryKey
} from '@/service/@tanstack/react-query.gen.ts';
import { PostShopAddData, PostShopUpdateData, ShopResponseSchema } from '@/service/types.gen';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ShopFormDialogProps {
  mode: 'add' | 'edit';
}

const schema = z.object({
  id: z.string().optional(),
  type: z.string().describe('类型，1-餐饮 2-轻食 3-茶楼 4-茶饮/咖啡 5-咖啡馆 6-酒店'),
  type_tag: z.string().optional().describe('品类标签'),
  business_type: z.string().describe('商业类型，1-独立自营店 2-连锁自营店 3-连锁加盟店'),
  trademark: z.string().min(1).describe('字号'),
  branch: z.string().optional().describe('分店'),
  location: z.tuple([z.number(), z.number()]).describe('坐标，经纬度'),
  verified: z.boolean().default(false).describe('是否认证'),
  duration: z.string().default("LESS_THAN_ONE").describe('经营时长，1-一年内新店 2-1~2年 3-2~5年 4-五年以上'),
  consume_display: z.boolean().default(true).describe('是否展示消费数据'),
  average_expense: z.tuple([z.number().int(), z.number().int()]).describe('人均消费最低到最高值，单位(分)'),
  sex: z.string().default("ALL").describe('性别，1-不限 2-男 3-女'),
  age: z.tuple([z.number().int(), z.number().int()]).describe('年龄段最低到最高值'),
  id_tag: z.string().optional().describe('身份标签'),
  sign_photo: z.string().optional().describe('标识图片'),
  verify_photo: z.array(z.string()).optional().describe('认证图片'),
  environment_photo: z.array(z.string()).optional().describe('外景图片'),
  building_photo: z.array(z.string()).optional().describe('内景图片'),
  brand_photo: z.array(z.string()).optional().describe('品牌营销图片'),
  contact_name: z.string().optional().describe('联系人姓名'),
  contact_phone: z.string().optional().describe('联系人电话'),
  contact_type: z.string().describe('联系人类型，1-老板 2-店长 3-店员 4-总店管理人员'),
  total_area: z.number().optional().describe('面积，单位(平方米)'),
  customer_area: z.number().optional().describe('客区面积'),
  clerk_count: z.number().optional().describe('店员人数'),
  business_hours: z.tuple([z.number().int(), z.number().int()]).describe('营业时间'),
  rest_days: z.array(z.string()).describe('休息日，1-周一 2-周二 3-周三 4-周四 5-周五 6-周六 7-周日 8-按需'),
  volume_peak: z.array(z.string()).describe('客流高峰，1-早餐 2-午餐 3-晚餐 4-宵夜 5-上午 6-下午 7-晚上 8-深夜'),
  season: z.array(z.string()).describe('1-春 2-夏 3-秋 4-冬 5-节假日 6-工作日 7-非工作日'),
  shop_description: z.string().optional().describe('商家简介'),
  put_description: z.string().optional().describe('投放简介'),
  displayed: z.boolean().default(true).describe('是否开放'),
  price_base: z.number().int().describe('价格基数（单位：分）'),
  classify_tag: z.string().optional().describe('分类标签'),
  remark: z.string().optional().describe('备注'),
});

type FormValues = z.infer<typeof schema>;

const ShopFormDialog = ({ mode }: ShopFormDialogProps) => {
  const {
    isAddDialogOpen,
    isEditDialogOpen,
    closeAddDialog,
    closeEditDialog,
    currentShop
  } = useShopStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const isOpen = mode === 'add' ? isAddDialogOpen : isEditDialogOpen;
  const onClose = mode === 'add' ? closeAddDialog : closeEditDialog;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: '',
      type: 'RESTAURANT',
      type_tag: undefined,
      business_type: "INDEPENDENT",
      trademark: '',
      branch: undefined,
      location: [0, 0],
      verified: false,
      duration: "LESS_THAN_ONE",
      consume_display: true,
      average_expense: [0, 0],
      sex: "ALL",
      age: [0, 0],
      id_tag: undefined,
      sign_photo: undefined,
      verify_photo: [],
      environment_photo: [],
      building_photo: [],
      brand_photo: [],
      contact_name: undefined,
      contact_phone: undefined,
      contact_type: undefined,
      total_area: 10,
      customer_area: 6,
      clerk_count: 10,
      business_hours: [0, 0],
      rest_days: [],
      volume_peak: [],
      season: [],
      shop_description: undefined,
      put_description: undefined,
      displayed: true,
      price_base: 0,
      classify_tag: undefined,
      remark: undefined,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && currentShop) {
      const shop = currentShop as unknown as ShopResponseSchema;
      form.reset({
        id: shop.shopId,
        type: shop.type,
        type_tag: shop.type_tag?.toString() || undefined,
        business_type: shop.business_type,
        trademark: shop.trademark,
        branch: shop.branch?.toString() || undefined,
        location: [0, 0],
        verified: shop.verified,
        duration: shop.duration,
        consume_display: true,
        average_expense: [0, 0],
        sex: shop.sex,
        age: [0, 0],
        id_tag: undefined,
        sign_photo: undefined,
        verify_photo: shop.photo || [],
        environment_photo: [],
        building_photo: [],
        brand_photo: [],
        contact_name: undefined,
        contact_phone: undefined,
        contact_type: shop.contact_type,
        total_area: shop.total_area as number,
        customer_area: shop.customer_area as number,
        clerk_count: shop.clerk_count as number,
        business_hours: Array.isArray(shop.business_hours) && shop.business_hours.length >= 2
          ? [shop.business_hours[0], shop.business_hours[1]]
          : [0, 0],
        rest_days: [],
        volume_peak: [],
        season: [],
        shop_description: shop.shop_description?.toString() || undefined,
        put_description: shop.put_description?.toString() || undefined,
        displayed: shop.displayed,
        price_base: shop.price_base,
        classify_tag: shop.classify_tag?.toString() || undefined,
        remark: shop.remark?.toString() || undefined,
      });
    }
  }, [currentShop, form, mode]);

  const addShopMutation = useMutation({
    ...postShopAddMutation(),
  });

  const updateShopMutation = useMutation({
    ...postShopUpdateMutation(),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      if (mode === 'add') {
        await addShopMutation.mutateAsync({
          body: {
            ...data,
            cbdId: "cbd-001", partId: "part-001"
          } as PostShopAddData['body'],
        });
        toast.success('商家添加成功');
        form.reset();
      } else {
        await updateShopMutation.mutateAsync({
          body: {
            ...currentShop,
            ...data
          } as PostShopUpdateData['body']
        });
        queryClient.invalidateQueries({
          queryKey: getShopByIdQueryKey({ path: { id: data.id! } }),
        });
        toast.success('商家更新成功');
      }
      queryClient.invalidateQueries({
        queryKey: getShopListUnbindQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getShopListQueryKey(),
      });
      onClose();
    } catch (error) {
      toast.error(mode === 'add' ? '添加商家失败' : '更新商家失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || (mode === 'edit' && !currentShop)) return null;

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? '新增商家' : '编辑商家'}
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      {mode === 'edit' && (
        <Input
          label="商家ID"
          placeholder="请输入商家ID"
          error={form.formState.errors.id?.message}
          fullWidth
          {...form.register('id')}
        />
      )}

      <Select
        label="商家类型"
        options={Object.entries(shopTypeMap).map(([value, label]) => ({
          value,
          label,
        }))}
        error={form.formState.errors.type?.message}
        fullWidth
        {...form.register('type')}
      />

      <Input
        label="品类标签"
        placeholder="请输入品类标签"
        error={form.formState.errors.type_tag?.message}
        fullWidth
        {...form.register('type_tag')}
      />

      <Select
        label="商业类型"
        options={[
          { value: "INDEPENDENT", label: '独立自营店' },
          { value: "CHAIN_DIRECT", label: '连锁自营店' },
          { value: "CHAIN_FRANCHISE", label: '连锁加盟店' },
        ]}
        error={form.formState.errors.business_type?.message}
        fullWidth
        {...form.register('business_type')}
      />

      <Input
        label="字号"
        placeholder="请输入字号"
        error={form.formState.errors.trademark?.message}
        fullWidth
        {...form.register('trademark')}
      />

      <Input
        label="分店"
        placeholder="请输入分店名称"
        error={form.formState.errors.branch?.message}
        fullWidth
        {...form.register('branch')}
      />

      <Input
        label="经度"
        type="number"
        placeholder="请输入经度"
        error={form.formState.errors.location?.[0]?.message}
        fullWidth
        {...form.register('location.0', { valueAsNumber: true })}
      />

      <Input
        label="纬度"
        type="number"
        placeholder="请输入纬度"
        error={form.formState.errors.location?.[1]?.message}
        fullWidth
        {...form.register('location.1', { valueAsNumber: true })}
      />

      <div className="flex items-center space-x-2">
        <Switch
          {...form.register('verified')}
        />
        <Label htmlFor="airplane-mode">是否认证</Label>
      </div>

      <Select
        label="经营时长"
        options={[
          { value: 1, label: '一年内新店' },
          { value: 2, label: '1~2年' },
          { value: 3, label: '2~5年' },
          { value: 4, label: '五年以上' },
        ]}
        error={form.formState.errors.duration?.message}
        fullWidth
        {...form.register('duration')}
      />

      <Select
        label="是否展示消费数据"
        options={[
          { value: "true", label: '是' },
          { value: "false", label: '否' },
        ]}
        error={form.formState.errors.consume_display?.message}
        fullWidth
        {...form.register('consume_display')}
      />

      <Input
        label="最低消费"
        type="number"
        placeholder="请输入最低消费（分）"
        error={form.formState.errors.average_expense?.[0]?.message}
        fullWidth
        {...form.register('average_expense.0', { valueAsNumber: true })}
      />

      <Input
        label="最高消费"
        type="number"
        placeholder="请输入最高消费（分）"
        error={form.formState.errors.average_expense?.[1]?.message}
        fullWidth
        {...form.register('average_expense.1', { valueAsNumber: true })}
      />

      <Select
        label="性别"
        options={[
          { value: 1, label: '不限' },
          { value: 2, label: '男' },
          { value: 3, label: '女' },
        ]}
        error={form.formState.errors.sex?.message}
        fullWidth
        {...form.register('sex')}
      />

      <Input
        label="最小年龄"
        type="number"
        placeholder="请输入最小年龄"
        error={form.formState.errors.age?.[0]?.message}
        fullWidth
        {...form.register('age.0', { valueAsNumber: true })}
      />

      <Input
        label="最大年龄"
        type="number"
        placeholder="请输入最大年龄"
        error={form.formState.errors.age?.[1]?.message}
        fullWidth
        {...form.register('age.1', { valueAsNumber: true })}
      />

      <Input
        label="身份标签"
        placeholder="请输入身份标签"
        error={form.formState.errors.id_tag?.message}
        fullWidth
        {...form.register('id_tag')}
      />

      <Input
        label="标识图片"
        placeholder="请输入标识图片URL"
        error={form.formState.errors.sign_photo?.message}
        fullWidth
        {...form.register('sign_photo')}
      />

      <Input
        label="认证图片"
        placeholder="请输入认证图片URL，多个用逗号分隔"
        error={form.formState.errors.verify_photo?.message}
        fullWidth
        {...form.register('verify_photo')}
      />

      <Input
        label="外景图片"
        placeholder="请输入外景图片URL，多个用逗号分隔"
        error={form.formState.errors.environment_photo?.message}
        fullWidth
        {...form.register('environment_photo')}
      />

      <Input
        label="内景图片"
        placeholder="请输入内景图片URL，多个用逗号分隔"
        error={form.formState.errors.building_photo?.message}
        fullWidth
        {...form.register('building_photo')}
      />

      <Input
        label="品牌营销图片"
        placeholder="请输入品牌营销图片URL，多个用逗号分隔"
        error={form.formState.errors.brand_photo?.message}
        fullWidth
        {...form.register('brand_photo')}
      />

      <Input
        label="联系人姓名"
        placeholder="请输入联系人姓名"
        error={form.formState.errors.contact_name?.message}
        fullWidth
        {...form.register('contact_name')}
      />

      <Input
        label="联系人电话"
        placeholder="请输入联系人电话"
        error={form.formState.errors.contact_phone?.message}
        fullWidth
        {...form.register('contact_phone')}
      />

      <Select
        label="联系人类型"
        options={[
          { value: "OWNER", label: '老板' },
          { value: "MANAGER", label: '店长' },
          { value: "STAFF", label: '店员' },
          { value: "HEADQUARTERS", label: '总店管理人员' },
        ]}
        error={form.formState.errors.contact_type?.message}
        fullWidth
        {...form.register('contact_type')}
      />

      <Input
        label="面积"
        type="number"
        placeholder="请输入面积（平方米）"
        error={form.formState.errors.total_area?.message}
        fullWidth
        {...form.register('total_area', { valueAsNumber: true })}
      />

      <Input
        label="客区面积"
        type="number"
        placeholder="请输入客区面积（平方米）"
        error={form.formState.errors.customer_area?.message}
        fullWidth
        {...form.register('customer_area', { valueAsNumber: true })}
      />

      <Input
        label="店员人数"
        type="number"
        placeholder="请输入店员人数"
        error={form.formState.errors.clerk_count?.message}
        fullWidth
        {...form.register('clerk_count', { valueAsNumber: true })}
      />

      <Input
        label="营业开始时间"
        type="number"
        placeholder="请输入营业开始时间（24小时制）"
        error={form.formState.errors.business_hours?.[0]?.message}
        fullWidth
        {...form.register('business_hours.0', { valueAsNumber: true })}
      />

      <Input
        label="营业结束时间"
        type="number"
        placeholder="请输入营业结束时间（24小时制）"
        error={form.formState.errors.business_hours?.[1]?.message}
        fullWidth
        {...form.register('business_hours.1', { valueAsNumber: true })}
      />

      <Select
        label="休息日"
        options={[
          { value: 1, label: '周一' },
          { value: 2, label: '周二' },
          { value: 3, label: '周三' },
          { value: 4, label: '周四' },
          { value: 5, label: '周五' },
          { value: 6, label: '周六' },
          { value: 7, label: '周日' },
          { value: 8, label: '按需' },
        ]}
        error={form.formState.errors.rest_days?.message}
        fullWidth
        multiple
        {...form.register('rest_days')}
      />

      <Select
        label="客流高峰"
        options={[
          { value: 1, label: '早餐' },
          { value: 2, label: '午餐' },
          { value: 3, label: '晚餐' },
          { value: 4, label: '宵夜' },
          { value: 5, label: '上午' },
          { value: 6, label: '下午' },
          { value: 7, label: '晚上' },
          { value: 8, label: '深夜' },
        ]}
        error={form.formState.errors.volume_peak?.message}
        fullWidth
        multiple
        {...form.register('volume_peak')}
      />

      <Select
        label="季节"
        options={[
          { value: 1, label: '春' },
          { value: 2, label: '夏' },
          { value: 3, label: '秋' },
          { value: 4, label: '冬' },
          { value: 5, label: '节假日' },
          { value: 6, label: '工作日' },
          { value: 7, label: '非工作日' },
        ]}
        error={form.formState.errors.season?.message}
        fullWidth
        multiple
        {...form.register('season')}
      />

      <textarea
        className="w-full p-2 border rounded"
        placeholder="请输入商家简介"
        {...form.register('shop_description')}
        rows={3}
      />

      <textarea
        className="w-full p-2 border rounded"
        placeholder="请输入投放简介"
        {...form.register('put_description')}
        rows={3}
      />

      <div className="flex items-center space-x-2">
        <Switch
          {...form.register('displayed')}
        />
        <Label htmlFor="airplane-mode">是否开放</Label>
      </div>

      <Input
        label="价格基数"
        type="number"
        placeholder="请输入价格基数（分）"
        error={form.formState.errors.price_base?.message}
        fullWidth
        {...form.register('price_base', { valueAsNumber: true })}
      />

      <Input
        label="分类标签"
        placeholder="请输入分类标签"
        error={form.formState.errors.classify_tag?.message}
        fullWidth
        {...form.register('classify_tag')}
      />

      <textarea
        className="w-full p-2 border rounded"
        placeholder="请输入备注"
        {...form.register('remark')}
        rows={3}
      />

      {mode === 'edit' && <Input type="hidden" {...form.register('id')} />}
    </FormDialog>
  );
};

export default ShopFormDialog;
