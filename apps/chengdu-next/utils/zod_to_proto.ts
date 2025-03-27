import { z, ZodTypeAny, ZodObject, ZodEnum, ZodTuple, ZodUnion, ZodOptional } from "zod";

// 工具函数：首字母大写
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** 将驼峰转为全大写下划线，如 OperationType => OPERATION_TYPE */
function toConstantCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toUpperCase()
    .replace(/^_/, "");
}


// 配置类型
interface ProtoConfig {
  packageName?: string;
  includeComments?: boolean;
}

// 主函数：将 Zod Schema 转换为 Proto 文件
export function zodToProto(schemas: Record<string, ZodTypeAny>, config: ProtoConfig = {}): string {
  const { packageName = "audit", includeComments = true } = config;
  const messages = new Map<string, string>();
  const enums = new Map<string, string>();
  const enumSignatures = new Map<string, string>();

  let proto = `syntax = "proto3";\n\npackage ${packageName};\n\n`;
  proto += `import "google/protobuf/any.proto";\n\n`;

  for (const [name, schema] of Object.entries(schemas)) {
    generateTypeDefinition(schema, name, messages, enums, enumSignatures, includeComments);
  }

  proto += Array.from(enums.values()).join("\n") + "\n";
  proto += Array.from(messages.values()).join("\n");

  return proto;
}

// 根据类型生成 message 或 enum 定义
function generateTypeDefinition(
  schema: ZodTypeAny,
  name: string,
  messages: Map<string, string>,
  enums: Map<string, string>,
  enumSignatures: Map<string, string>,
  includeComments: boolean
): void {
  if (schema instanceof ZodObject) {
    generateMessage(schema, name, messages, enums, enumSignatures, includeComments);
  } else if (schema instanceof ZodEnum) {
    generateEnum(schema, name, enums, enumSignatures);
  } else {
    throw new Error(`Unsupported top-level schema type for ${name}`);
  }
}

// 生成 message 定义
function generateMessage(
  schema: ZodObject<any>,
  messageName: string,
  messages: Map<string, string>,
  enums: Map<string, string>,
  enumSignatures: Map<string, string>,
  includeComments: boolean
): void {
  if (messages.has(messageName)) return;
  messages.set(messageName, "");

  let proto = `message ${messageName} {\n`;
  const shape = schema.shape;
  let fieldIndex = 1;

  for (const [key, value] of Object.entries(shape) as [string, ZodTypeAny][]) {
    const comment = includeComments && value.description ? ` // ${value.description}` : "";
    proto += `  ${convertZodTypeToProto(value, key, fieldIndex, messages, enums, enumSignatures, messageName)}${comment}\n`;
    fieldIndex++;
  }

  proto += "}\n";
  messages.set(messageName, proto);
}

// 生成 enum 定义并确保值全局唯一
function generateEnum(
  schema: ZodEnum<any>,
  enumName: string,
  enums: Map<string, string>,
  enumSignatures: Map<string, string>
): string {
  const signature = schema.options.join(",");
  if (enumSignatures.has(signature)) {
    return enumSignatures.get(signature)!;
  }

  if (enums.has(enumName)) {
    let uniqueName = enumName;
    let counter = 1;
    while (enums.has(uniqueName)) {
      uniqueName = `${enumName}${counter++}`;
    }
    enumName = uniqueName;
  }

  const enumPrefix = enumName.toUpperCase().replace(/([A-Z])/g, "_$1").replace(/^_/, "");
  const defaultValue = `${toConstantCase(enumName)}_UNSPECIFIED`;
  const enumValues = schema.options.map((opt: string, i: number) =>
    `  ${opt.toUpperCase()} = ${i + 1};`
  ).join("\n");
  enums.set(enumName, `enum ${enumName} {\n  ${defaultValue} = 0;\n${enumValues}\n}\n`);
  enumSignatures.set(signature, enumName);
  return enumName;
}

