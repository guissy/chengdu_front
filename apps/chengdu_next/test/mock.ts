import { ProtoMessage } from '@/lib/api/response_pb';
import { BinaryReader, BinaryWriter } from '@bufbuild/protobuf/wire';

export interface UserData {
  id: number;
  name: string;
}

export const UserProto: ProtoMessage<UserData> = {
  encode(data: UserData, writer = new BinaryWriter()): BinaryWriter {
    writer.uint32(1 << 3 | 0).int32(data.id);
    writer.uint32(2 << 3 | 2).string(data.name);
    return writer;
  },

  decode(input: Uint8Array | BinaryReader): UserData {
    const reader = input instanceof Uint8Array ? new BinaryReader(input) : input;
    let id = 0;
    let name = "";

    while (reader.pos < reader.len) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: id = reader.int32(); break;
        case 2: name = reader.string(); break;
        default: reader.skip(tag & 7); break;
      }
    }
    return { id, name };
  },

  toJSON(data: UserData): Record<string, unknown> {
    return { id: data.id, name: data.name };
  }
};
