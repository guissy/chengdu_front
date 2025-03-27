import { ResponseFactory } from '@/lib/api/response_pb'
import prisma from '@/lib/prisma'
import { CityListResponseSchema } from '@/lib/schema/location'
import { CityList } from '@/lib/api/chengdu';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    const response = {
      list: cities,
    }
    // 验证响应数据
    const result = CityListResponseSchema.safeParse({ data: response })
    if (!result.success) {
      return ResponseFactory.error('Invalid response format', 500)
    }

    // return successResponse(response, CityList);
    return ResponseFactory.success(response, CityList)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return ResponseFactory.error('Internal Server Error', 500)
  }
}
