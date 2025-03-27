"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Page() {
  const [header, setHeader] = useState('');
  const [cookies, setCookies] = useState('');
  const urls = [
    "/health",
    "/api/health",
    "/api/city/cityList",
    "/api/part/part-001",
    "/api/position/pos-001",
    "/api/shop/list",
    "/api/shop/listUnbind",
    "/api/shop/shop-001",
    "/api/space/space-001",
    "/api/dashboard/",
  ];

  const [randUrl, setRandUrl] = useState(urls[0]);
  const {
    isLoading,
    error,
    refetch: refreshCityList,
  } = useQuery({
    queryKey: [randUrl],
    queryFn: async () => {
      const response = await fetch(randUrl);
      const salt = response.headers.get('X-Emitter-Salt');
      const cookies = document.cookie.split(';');
      const cookie = cookies.find(c => c.trim().startsWith('emitterSalt='));
      setCookies(cookie ?? '');
      setHeader(salt ?? '');
      return response.json();
    },
  });


  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">商家页面</h1>
      <div>header: {header}</div>
      <div>cookie: {cookies}</div>
      <button
        onClick={() => {
          const randUrl = urls[Math.floor(Math.random() * urls.length)];
          setRandUrl(randUrl);
          refreshCityList();
        }}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-between ${
          isLoading ? "flex items-center justify-center" : ""
        }`}
      >
        Send Message
      </button>
    </div>
  );
}
