import { describe, expect, it } from 'vitest'; // vitest
import { ResponseFactory } from '@/lib/api/response_pb';
import { UserProto, UserData } from './mock';



describe("ResponseFactory", () => {
  // 测试 1: 正常成功响应
  it("应该正确解码成功响应", async () => {
    const user = { id: 1, name: "John" };
    const successResponse = ResponseFactory.success(user, UserProto);
    const buffer = await successResponse.arrayBuffer();
    const decoded = await ResponseFactory.decode<UserData>({ data: buffer }, UserProto);
    expect(decoded).toEqual({ status: "success", data: { id: 1, name: "John" } });
  });

  // 测试 2: 正常错误响应
  it("应该正确解码错误响应", async () => {
    const errorResponse = ResponseFactory.error("Not found", 404);
    const errorBuffer = await errorResponse.arrayBuffer();
    const errorDecoded = await ResponseFactory.decode({ data: errorBuffer });
    expect(errorDecoded).toEqual({ status: "error", error: { code: 404, message: "Not found" } });
  });

  // 测试 3: 正常错误被强行转为String
  it("应该处理被转换为字符串的错误响应", async () => {
    const errorResponse2 = await ResponseFactory.error("Not found", 404).text();
    const errorDecoded2 = await ResponseFactory.decode({ error: errorResponse2 });
    expect(errorDecoded2).toEqual({ status: "error", error: { code: 7299055, message: "Not found" } });
  });

  // 测试 4: 空 buffer
  it("应该优雅地处理空缓冲区", async () => {
    const emptyBuffer = new ArrayBuffer(0);
    const emptyDecoded = await ResponseFactory.decode({ data: emptyBuffer });
    expect(emptyDecoded).toEqual({ status: "error", error: { code: 500, message: "Empty buffer received" } });
  });

  // 测试 5: 无效 buffer
  it("应该优雅地处理无效缓冲区", async () => {
    const invalidBuffer = new TextEncoder().encode("random data").buffer;
    const invalidDecoded = await ResponseFactory.decode({ data: invalidBuffer });
    expect(invalidDecoded).toEqual({ status: "error", error: { code: 500, message: "Decoding failed: invalid buffer format" } });
  });
});
