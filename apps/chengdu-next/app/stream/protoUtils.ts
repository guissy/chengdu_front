import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import type { ProtoMessage } from '@/lib/api/response_pb';

export interface MyMessage {
  id: number;
  name: string;
}

// 解码器
export function decodeMyMessage(bytes: Uint8Array): MyMessage {
  const reader = new BinaryReader(bytes);
  let id = 0, name = "";
  while (reader.pos < reader.len) {
    const tag = reader.uint32();
    switch (tag >>> 3) {
      case 1: id = reader.int32(); break;
      case 2: name = reader.string(); break;
      default: reader.skip(tag & 7); break;
    }
  }
  return { id, name };
}

// Proto 消息定义
export const MyProtoMessage: ProtoMessage<MyMessage> = {
  encode: (msg, writer) => {
    if (!writer) writer = new BinaryWriter();
    writer.uint32(0x08).int32(msg.id);
    writer.uint32(0x12).string(msg.name);
    return writer;
  },
  decode: (bytes) => decodeMyMessage(bytes as Uint8Array)
};

