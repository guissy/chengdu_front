import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Input,
  FormDialog,
  Switch,
  Label,
  Card,
  Button,
  LoadingSpinner,
} from "chengdu_ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { shopTypeMap, useShopStore } from "@/features/shop/shop-store";
import client from "@/lib/api/client";
import { ShopListResponseSchema } from "@/lib/schema/shop";
import {
  MdStore,
  MdLocationOn,
  MdPerson,
  MdAttachMoney,
  MdDescription,
  MdAccessTime,
  MdImage,
} from "react-icons/md";
import say from "./say";
import { parseSay } from "./sayParser";

// 添加RadioGroup组件定义
// 这是一个自定义的RadioGroup组件，用于替代Select组件
interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  error?: string;
  register: any;
  name: string;
  control?: any;
}

const RadioGroup = ({
  label,
  options,
  error,
  register,
  name,
  control,
}: RadioGroupProps) => {
  const value = useWatch({
    control,
    name,
  });

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            label={option.label}
            name={name}
            isChecked={value === option.value}
            register={register}
          />
        ))}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// 添加Radio组件定义
interface RadioProps {
  value: string;
  label: string;
  name: string;
  register: any;
  isChecked?: boolean;
}

const Radio = ({ value, label, name, register, isChecked }: RadioProps) => {
  return (
    <label
      className={`
      flex items-center justify-center px-4 py-2 rounded-md border text-sm font-medium
      cursor-pointer transition-all duration-200 min-w-[80px]
      ${
        isChecked
          ? "bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      }
    `}
    >
      <input
        type="radio"
        className="sr-only"
        value={value}
        {...register(name)}
      />
      <span>{label}</span>
    </label>
  );
};

// 添加MultiRadioGroup组件用于多选场景
interface MultiRadioGroupProps {
  label?: string;
  options: RadioOption[];
  error?: string;
  register: any;
  setValue: any;
  name: string;
  control?: any;
}

