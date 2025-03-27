import { NextResponse } from 'next/server';
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { ErrorProto, ProtoMessage, ResponseBody, SuccessProto } from '@/lib/api/response_pb';

export class ResponseFactory {
  /**
   * 拼接 varint 长度前缀与消息体
   */
  private static encodeMessage(buffer: Uint8Array): Uint8Array {
    const lengthPrefix = new BinaryWriter().uint32(buffer.length).finish();
    return concatUint8Arrays(lengthPrefix, buffer);
  }

  /**
   * 构建一个流式成功响应
   */
  static streamSuccess<T>(
    dataProducer: AsyncGenerator<T> | (() => AsyncGenerator<T>),
    codec?: ProtoMessage<T>,
    code = 200
  ): NextResponse {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const producer = typeof dataProducer === 'function' ? dataProducer() : dataProducer;
          for await (const data of producer) {
            const payload = codec
              ? codec.encode(data).finish()
              : new TextEncoder().encode(JSON.stringify(data));

            const successData = { code, payload };
            const messageBuffer = SuccessProto.encode(successData).finish();
            const fullMessage = ResponseFactory.encodeMessage(messageBuffer);
            console.log(
              "%c[PROTOCOL]%c Enqueued fullMessage: length: %d",
              "background: #28a745; color: white; padding: 2px 4px; border-radius: 2px;",
              "color: #888;",
              fullMessage.length,
              fullMessage
            );
            controller.enqueue(fullMessage);
          }
          console.log(
            "%c[PROTOCOL]%c Stream complete, closing controller",
            "background: #28a745; color: white; padding: 2px 4px; border-radius: 2px;",
            "color: #888;"
          );
          controller.close();
        } catch (error) {
          const errorData = ErrorProto.encode({
            code: 500,
            message: `Stream encoding failed: ${(error as Error).message}`,
          }).finish();
          const fullMessage = ResponseFactory.encodeMessage(errorData);
          controller.enqueue(fullMessage);
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: { "Content-Type": "application/x-protobuf-stream" },
    });
  }

  /**
   * 构建错误响应
   */
  static error(message: string, code = 500, details?: unknown): NextResponse {
    const errorData = {
      code,
      message,
      details: details ? new TextEncoder().encode(JSON.stringify(details)) : undefined,
    };
    const buffer = ErrorProto.encode(errorData).finish();
    return new NextResponse(buffer, {
      status: code,
      headers: { "Content-Type": "application/x-protobuf" },
    });
  }

  /**
   * 解码接收的流数据
   */
  static async* decodeStream<T>(
    stream: ReadableStream<Uint8Array>,
    payloadCodec?: ProtoMessage<T>
  ): AsyncGenerator<ResponseBody<T>> {
    const reader = stream.getReader();
    let buffer = new Uint8Array(0);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.length > 0) {
            console.warn(
              "%c[NETWORK]%c Residual data not processed:",
              "background: #007bff; color: white; padding: 2px 4px; border-radius: 2px;",
              "color: #888;",
              buffer
            );
          }
          break;
        }
        buffer = concatUint8Arrays(buffer, value) as Uint8Array<ArrayBuffer>;
        console.log(
          "%c[NETWORK]%c Received chunk, buffer size: %d",
          "background: #007bff; color: white; padding: 2px 4px; border-radius: 2px;",
          "color: #888;",
          buffer.length
        );

        while (true) {
          const bufferReader = new BinaryReader(buffer);
          let messageLength: number;
          try {
            messageLength = bufferReader.uint32();
          } catch (e) {
            break;
          }

          const headerLength = bufferReader.pos;
          const totalMessageLength = headerLength + messageLength;

          if (buffer.length < totalMessageLength) break;

          const messageBody = buffer.slice(headerLength, totalMessageLength);
          buffer = buffer.slice(totalMessageLength);

          try {
            const error = ErrorProto.decode(new BinaryReader(messageBody));
            if (error.code >= 400) {
              console.log(
                "%c[PROTOCOL]%c Received error:",
                "background: #dc3545; color: white; padding: 2px 4px; border-radius: 2px;",
                "color: #888;",
                error
              );
              yield { status: "error", error };
              continue;
            }
          } catch (e) {}

          try {
            const success = SuccessProto.decode(new BinaryReader(messageBody));
            console.log(
              "%c[PROTOCOL]%c Received success, payload length: %d",
              "background: #28a745; color: white; padding: 2px 4px; border-radius: 2px;",
              "color: #888;",
              success.payload?.length ?? 0,
              success
            );
            let data: T;
            if (payloadCodec) {
              data = payloadCodec.decode(success.payload!);
            } else {
              data = JSON.parse(new TextDecoder().decode(success.payload!)) as T;
            }
            yield { status: "success", data };
          } catch (decodeError) {
            console.error(
              "%c[DECODE ERROR]%c Decoding failed: %s",
              "background: #dc3545; color: white; padding: 2px 4px; border-radius: 2px;",
              "color: #888;",
              decodeError instanceof Error ? decodeError.message : "Unknown format"
            );
            yield {
              status: "error",
              error: {
                code: 500,
                message: `Decoding failed: ${decodeError instanceof Error ? decodeError.message : "Unknown format"}`
              }
            };
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/**
 * 辅助函数：拼接两个 Uint8Array
 */
function concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}
