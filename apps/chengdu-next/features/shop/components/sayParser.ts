const resolveSse = async (
  res: Response,
  onChunk: (text: string, done: boolean) => void
) => {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/event-stream")) {
    const reader = res.body?.getReader();
    let mergedText = "";
    if (reader) {
      let lastUpdateTime = 0;
      const updateInterval = 150; // 更新间隔，单位毫秒，可以根据需要调整
      let pendingUpdate = false;

      // 节流函数，控制更新频率
      const throttledUpdate = (text: string, isDone: boolean) => {
        const now = Date.now();
        if (isDone) {
          // 流结束时，立即更新最终结果
          onChunk(text, true);
          return;
        }

        if (!pendingUpdate && now - lastUpdateTime >= updateInterval) {
          // 达到更新间隔，执行更新
          onChunk(text, false);
          lastUpdateTime = now;
        } else if (!pendingUpdate) {
          // 设置延迟更新
          pendingUpdate = true;
          setTimeout(
            () => {
              onChunk(text, false);
              lastUpdateTime = Date.now();
              pendingUpdate = false;
            },
            updateInterval - (now - lastUpdateTime)
          );
        }
      };

      while (true) {
        const { done, value } = (await reader.read()) || {
          done: true,
          value: null,
        };

        if (done) {
          // 流结束，通知完成
          throttledUpdate(mergedText, true);
          break;
        }

        try {
          const chunk = new TextDecoder("utf-8").decode(value);
          const lines = chunk.split("\n");
          let contentUpdated = false;

          for (const line of lines) {
            // 只处理以"data: "开头的行
            if (line.startsWith("data: ")) {
              try {
                // 移除"data: "前缀并解析JSON
                const jsonData = line.replace(/^data: /, "");
                if (jsonData !== "[DONE]") {
                  const data = JSON.parse(jsonData);
                  // 提取内容（如果存在）
                  const content = data?.choices[0]?.delta?.content || "";
                  if (content) {
                    mergedText += content;
                    contentUpdated = true;
                  }
                } else {
                  // 流结束标记
                  throttledUpdate(mergedText, true);
                }
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
          }

          // 只有在内容有更新时才触发节流更新
          if (contentUpdated) {
            throttledUpdate(mergedText, false);
          }
        } catch (error) {
          console.error("Error decoding chunk:", error);
        }
      }
    }

    return mergedText;
  }
};


export const parseSay = async (prompt: string, onChunk: (text: string, done: boolean) => void) => {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
  const res = await fetch(baseUrl + "/api/deepseek", {
    method: "POST",
    body: JSON.stringify({ prompt: `z.object({
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
}); \n\n 销售和客户的对话有 ${prompt} \n\n 请根据对话生成一个商家信息，并返回json格式` }),
  });
  return resolveSse(res, onChunk);
};