const MultiRadioGroup = ({
  label,
  options,
  error,
  register,
  setValue,
  name,
  control,
}: MultiRadioGroupProps) => {
  const value = useWatch({
    control,
    name,
    defaultValue: [],
  });

  const handleToggle = (optionValue: string) => {
    const newValue = Array.isArray(value) ? [...value] : [];
    if (newValue.includes(optionValue)) {
      setValue(
        name,
        newValue.filter((v) => v !== optionValue),
        { shouldValidate: true }
      );
    } else {
      setValue(name, [...newValue, optionValue], { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`
              flex items-center justify-center px-4 py-2 rounded-md border text-sm font-medium
              cursor-pointer transition-all duration-200
              ${
                Array.isArray(value) && value.includes(option.value)
                  ? "bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <span>{option.label}</span>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {/* 隐藏的input用于form提交 */}
      <input
        type="hidden"
        {...register(name)}
        value={Array.isArray(value) ? value.join(",") : ""}
      />
    </div>
  );
};

type Shop = NonNullable<
  z.infer<typeof ShopListResponseSchema>["data"]
>["list"][number];

interface ShopFormDialogProps {
  mode: "add" | "edit";
}

// 表单验证模式定义
const schema = z.object({
  id: z.string().optional().describe("商家ID，可选"),
  type: z
    .string()
    .describe(
      "商家类型，例如：RESTAURANT, LIGHT_FOOD, TEA_HOUSE, DRINK_COFFEE, COFFEE_SHOP, HOTEL"
    ),
  type_tag: z.string().optional().describe("品类标签"),
  business_type: z
    .string()
    .describe("商业类型，例如：INDEPENDENT, CHAIN_DIRECT, CHAIN_FRANCHISE"),
  trademark: z.string().min(1).describe("字号，必填"),
  branch: z.string().optional().describe("分店名称"),
  location: z
    .tuple([z.number(), z.number()])
    .describe("坐标，经纬度 [经度, 纬度]"),
  verified: z.boolean().default(false).describe("是否认证"),
  duration: z
    .string()
    .default("LESS_THAN_ONE")
    .describe(
      "经营时长，例如：LESS_THAN_ONE, ONE_TO_TWO, TWO_TO_FIVE, OVER_FIVE"
    ),
  consume_display: z.boolean().default(true).describe("是否展示消费数据"),
  average_expense: z
    .tuple([z.number().int(), z.number().int()])
    .describe("人均消费范围 [最低值, 最高值]，单位（分）"),
  sex: z.string().default("ALL").describe("顾客性别，例如：ALL, MALE, FEMALE"),
  age: z
    .tuple([z.number().int(), z.number().int()])
    .describe("顾客年龄段 [最小年龄, 最大年龄]"),
  id_tag: z.string().optional().describe("身份标签"),
  sign_photo: z.string().optional().describe("标识图片URL"),
  verify_photo: z.array(z.string()).optional().describe("认证图片URL数组"),
  environment_photo: z.array(z.string()).optional().describe("外景图片URL数组"),
  building_photo: z.array(z.string()).optional().describe("内景图片URL数组"),
  brand_photo: z.array(z.string()).optional().describe("品牌营销图片URL数组"),
  contact_name: z.string().optional().describe("联系人姓名"),
  contact_phone: z.string().optional().describe("联系人电话"),
  contact_type: z
    .string()
    .describe("联系人类型，例如：OWNER, MANAGER, STAFF, HEADQUARTERS"),
  total_area: z.number().optional().describe("总面积，单位（平方米）"),
  customer_area: z.number().optional().describe("客区面积，单位（平方米）"),
  clerk_count: z.number().optional().describe("店员人数"),
  business_hours: z
    .tuple([z.number().int(), z.number().int()])
    .describe("营业时间 [开始时间, 结束时间]，24小时制"),
  rest_days: z
    .array(z.string())
    .describe(
      "休息日，例如：MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY, ON_DEMAND"
    ),
  volume_peak: z
    .array(z.string())
    .describe(
      "客流高峰，例如：BREAKFAST, LUNCH, DINNER, MIDNIGHT, MORNING, AFTERNOON, EVENING, LATE_NIGHT"
    ),
  season: z
    .array(z.string())
    .describe(
      "季节或特殊时段，例如：SPRING, SUMMER, AUTUMN, WINTER, HOLIDAY, WORKDAY, NON_WORKDAY"
    ),
  shop_description: z.string().optional().describe("商家简介"),
  put_description: z.string().optional().describe("投放简介"),
  displayed: z.boolean().default(true).describe("是否开放"),
  price_base: z.number().int().describe("价格基数，单位（分）"),
  classify_tag: z.string().optional().describe("分类标签"),
  remark: z.string().optional().describe("备注"),
});

type FormValues = z.infer<typeof schema>;

const ShopFormDialog = ({ mode }: ShopFormDialogProps) => {
  const {
    isAddDialogOpen,
    isEditDialogOpen,
    closeAddDialog,
    closeEditDialog,
    currentShop,
  } = useShopStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const queryClient = useQueryClient();

  const isOpen = mode === "add" ? isAddDialogOpen : isEditDialogOpen;
  const onClose = mode === "add" ? closeAddDialog : closeEditDialog;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: "",
      type: "RESTAURANT",
      type_tag: undefined,
      business_type: "INDEPENDENT",
      trademark: "",
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
      contact_type: "OWNER",
      total_area: 10,
      customer_area: 6,
      clerk_count: 10,
      business_hours: [9, 21],
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

  const [sayText, setSayText] = useState(say);
  const [fetchAiLoading, setFetchAiLoading] = useState(false);
  const parseSayCallback = useCallback((sayText: string) => {
    setFetchAiLoading(true);
    parseSay(sayText, (json, done) => {
      if (done) {
        try {
          let jsonOk = json.replace(/```json\n/, "").replace(/\n```/, "");
          setSayText(jsonOk);
          form.reset(JSON.parse(jsonOk));
          console.log(jsonOk);
          console.log(form.getValues());
        } catch (error) {
          console.error(error);
        } finally {
          setFetchAiLoading(false);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (mode === "edit" && currentShop) {
      const shop = currentShop as unknown as Shop;
      form.reset({
        id: shop.id,
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
        verify_photo: shop.verify_photo || [],
        environment_photo: [],
        building_photo: [],
        brand_photo: [],
        contact_name: undefined,
        contact_phone: undefined,
        contact_type: shop.contact_type as string,
        total_area: shop.total_area as number,
        customer_area: shop.customer_area as number,
        clerk_count: shop.clerk_count as number,
        business_hours:
          Array.isArray(shop.business_hours) && shop.business_hours.length >= 2
            ? [shop.business_hours[0], shop.business_hours[1]]
            : [9, 21],
        rest_days: Array.isArray(shop.rest_days) ? shop.rest_days : [],
        volume_peak: Array.isArray(shop.volume_peak) ? shop.volume_peak : [],
        season: Array.isArray(shop.season) ? shop.season : [],
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
    mutationFn: (data) =>
      // @ts-ignore
      client.POST("/api/shop/add", { body: data }),
  });

  const updateShopMutation = useMutation({
    mutationFn: (data) =>
      // @ts-ignore
      client.POST("/api/shop/update", { body: data }),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      // 确保多选字段是数组形式
      const processedData = {
        ...data,
        // 确保这些字段是数组形式，即使表单提交的是逗号分隔的字符串
        rest_days: Array.isArray(data.rest_days)
          ? data.rest_days
          : data.rest_days
            ? String(data.rest_days).split(",").filter(Boolean)
            : [],
        volume_peak: Array.isArray(data.volume_peak)
          ? data.volume_peak
          : data.volume_peak
            ? String(data.volume_peak).split(",").filter(Boolean)
            : [],
        season: Array.isArray(data.season)
          ? data.season
          : data.season
            ? String(data.season).split(",").filter(Boolean)
            : [],
      };

      if (mode === "add") {
        await addShopMutation.mutateAsync({
          ...processedData,
          cbdId: "cbd-001",
          partId: "part-001",
        } as any);
        toast.success("商家添加成功");
        form.reset();
      } else {
        await updateShopMutation.mutateAsync({
          ...currentShop,
          ...processedData,
        } as any);
        queryClient.invalidateQueries({
          queryKey: ["shop", data.id],
        });
        toast.success("商家更新成功");
      }
      queryClient.invalidateQueries({
        queryKey: ["shopListUnbind"],
      });
      queryClient.invalidateQueries({
        queryKey: ["shopList"],
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(mode === "add" ? "添加商家失败" : "更新商家失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || (mode === "edit" && !currentShop)) return null;

  // 表单分区标签列表
  const tabs = [
    { id: "basic", label: "基础信息", icon: <MdStore className="mr-1" /> },
    {
      id: "location",
      label: "位置信息",
      icon: <MdLocationOn className="mr-1" />,
    },
    { id: "contact", label: "联系人", icon: <MdPerson className="mr-1" /> },
    {
      id: "business",
      label: "经营信息",
      icon: <MdAttachMoney className="mr-1" />,
    },
    {
      id: "description",
      label: "描述信息",
      icon: <MdDescription className="mr-1" />,
    },
    {
      id: "schedule",
      label: "时间安排",
      icon: <MdAccessTime className="mr-1" />,
    },
    { id: "images", label: "图片资源", icon: <MdImage className="mr-1" /> },
  ];

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "新增商家" : "编辑商家"}
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      maxWidth="90vw"
    >
      <div className="flex gap-4">
        <div className="mb-6 w-3xl">
          <div className="flex overflow-x-auto pb-2 mb-4 border-b sticky top-0 z-10">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "primary" : "ghost"}
                size="sm"
                className="flex items-center whitespace-nowrap mr-2"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </Button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[60vh] min-h-[390px] pr-2">
            {activeTab === "basic" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-400 flex items-center">
                  <MdStore className="mr-2" /> 基础信息
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  请填写商家的基本信息，带*的为必填项
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mode === "edit" && (
                    <div className="col-span-full">
                      <Input
                        label="商家ID"
                        placeholder="请输入商家ID"
                        error={form.formState.errors.id?.message}
                        fullWidth
                        disabled
                        {...form.register("id")}
                      />
                    </div>
                  )}

                  <div className="col-span-full">
                    <Input
                      label="字号 *"
                      placeholder="请输入字号"
                      error={form.formState.errors.trademark?.message}
                      fullWidth
                      {...form.register("trademark")}
                    />
                  </div>

                  <Input
                    label="分店"
                    placeholder="请输入分店名称"
                    error={form.formState.errors.branch?.message}
                    fullWidth
                    {...form.register("branch")}
                  />

                  <div className="col-span-full">
                    <RadioGroup
                      label="商家类型 *"
                      options={Object.entries(shopTypeMap).map(
                        ([value, label]) => ({
                          value,
                          label,
                        })
                      )}
                      error={form.formState.errors.type?.message}
                      name="type"
                      control={form.control}
                      register={form.register}
                    />
                  </div>

                  <Input
                    label="品类标签"
                    placeholder="请输入品类标签"
                    error={form.formState.errors.type_tag?.message}
                    fullWidth
                    {...form.register("type_tag")}
                  />

                  <div className="col-span-full">
                    <RadioGroup
                      label="商业类型 *"
                      options={[
                        { value: "INDEPENDENT", label: "独立自营店" },
                        { value: "CHAIN_DIRECT", label: "连锁自营店" },
                        { value: "CHAIN_FRANCHISE", label: "连锁加盟店" },
                      ]}
                      error={form.formState.errors.business_type?.message}
                      name="business_type"
                      control={form.control}
                      register={form.register}
                    />
                  </div>

                  <div className="col-span-full">
                    <Card className="p-4  border-gray-200">
                      <h4 className="font-medium text-gray-500 mb-3">
                        商家状态
                      </h4>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="verified-switch"
                            {...form.register("verified")}
                          />
                          <Label
                            htmlFor="verified-switch"
                            className="cursor-pointer"
                          >
                            是否认证
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="displayed-switch"
                            {...form.register("displayed")}
                          />
                          <Label
                            htmlFor="displayed-switch"
                            className="cursor-pointer"
                          >
                            是否开放
                          </Label>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-400 flex items-center">
                  <MdLocationOn className="mr-2" /> 位置信息
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  请填写商家的位置和场地信息
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="经度 *"
                    type="number"
                    placeholder="请输入经度"
                    error={form.formState.errors.location?.[0]?.message}
                    fullWidth
                    {...form.register("location.0", { valueAsNumber: true })}
                  />

                  <Input
                    label="纬度 *"
                    type="number"
                    placeholder="请输入纬度"
                    error={form.formState.errors.location?.[1]?.message}
                    fullWidth
                    {...form.register("location.1", { valueAsNumber: true })}
                  />

                  <Input
                    label="总面积（平方米）"
                    type="number"
                    placeholder="请输入面积"
                    error={form.formState.errors.total_area?.message}
                    fullWidth
                    {...form.register("total_area", { valueAsNumber: true })}
                  />

                  <Input
                    label="客区面积（平方米）"
                    type="number"
                    placeholder="请输入客区面积"
                    error={form.formState.errors.customer_area?.message}
                    fullWidth
                    {...form.register("customer_area", { valueAsNumber: true })}
                  />
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-400 flex items-center">
                  <MdPerson className="mr-2" /> 联系人信息
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  请填写商家的联系人信息
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="联系人姓名"
                    placeholder="请输入联系人姓名"
                    error={form.formState.errors.contact_name?.message}
                    fullWidth
                    {...form.register("contact_name")}
                  />

                  <Input
                    label="联系人电话"
                    placeholder="请输入联系人电话"
                    error={form.formState.errors.contact_phone?.message}
                    fullWidth
                    {...form.register("contact_phone")}
                  />

                  <div className="col-span-full">
                    <RadioGroup
                      label="联系人类型 *"
                      options={[
                        { value: "OWNER", label: "老板" },
                        { value: "MANAGER", label: "店长" },
                        { value: "STAFF", label: "店员" },
                        { value: "HEADQUARTERS", label: "总店管理人员" },
                      ]}
                      error={form.formState.errors.contact_type?.message}
                      name="contact_type"
                      control={form.control}
                      register={form.register}
                    />
                  </div>

                  <Input
                    label="店员人数"
                    type="number"
                    placeholder="请输入店员人数"
                    error={form.formState.errors.clerk_count?.message}
                    fullWidth
                    {...form.register("clerk_count", { valueAsNumber: true })}
                  />
                </div>
              </div>
            )}

            {activeTab === "business" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-400 flex items-center">
                  <MdAttachMoney className="mr-2" /> 经营信息
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  请填写商家的经营信息
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <RadioGroup
                      label="经营时长 *"
                      options={[
                        { value: "LESS_THAN_ONE", label: "一年内新店" },
                        { value: "ONE_TO_TWO", label: "1~2年" },
                        { value: "TWO_TO_FIVE", label: "2~5年" },
                        { value: "OVER_FIVE", label: "五年以上" },
                      ]}
                      error={form.formState.errors.duration?.message}
                      name="duration"
                      control={form.control}
                      register={form.register}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="consume-display-switch"
                      {...form.register("consume_display")}
                    />
                    <Label
                      htmlFor="consume-display-switch"
                      className="cursor-pointer"
                    >
                      是否展示消费数据
                    </Label>
                  </div>

                  <Input
                    label="最低消费（元）"
                    type="number"
                    placeholder="请输入最低消费"
                    error={form.formState.errors.average_expense?.[0]?.message}
                    fullWidth
                    {...form.register("average_expense.0", {
                      valueAsNumber: true,
                    })}
                  />

                  <Input
                    label="最高消费（元）"
                    type="number"
                    placeholder="请输入最高消费"
                    error={form.formState.errors.average_expense?.[1]?.message}
                    fullWidth
                    {...form.register("average_expense.1", {
                      valueAsNumber: true,
                    })}
                  />

                  <div className="col-span-full">
                    <RadioGroup
                      label="顾客性别 *"
                      options={[
                        { value: "ALL", label: "不限" },
                        { value: "MALE", label: "男" },
                        { value: "FEMALE", label: "女" },
                      ]}
                      error={form.formState.errors.sex?.message}
                      name="sex"
                      control={form.control}
                      register={form.register}
                    />
                  </div>

                  <Input
                    label="价格基数（元）"
                    type="number"
                    placeholder="请输入价格基数"
                    error={form.formState.errors.price_base?.message}
                    fullWidth
                    {...form.register("price_base", { valueAsNumber: true })}
                  />

                  <Input
                    label="最小年龄"
                    type="number"
                    placeholder="请输入最小年龄"
                    error={form.formState.errors.age?.[0]?.message}
                    fullWidth
                    {...form.register("age.0", { valueAsNumber: true })}
                  />

                  <Input
                    label="最大年龄"
                    type="number"
                    placeholder="请输入最大年龄"
                    error={form.formState.errors.age?.[1]?.message}
                    fullWidth
                    {...form.register("age.1", { valueAsNumber: true })}
                  />

                  <Input
                    label="身份标签"
                    placeholder="请输入身份标签"
                    error={form.formState.errors.id_tag?.message}
                    fullWidth
                    {...form.register("id_tag")}
                  />

                  <Input
                    label="分类标签"
                    placeholder="请输入分类标签"
                    error={form.formState.errors.classify_tag?.message}
                    fullWidth
                    {...form.register("classify_tag")}
                  />
                </div>
              </div>
            )}

            {activeTab === "description" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-400 flex items-center">
                  <MdDescription className="mr-2" /> 描述信息
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  请填写商家的描述信息
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      商家简介
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[100px]"
                      placeholder="请输入商家简介"
                      {...form.register("shop_description")}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      投放简介
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[100px]"
                      placeholder="请输入投放简介"
                      {...form.register("put_description")}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      备注
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[100px]"
                      placeholder="请输入备注"
                      {...form.register("remark")}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-400 flex items-center">
                  <MdAccessTime className="mr-2" /> 时间安排
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  请填写商家的时间安排
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="营业开始时间 *"
                    type="number"
                    placeholder="请输入营业开始时间（24小时制）"
                    error={form.formState.errors.business_hours?.[0]?.message}
                    fullWidth
                    {...form.register("business_hours.0", {
                      valueAsNumber: true,
                    })}
                  />

                  <Input
                    label="营业结束时间 *"
                    type="number"
                    placeholder="请输入营业结束时间（24小时制）"
                    error={form.formState.errors.business_hours?.[1]?.message}
                    fullWidth
                    {...form.register("business_hours.1", {
                      valueAsNumber: true,
                    })}
                  />

                  <div className="col-span-full">
                    <Card className="p-4  border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3">
                        营业时间安排
                      </h4>

                      <div className="mb-4">
                        <MultiRadioGroup
                          label="休息日"
                          options={[
                            { value: "MONDAY", label: "周一" },
                            { value: "TUESDAY", label: "周二" },
                            { value: "WEDNESDAY", label: "周三" },
                            { value: "THURSDAY", label: "周四" },
                            { value: "FRIDAY", label: "周五" },
                            { value: "SATURDAY", label: "周六" },
                            { value: "SUNDAY", label: "周日" },
                            { value: "ON_DEMAND", label: "按需" },
                          ]}
                          error={form.formState.errors.rest_days?.message}
                          register={form.register}
                          setValue={form.setValue}
                          name="rest_days"
                          control={form.control}
                        />
                      </div>

                      <div className="mb-4">
                        <MultiRadioGroup
                          label="客流高峰"
                          options={[
                            { value: "BREAKFAST", label: "早餐" },
                            { value: "LUNCH", label: "午餐" },
                            { value: "DINNER", label: "晚餐" },
                            { value: "MIDNIGHT", label: "宵夜" },
                            { value: "MORNING", label: "上午" },
                            { value: "AFTERNOON", label: "下午" },
                            { value: "EVENING", label: "晚上" },
                            { value: "LATE_NIGHT", label: "深夜" },
                          ]}
                          error={form.formState.errors.volume_peak?.message}
                          register={form.register}
                          setValue={form.setValue}
                          name="volume_peak"
                          control={form.control}
                        />
                      </div>

                      <div>
                        <MultiRadioGroup
                          label="季节"
                          options={[
                            { value: "SPRING", label: "春" },
                            { value: "SUMMER", label: "夏" },
                            { value: "AUTUMN", label: "秋" },
                            { value: "WINTER", label: "冬" },
                            { value: "HOLIDAY", label: "节假日" },
                            { value: "WORKDAY", label: "工作日" },
                            { value: "NON_WORKDAY", label: "非工作日" },
                          ]}
                          error={form.formState.errors.season?.message}
                          register={form.register}
                          setValue={form.setValue}
                          name="season"
                          control={form.control}
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-400 flex items-center">
                  <MdImage className="mr-2" /> 图片资源
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  请上传商家相关的图片资源
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="标识图片"
                    placeholder="请输入标识图片URL"
                    error={form.formState.errors.sign_photo?.message}
                    fullWidth
                    {...form.register("sign_photo")}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      认证图片
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="请输入认证图片URL，多个用逗号分隔"
                      {...form.register("verify_photo")}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        外景图片
                      </label>
                      <textarea
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="请输入外景图片URL，多个用逗号分隔"
                        {...form.register("environment_photo")}
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        内景图片
                      </label>
                      <textarea
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="请输入内景图片URL，多个用逗号分隔"
                        {...form.register("building_photo")}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      品牌营销图片
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="请输入品牌营销图片URL，多个用逗号分隔"
                      {...form.register("brand_photo")}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {mode === "edit" && <Input type="hidden" {...form.register("id")} />}
        </div>
        <div className="flex-1">
          <textarea
            value={sayText}
            className="w-full h-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            onChange={(e) => setSayText(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => parseSayCallback(sayText)}
            disabled={fetchAiLoading}
          >
            {fetchAiLoading ? <div className="transform scale-60 text-white-400"><LoadingSpinner /></div> : <span className="animate-pulse text-2xl">✨</span>}
            {fetchAiLoading ? "正在思考..." : "试试魔法"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
};

export default ShopFormDialog;
