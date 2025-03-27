import { NextResponse } from 'next/server';
import { AuditLog } from '@/lib/api/chengdu'; // 假设这是生成的 Protobuf 类型
import { emitter } from '@/lib/emitter';
import { ErrorProto } from '@/lib/api/response_pb';

/**
 * @desc: 获取审计日志的 SSE 流
 * @response: ReadableStream<AuditLog>
 */

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 生成 Protobuf 编码的 SSE 流
async function* generateProtobufSSE() {
  while (true) {
    try {
      const newData = await Promise.race<AuditLog | null>([
        new Promise(resolve =>
          emitter.once('newAuditLog', resolve)
        ),
        delay(5000).then(() => null)
      ]);

      if (newData) {
        // Protobuf 编码
        const protoBuffer = AuditLog.encode(newData).finish();

        // 构造 SSE 消息（Base64 编码二进制数据）
        yield `data: ${bufferToBase64(protoBuffer)}\n\n`;
      }
    } catch (error) {
      // Protobuf 格式错误消息
      const errorProto = ErrorProto.encode({
        code: 500,
        message: (error as Error).message
      }).finish();
      yield `event: error\ndata: ${bufferToBase64(errorProto)}\n\n`;
      break;
    }
  }
}

// 辅助函数：Uint8Array 转 Base64
function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of generateProtobufSSE()) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        const errorProto = ErrorProto.encode({
          code: 500,
          message: 'Stream processing failed'
        }).finish();
        controller.enqueue(encoder.encode(
          `event: error\ndata: ${bufferToBase64(errorProto)}\n\n`
        ));
      } finally {
        controller.close();
      }
    },
    cancel() {
      // emitter.off('newAuditLog');
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Protobuf-Schema': 'AuditLog' // 可选：声明使用的 Protobuf 类型
    }
  });
}

// Prisma 日志创建保持不变
// const log = await prisma.auditLog.create({
//   data: { /* ... */ }
// });

// emitter.emit('newAuditLog', AuditLog.fromJSON(log)); // 注意转换为 Protobuf 类型
