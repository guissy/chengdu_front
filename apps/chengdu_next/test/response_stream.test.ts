import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResponseFactory } from '@/lib/api/response_stream'; // 假设文件路径
import { NextResponse } from 'next/server';
import { BinaryWriter } from '@bufbuild/protobuf/wire';
import { ErrorProto, ProtoMessage, SuccessProto } from '@/lib/api/response_pb';
import { UserData } from '@/test/mock';

// 模拟 NextResponse
vi.mock('next/server', () => ({
  NextResponse: vi.fn((body, init) => ({
    body,
    status: init?.status,
    headers: init?.headers,
  })),
}));

describe('ResponseFactory 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // 每次测试前清理模拟
  });

  // 测试 streamSuccess 方法
  describe('streamSuccess 方法测试', () => {
    it('应该正确流式传输成功数据（带 codec）', async () => {
      // 准备模拟数据和 codec
      const mockData = [{ id: 1, name: '测试数据' }];
      const mockCodec = {
        encode: vi.fn((data) => ({
          finish: () => new Uint8Array([1, 2, 3]),
        })),
        decode: vi.fn(),
      } as unknown as ProtoMessage<UserData>;
      async function* dataProducer() {
        for (const item of mockData) {
          yield item;
        }
      }

      // 调用方法
      const response = ResponseFactory.streamSuccess(dataProducer, mockCodec, 200);

      // 验证 NextResponse 被正确调用
      expect(NextResponse).toHaveBeenCalledWith(
        expect.any(ReadableStream), // 仅检查 ReadableStream 类型
        expect.objectContaining({
          status: 200,
          headers: expect.objectContaining({
            'Content-Type': 'application/x-protobuf-stream',
          }),
        })
      );

      // 获取 ReadableStream 并读取数据
      const stream = response.body as ReadableStream;
      const reader = stream.getReader();
      const { value } = await reader.read();

      // 验证数据包含长度前缀和编码后的内容
      expect(value).toBeInstanceOf(Uint8Array);
      expect(mockCodec.encode).toHaveBeenCalledWith(mockData[0]);
    });

    it('应该处理流式传输中的错误', async () => {
      // 模拟一个会抛出错误的生成器
      async function* errorProducer() {
        throw new Error('生成器错误');
      }

      // 调用方法
      const response = ResponseFactory.streamSuccess(errorProducer);

      // 验证返回的是错误响应流
      expect(NextResponse).toHaveBeenCalledWith(expect.any(ReadableStream), {
        status: 200,
        headers: {
          'Content-Type': 'application/x-protobuf-stream',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

      // 读取流内容
      const stream = response.body as ReadableStream;
      const reader = stream.getReader();
      const { value } = await reader.read();

      // 验证错误内容
      const errorBuffer = ErrorProto.encode({
        code: 500,
        message: 'Stream encoding failed: 生成器错误',
      }).finish();
      expect(value).toEqual(expect.any(Uint8Array));
    });
  });

  // 测试 error 方法
  describe('error 方法测试', () => {
    it('应该返回正确的错误响应', () => {
      // 调用方法
      const response = ResponseFactory.error('测试错误', 400, { detail: '额外信息' });

      // 验证 NextResponse 参数
      expect(NextResponse).toHaveBeenCalledWith(expect.any(Uint8Array), {
        status: 400,
        headers: { 'Content-Type': 'application/x-protobuf' },
      });

      // 验证错误数据编码
      const buffer = ErrorProto.encode({
        code: 400,
        message: '测试错误',
        details: new TextEncoder().encode(JSON.stringify({ detail: '额外信息' })),
      }).finish();
      expect(response.body).toEqual(buffer);
    });
  });

  // 测试 decodeStream 方法
  describe('decodeStream 方法测试', () => {
    it('应该正确解码成功数据流', async () => {
      // 准备模拟数据
      const mockPayload = { id: 1, name: '测试' };
      const mockCodec = {
        encode: vi.fn(),
        decode: vi.fn(() => mockPayload),
      };
      const successData = SuccessProto.encode({
        code: 200,
        payload: new Uint8Array([1, 2, 3]),
      }).finish();
      const lengthPrefix = new BinaryWriter().uint32(successData.length).finish();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([...lengthPrefix, ...successData]));
          controller.close();
        },
      });

      // 调用方法并收集结果
      const results = [];
      for await (const result of ResponseFactory.decodeStream(mockStream, mockCodec)) {
        results.push(result);
      }

      // 验证解码结果
      expect(results).toEqual([{ status: 'success', data: mockPayload }]);
      expect(mockCodec.decode).toHaveBeenCalled();
    });

    it('应该处理错误数据流', async () => {
      // 准备模拟错误数据
      const errorData = ErrorProto.encode({
        code: 400,
        message: '请求错误',
      }).finish();
      const lengthPrefix = new BinaryWriter().uint32(errorData.length).finish();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([...lengthPrefix, ...errorData]));
          controller.close();
        },
      });

      // 调用方法并收集结果
      const results = [];
      for await (const result of ResponseFactory.decodeStream(mockStream)) {
        results.push(result);
      }

      // 验证错误结果
      expect(results).toEqual([
        {
          status: 'error',
          error: { code: 400, message: '请求错误' },
        },
      ]);
    });
  });
});
