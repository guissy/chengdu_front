import { prisma } from '@/app/lib/prisma'
import { spaceUpdateSchema } from '@/app/lib/schemas/space'
import { errorResponse, successResponse } from '@/app/lib/utils/response'
import { NextRequest } from 'next/server'
import { Space, SpaceSite, SpaceStability, SpaceState, SpaceType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = spaceUpdateSchema.parse(body)

    const {
      id,
      type,
      setting,
      count,
      state,
      price_factor,
      tag,
      site,
      stability,
      photo,
      description,
      design_attention,
      construction_attention,
    } = validatedData

    // 验证广告位是否存在
    const existingSpace = await prisma.space.findUnique({
      where: { id },
    }) as Space

    if (!existingSpace) {
      return errorResponse('广告位不存在', 404)
    }

    // 更新广告位
    await prisma.space.update({
      where: { id },
      data: {
        type: type as unknown as SpaceType,
        setting,
        count,
        state: state as unknown as SpaceState,
        price_factor,
        tag,
        site: site as unknown as SpaceSite,
        stability: stability as unknown as SpaceStability,
        photo,
        description,
        design_attention,
        construction_attention,
      },
    })

    return successResponse(null)
  } catch (error) {
    console.error('Error updating space:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return errorResponse('请求数据验证失败', 400, error)
      }
    }
    return errorResponse('Internal Server Error')
  }
}
