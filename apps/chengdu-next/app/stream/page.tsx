"use client";

import { useState, useEffect, memo, useRef } from 'react';
import dayjs from 'dayjs'
import { ResponseFactory } from '@/lib/api/response_stream';
import { AuditLog } from '@/lib/api/chengdu';
import autoAnimate from '@formkit/auto-animate';


function Page() {
  const [items, setItems] = useState<Array<AuditLog>>([]);
  const [error, setError] = useState<string | null>(null);
  const [header, setHeader] = useState('');
  const [cookies, setCookies] = useState('');
  useEffect(() => {
    const loadStream = async () => {
      try {
        const response = await fetch('/api/stream');
        const salt = response.headers.get('X-Emitter-Salt');
        const cookies = document.cookie.split(';');

        const cookie = cookies.find(c => c.trim().startsWith('emitterSalt='));
        setCookies(cookie ?? '');
        setHeader(salt ?? '');
        if (!response.body) throw new Error("Empty response body");
        for await (const result of ResponseFactory.decodeStream(response.body, AuditLog)) {
          if (result.status === "success") {
            if (result.data?.userAgent !== 'anonymous') {
              setItems(prev => [result.data, ...prev]); // 增量更新
            }
          } else {
            setError(result.error.message);
            break;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    loadStream();
  }, []);

  console.log('ClientStream render');


  const parent = useRef(null)

  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent])


  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">实时数据流</h1>
      <div>header: {header}</div>
      <div>cookie: {cookies}</div>
      <ul className="space-y-2 container mx-auto max-w-3xl" ref={parent}>
        {items.map((item) => (
          <li key={item.id+Math.random()} className="p-2 border rounded">
            {/*#{item.id}: {item.content} {dayjs(item.operationTime).format('HH:mm:ss')}*/}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* <span className="text-gray-400">{dayjs(item.operationTime).format('HH:mm:ss')}</span> */}
                <span className="text-gray-400">{item.id?.split(' ')[0]}</span>
                <span className="mx-2">|</span>
                <span className="text-gray-400">{item.id?.split(' ')[1]}</span>
              </div>
              <div className="text-gray-200">{item.content}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(Page);
