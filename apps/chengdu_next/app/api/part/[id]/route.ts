import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string(),
})

/**
 * @desc: 获取分区详情
 * @params: { id: string }
 * @response: PartDetail
 */

// 获取分区详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证路径参数
    const result = paramsSchema.safeParse(await params)
    if (!result.success) {
      console.error('Invalid parameters:', result.error);
      return errorResponse('Invalid parameters', 400, result.error)
    }

    // 查询数据库
    const part = await prisma.part.findUnique({
      where: { id: result.data.id },
      include: {
        positions: {
          select: {
            id: true,
            position_no: true,
            total_space: true,
            put_space: true,
            price_base: true,
            verified: true,
            displayed: true,
            type: true,
            type_tag: true,
            photo: true,
            remark: true,
            business_hours: true,
            shop: {
              select: {
                id: true,
                shop_no: true,
              },
            },
          },
        },
      },
    })

    console.log('Database query result:', part ? 'Found' : 'Not found');

    if (!part) {
      return errorResponse('Part not found', 404)
    }

    // 转换数据格式
    const response = {
      id: part.id,
      name: part.name,
      sequence: part.sequence,
      total_space: part.positions.reduce((sum, pos) => sum + pos.total_space, 0),
      positions: part.positions.map(pos => ({
        positionId: pos.id,
        position_no: pos.position_no,
        shopId: pos.shop?.id || null,
        shop_no: pos.shop?.shop_no || null,
        total_space: pos.total_space,
        put_space: pos.put_space,
        price_base: pos.price_base,
        verified: pos.verified,
        displayed: pos.displayed,
        type: pos.type,
        type_tag: pos.type_tag,
        photo: pos.photo,
        remark: pos.remark,
        business_hours: pos.business_hours,
      })),
    }

    console.log('Response data prepared');
    return successResponse(response)
  } catch (error) {
    console.error('Error fetching part:', error)
    return errorResponse('Internal Server Error', 500)
  }
}
