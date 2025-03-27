import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { SpaceSearchRequestSchema, SpaceSearchResponseSchema } from '@/lib/schema/space'
import { SpaceType, SpaceState, SpaceSite, SpaceStability } from '@prisma/client'

/**
 * @desc: 搜索空间
 * @body: SpaceSearchRequest
 * @response: SpaceSearchResponse
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = SpaceSearchRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const {
      keyword,
      shopId,
      type,
      state,
      site,
      stability,
      page,
      pageSize,
    } = requestResult.data

    // 构建查询条件
    const where = {
      ...(shopId ? { shopId } : {}),
      ...(type ? { type: type as SpaceType } : {}),
      ...(state ? { state: state as SpaceState } : {}),
      ...(site ? { site: site as SpaceSite } : {}),
      ...(stability ? { stability: stability as SpaceStability } : {}),
      OR: [
        { description: { contains: keyword } },
        { design_attention: { contains: keyword } },
        { construction_attention: { contains: keyword } },
        { tag: { contains: keyword } },
        {
          shop: {
            OR: [
              { name: { contains: keyword } },
              { shop_no: { contains: keyword } },
            ],
          },
        },
      ],
    }

    // 查询总数
    const total = await prisma.space.count({ where })

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize)

    // 查询列表数据
    const spaces = await prisma.space.findMany({
      where,
      include: {
        shop: {
          select: {
            id: true,
            shop_no: true,
            // name: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 转换数据格式
    const list = spaces.map(space => ({
      id: space.id,
      type: space.type,
      count: space.count,
      state: space.state,
      price_factor: space.price_factor,
      tag: space.tag,
      site: space.site,
      stability: space.stability,
      photo: space.photo,
      description: space.description,
      design_attention: space.design_attention,
      construction_attention: space.construction_attention,
      shop: {
        id: space.shop.id,
        shop_no: space.shop.shop_no,
        // name: space.shop.name,
      },
    }))

    const response = {
      list,
      total,
      page,
      pageSize,
      totalPages,
    }

    // 验证响应数据
    const responseResult = SpaceSearchResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error searching spaces:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 