// 将 Zod 类型转换为 Proto 类型
function convertZodTypeToProto(
  type: ZodTypeAny,
  key: string,
  index: number,
  messages: Map<string, string>,
  enums: Map<string, string>,
  enumSignatures: Map<string, string>,
  parentMessageName: string
): string {
  if (type instanceof ZodOptional) {
    return convertZodTypeToProto(type._def.innerType, key, index, messages, enums, enumSignatures, parentMessageName);
  }
  if (type instanceof z.ZodString) return `string ${key} = ${index};`;
  if (type instanceof z.ZodNumber) return `int32 ${key} = ${index};`;
  if (type instanceof z.ZodBoolean) return `bool ${key} = ${index};`;
  if (type instanceof z.ZodBigInt) return `int64 ${key} = ${index};`;
  if (type instanceof z.ZodDate) return `string ${key} = ${index}; // ISO date`;
  if (type instanceof z.ZodAny) return `google.protobuf.Any ${key} = ${index};`;

  if (type instanceof z.ZodArray) {
    const innerType = type._def.type;
    const innerTypeName = getProtoTypeName(innerType, key, messages, enums, enumSignatures, parentMessageName);
    // 为数组元素生成简洁的 message 名称
    if (innerType instanceof ZodObject) {
      const arrayMessageName = `${parentMessageName}${capitalize(key)}`; // 优化为简洁名称
      generateMessage(innerType, arrayMessageName, messages, enums, enumSignatures, true);
      return `repeated ${arrayMessageName} ${key} = ${index};`;
    }
    return `repeated ${innerTypeName} ${key} = ${index};`;
  }
  if (type instanceof z.ZodObject) {
    const messageName = `${parentMessageName}${capitalize(key)}`;
    generateMessage(type, messageName, messages, enums, enumSignatures, true);
    return `${messageName} ${key} = ${index};`;
  }
  if (type instanceof z.ZodRecord) {
    return `map<string, string> ${key} = ${index};`;
  }
  if (type instanceof ZodTuple) {
    const tupleName = `${parentMessageName}${capitalize(key)}`;
    if (!messages.has(tupleName)) {
      const tupleFields = type.items
        .map((item: ZodTypeAny, i: number) => `  ${convertZodTypeToProto(item, `value${i + 1}`, i + 1, messages, enums, enumSignatures, tupleName)}`)
        .join("\n");
      messages.set(tupleName, `message ${tupleName} {\n${tupleFields}\n}\n`);
    }
    return `${tupleName} ${key} = ${index};`;
  }
  if (type instanceof ZodUnion) {
    return `oneof ${key} {\n${type.options
      .map((opt: ZodTypeAny, i: number) => `    ${convertZodTypeToProto(opt, `${key}_option${i + 1}`, i + 1, messages, enums, enumSignatures, parentMessageName)}`)
      .join("\n")}\n  }`;
  }
  if (type instanceof ZodEnum) {
    const proposedEnumName = capitalize(key);
    const enumName = generateEnum(type, proposedEnumName, enums, enumSignatures);
    return `${enumName} ${key} = ${index};`;
  }
  return `// Unsupported type ${key} = ${index};`;
}

// 获取 Proto 类型名称
function getProtoTypeName(
  type: ZodTypeAny,
  key: string,
  messages: Map<string, string>,
  enums: Map<string, string>,
  enumSignatures: Map<string, string>,
  parentMessageName: string
): string {
  if (type instanceof ZodOptional) {
    return getProtoTypeName(type._def.innerType, key, messages, enums, enumSignatures, parentMessageName);
  }
  if (type instanceof z.ZodString) return "string";
  if (type instanceof z.ZodNumber) return "int32";
  if (type instanceof z.ZodBoolean) return "bool";
  if (type instanceof z.ZodBigInt) return "int64";
  if (type instanceof z.ZodDate) return "string";
  if (type instanceof z.ZodAny) return "google.protobuf.Any";

  if (type instanceof z.ZodObject) {
    const messageName = `${parentMessageName}${capitalize(key)}`;
    generateMessage(type, messageName, messages, enums, enumSignatures, true);
    return messageName;
  }
  if (type instanceof z.ZodRecord) {
    return "map<string, string>";
  }
  if (type instanceof ZodTuple) {
    const tupleName = `${parentMessageName}${capitalize(key)}`;
    if (!messages.has(tupleName)) {
      const tupleFields = type.items
        .map((item: ZodTypeAny, i: number) => `  ${convertZodTypeToProto(item, `value${i + 1}`, i + 1, messages, enums, enumSignatures, tupleName)}`)
        .join("\n");
      messages.set(tupleName, `message ${tupleName} {\n${tupleFields}\n}\n`);
    }
    return tupleName;
  }
  if (type instanceof ZodUnion) {
    return "oneof";
  }
  if (type instanceof ZodEnum) {
    const proposedEnumName = capitalize(key);
    return generateEnum(type, proposedEnumName, enums, enumSignatures);
  }
  return "/*Unsupported*/";
}
