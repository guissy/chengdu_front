import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { NextResponse } from "next/server";

export interface ProtoMessage<T> {
  encode(data: T, writer?: BinaryWriter): BinaryWriter;
  decode(buffer: Uint8Array | BinaryReader): T;
  toJSON?(data: T): unknown; // Optional for flexibility
}

interface SuccessData {
  code: number;
  payload: Uint8Array;
}

export const SuccessProto: ProtoMessage<SuccessData> = {
  encode(data: SuccessData, writer = new BinaryWriter()): BinaryWriter {
    writer.uint32(1 << 3 | 0).int32(data.code);
    writer.uint32(2 << 3 | 2).bytes(data.payload);
    return writer;
  },

  decode(input: Uint8Array | BinaryReader): SuccessData {
    const reader = input instanceof Uint8Array ? new BinaryReader(input) : input;
    let code = 200; // Default success code
    let payload = new Uint8Array(0);

    while (reader.pos < reader.len) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: code = reader.int32(); break;
        case 2: payload = reader.bytes() as Uint8Array<ArrayBuffer>; break;
        default: reader.skip(tag & 7); break;
      }
    }
    return { code, payload };
  },

  toJSON(data: SuccessData): Record<string, unknown> {
    return {
      code: data.code,
      payload: Buffer.from(data.payload).toString("utf-8") // Fallback to utf-8 for JSON
    };
  }
};

// Error Response Definition
interface ErrorData {
  code: number;
  message: string;
  details?: Uint8Array;
}

export const ErrorProto: ProtoMessage<ErrorData> = {
  encode(data: ErrorData, writer = new BinaryWriter()): BinaryWriter {
    writer.uint32(1 << 3 | 0).int32(data.code);
    writer.uint32(2 << 3 | 2).string(data.message);
    if (data.details) writer.uint32(3 << 3 | 2).bytes(data.details);
    return writer;
  },

  decode(input: Uint8Array | BinaryReader): ErrorData {
    const reader = input instanceof Uint8Array ? new BinaryReader(input) : input;
    let code = 500;
    let message = "";
    let details: Uint8Array | undefined;

    while (reader.pos < reader.len) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: code = reader.int32(); break;
        case 2: message = reader.string(); break;
        case 3: details = reader.bytes(); break;
        default: reader.skip(tag & 7); break;
      }
    }
    return { code, message, details };
  },

  toJSON(data: ErrorData): Record<string, unknown> {
    const result: Record<string, unknown> = { code: data.code, message: data.message };
    if (data.details) result.details = Buffer.from(data.details).toString("utf-8");
    return result;
  }
};

// Response Type Union
export type SuccessBody<T> = { status: "success"; data: T }
export type ResponseBody<T> = SuccessBody<T> | { status: "error"; error: ErrorData };


// Enhanced Response Factory
export class ResponseFactory {
  static success<T>(
    data: T,
    codec?: ProtoMessage<T>,
    code = 200
  ): NextResponse {
    try {
      const payload = codec
        ? codec.encode(data).finish()
        : new TextEncoder().encode(JSON.stringify(data));

      if (!payload.length) throw new Error("Empty payload");

      const successData: SuccessData = { code, payload };
      const buffer = SuccessProto.encode(successData);

      return new NextResponse(buffer.finish(), {
        status: code,
        headers: { "Content-Type": "application/x-protobuf" }
      });
    } catch (error) {
      return this.error(`Encoding failed: ${(error as Error).message}`, 500);
    }
  }

  static error(message: string, code = 500, details?: unknown): NextResponse {
    try {
      const errorData: ErrorData = {
        code,
        message,
        details: details ? new TextEncoder().encode(JSON.stringify(details)) : undefined
      };
      const buffer = ErrorProto.encode(errorData);

      return new NextResponse(buffer.finish(), {
        status: code,
        headers: { "Content-Type": "application/x-protobuf" }
      });
    } catch (error) {
      const fallback = new TextEncoder().encode(
        JSON.stringify({ code: 500, message: "Critical encoding failure" })
      );
      return new NextResponse(fallback, {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // Decode Utility
  static async decode<T>(
    res: {
      data: ArrayBuffer;
      error?: undefined;
    } | {
      data?: never;
      error: unknown; // More specific error type if your Paths schema defines it
    },
    payloadCodec?: ProtoMessage<T>
  ): Promise<ResponseBody<T>> {
    const buffer = res.data instanceof ArrayBuffer ?  res.data : Buffer.from(res.error as string, "utf-8");
    const data = new Uint8Array(buffer);
    if (data.length === 0) {
      return {
        status: "error",
        error: { code: 500, message: "Empty buffer received" }
      };
    }

    const reader = new BinaryReader(data);

    try {
      // First, attempt to decode as ErrorProto
      reader.pos = 0;
      const error = ErrorProto.decode(reader);
      if (error.message && error.code >= 400) {
        return { status: "error", error };
      }

      // If not a valid error, assume SuccessProto
      reader.pos = 0;
      const success = SuccessProto.decode(reader);

      if (!payloadCodec) {
        return { status: "success", data: success.payload as unknown as T };
      }

      const payloadData = payloadCodec.decode(success.payload);
      return { status: "success", data: payloadData };

    } catch (error) {
      return {
        status: "error",
        error: {
          code: 500,
          message: "Decoding failed: invalid buffer format"
        }
      };
    }
  }
}
