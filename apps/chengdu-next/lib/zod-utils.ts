import { z } from 'zod';

/**
 * 创建一个带有中文描述的 Zod 枚举
 * @param values 枚举值及其对应的中文描述
 * @returns 返回 Zod 枚举和描述对象
 */
export function createZodEnumWithDescriptions<T extends Record<string, string>>(values: T) {
  // 提取枚举值的键
  const enumKeys = Object.keys(values) as [keyof T & string];

  // 创建 Zod 枚举
  const zodEnum = z.enum(enumKeys);

  // 返回 Zod 枚举和描述对象
  return {
    schema: zodEnum,
    descriptions: values,
  };
}

