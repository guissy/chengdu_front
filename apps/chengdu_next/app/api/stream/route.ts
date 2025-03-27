import { ResponseFactory } from '@/lib/api/response_stream';
import { MyProtoMessage } from '@/app/stream/protoUtils';
import { emitter, emitterSalt } from '@/lib/emitter';
import { AuditLog } from '@/lib/api/chengdu';

/**
 * @desc: 获取审计日志的流式数据
 * @response: ReadableStream<AuditLog>
 */

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
/**
 * 异步生成器：流式发送数据时带上有趣的文本和 emoji✨
 */
async function* generateData() {
  while (true) {
    const newData = await Promise.race([
      new Promise<AuditLog>(resolve =>
        emitter.once('newAuditLog', resolve)
      ),
      delay(5000).then(() => null) // 5秒后超时
    ]);
    if (newData) {
      newData.id = emitterSalt;
      yield newData;
    }
  }
}

export async function GET() {
  return ResponseFactory.streamSuccess(generateData, AuditLog);
}
