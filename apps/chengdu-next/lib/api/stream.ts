import { useQuery, useQueryClient } from "@tanstack/react-query";

type StreamProcessorParams<T> = {
  stream: ReadableStream<Uint8Array>;
  onData: (chunk: { data: T }) => void;
  onError?: (error: Error) => void;
};

export async function processJSONStream<T>({
  stream,
  onData,
  onError,
}: StreamProcessorParams<T>): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 处理可能的分块 JSON（假设每个 chunk 是完整 JSON 对象）
      try {
        let buffer2 = buffer;
        if (buffer.endsWith(",")) {
          buffer2 = buffer.slice(0, -1);
        }
        if (!buffer2.endsWith("]}}")) {
          buffer2 += "]}}";
        }
        const parsed = JSON.parse(buffer2) as { data: T };
        onData(parsed);
        // buffer = ''; // 清空缓冲区
      } catch (err: unknown) {
        // 不完整 JSON 继续累积
        console.error(err);
      }
    }

    // 处理最后残留数据
    if (buffer.trim()) {
      const finalData = JSON.parse(buffer) as { data: T };
      onData(finalData);
    }
  } catch (err) {
    onError?.(
      err instanceof Error ? err : new Error("Stream processing failed")
    );
  } finally {
    reader.releaseLock();
  }
}

// hooks/useStreamingQuery.ts

type StreamingQueryOptions<T> = {
  queryKey: unknown[];
  queryFn: () => Promise<ReadableStream<Uint8Array>>;
  onData?: (data: { data: T }) => void;
};

export function useStreamingQuery<T>({
  queryKey,
  queryFn,
}: StreamingQueryOptions<T>) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey,
    queryFn: async () => {
      const stream = await queryFn();
      let accumulatedData: { data: T } | null = null;

      await processJSONStream<T>({
        stream,
        onData: (chunk) => {
          accumulatedData = chunk; // 或合并逻辑
          queryClient.setQueryData(queryKey, chunk);
        },
      });

      return accumulatedData as unknown as { data: T }; // 最终完整数据（可选）
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity, // 流数据不需要自动刷新
  });
}
