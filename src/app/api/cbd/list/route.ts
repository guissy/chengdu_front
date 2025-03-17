import { prisma } from '@/app/lib/prisma'
import { cbdListResponseSchema, cbdListSchema } from '@/app/lib/schemas/cbd'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { ErrorWithName } from '@/app/lib/types/prisma'
import { CBD, Part } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = cbdListSchema.parse(body)

    const { districtId } = validatedData

    // 查询数据库，找出所有商圈
    const cbds = await prisma.cBD.findMany({
      where: {
        districtId: districtId,
      },
      include: {
        parts: true,
      },
    }) as (CBD & { parts: Part[] })[]

    // 处理返回数据
    const formattedCbds = cbds.map((cbd) => ({
      ...cbd,
      cityId: (cbd as unknown as { cityId: string }).cityId,
      total_part: cbd.parts?.length ?? 0,
    }))

    const responseData = {
      list: formattedCbds,
    }

    // 验证响应数据
    cbdListResponseSchema.parse(responseData)

    return successResponse(responseData)
  } catch (error) {
    console.error('Error fetching CBD list:', error)
    const err = error as ErrorWithName
    if (err.name === 'ZodError') {
      return errorResponse('请求数据验证失败', 400, err.errors)
    }
    return errorResponse('Internal Server Error')
  }
}
