"use client";

import client from "@/lib/api/client";
import { memo } from "react";
import { useQuery } from '@tanstack/react-query';
import { ResponseFactory } from '@/lib/api/response_pb';
import { CityList } from '@/lib/api/chengdu';
import { CityListResponseSchema } from '@/lib/schema/location';

function _CityItem({ city }: { city: { id: string; name: string } }) {
  const randColor = Math.floor(Math.random() * 16777215).toString(16);
  return <span style={{ color: `#${randColor}` }}>{city.name}</span>;
}

const CityItem = memo(_CityItem);


function ClientComponent() {

  const { data, error, isLoading } = useQuery({
    queryKey: ["cityList"],
    queryFn: () => ({ data: { list: [] } })
      // client
      //   .GET("/api/city/cityList", { parseAs: "arrayBuffer" })
      //   .then(async (res) => {
      //     const response = await ResponseFactory.decode(res, CityList);
      //     if (response.status === 'success') {
      //       const result = CityListResponseSchema.safeParse(response);
      //       if (result.success) {
      //         return response;
      //       } else {
      //         throw new Error("Invalid response");
      //       }
      //     } else {
      //       throw new Error(response.error.message);
      //     }
      //   }),
  });


  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>{error?.message}</div>;
  return (
    <div className="text-red-500">
      <pre className={"text-blue-500 whitespace-pre-wrap"}>
{`╔————————————————————————————————————————————————————————————————————————————————————╗
  `}
        {data?.data?.list?.slice(0, 10000).map((city, i) => (
          <CityItem key={i} city={city}/>
        ))}
        {`
╚————————————————————————————————————————————————————————————————————————————————————╝`}
      </pre>
    </div>
  );
}

export default ClientComponent;
