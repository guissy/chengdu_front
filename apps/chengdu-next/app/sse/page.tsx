"use client";

import { useState, useEffect, memo, useRef } from 'react';
import dayjs from 'dayjs'
import { AuditLog } from '@/lib/api/chengdu';
import autoAnimate from '@formkit/auto-animate';

function AuditStreamPage() {
  const [items, setItems] = useState<Array<AuditLog>>([]);
  const [error, setError] = useState<string | null>(null);
  const [header, setHeader] = useState('');
  const [cookies, setCookies] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  // 自动动画
  const parent = useRef<HTMLUListElement>(null)
  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent])

  useEffect(() => {
    // 初始化SSE连接
    const eventSource = new EventSource('/api/sse');
    eventSourceRef.current = eventSource;

    // 消息处理
    eventSource.onmessage = async (event) => {
      try {
        // Base64解码
        const binaryString = atob(event.data);
        const buffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          buffer[i] = binaryString.charCodeAt(i);
        }

        // Protobuf解码
        const logEntry = AuditLog.decode(buffer);

        // 更新状态（带去重检查）
        setItems(prev => {
          const exists = prev.some(item => item.id === logEntry.id);
          return exists ? prev : [logEntry, ...prev.slice(0, 49)] // 保持最新50条
        });
      } catch (err) {
        console.error('Decoding failed:', err);
        setError(err instanceof Error ? err.message : "解码错误");
      }
    };

    // 错误处理
    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setError('连接发生错误，正在尝试重连...');
      eventSource.close();
    };

    // 组件卸载时清理
    return () => {
      eventSource.close();
    };
  }, []);

  // 获取额外头信息（如果需要）
  useEffect(() => {
    fetch('/api/sse')
      .then(res => {
        setHeader(res.headers.get('X-Emitter-Salt') || '');
        setCookies(document.cookie.split(';').find(c => c.trim().startsWith('emitterSalt=')) || '');
      })
      .catch(console.error);
  }, []);

  if (error) return (
    <div className="p-4">
      <div className="text-red-500 p-4 border rounded-lg bg-red-50">{error}</div>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">审计日志实时流</h1>
      <div className="mb-4 text-sm text-gray-600">
        <p>Header: {header}</p>
        <p>Cookie: {cookies}</p>
      </div>

      <ul className="space-y-2 container mx-auto max-w-3xl" ref={parent}>
        {items.map((item) => (
          <li
            key={item.id} // 使用稳定ID代替随机数
            className="p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <time className="text-gray-400 text-sm">
                  {dayjs(item.operationTime).format('HH:mm:ss')}
                </time>
                <span className="text-gray-400 text-sm">|</span>
                <span className="font-mono text-blue-600 text-sm">
                  {item.id?.split(' ')[0]}
                </span>
              </div>
              <div className="text-gray-800 max-w-[60%] truncate">
                {item.content}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(AuditStreamPage);
