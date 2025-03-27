import { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { SpaceExportRequestSchema } from '@/lib/schema/space'
import { SpaceType, SpaceState, SpaceSite, SpaceStability, Space, Shop } from '@prisma/client'
import * as XLSX from 'xlsx'

/**
 * @desc: 导出空间数据
 * @body: SpaceExportRequest
 * @response: Buffer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = SpaceExportRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { shopId, type, state, site, stability, format } = requestResult.data

    // 构建查询条件
    const where = {
      ...(shopId ? { shopId } : {}),
      ...(type ? { type: type as SpaceType } : {}),
      ...(state ? { state: state as SpaceState } : {}),
      ...(site ? { site: site as SpaceSite } : {}),
      ...(stability ? { stability: stability as SpaceStability } : {}),
    }

    // 查询数据
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
      orderBy: {
        createdAt: 'desc',
      },
    }) as (Space & { shop: Shop })[]

    // 转换数据格式
    const data = spaces.map(space => ({
      '商家编号': space.shop.shop_no,
      // '商家名称': space.shop.name,
      '广告位类型': space.type,
      '数量': space.count,
      '状态': space.state,
      '价格因子': space.price_factor,
      '分类标签': space.tag || '',
      '位置': space.site || '',
      '稳定性': space.stability || '',
      '投放推介': space.description || '',
      '设计注意事项': space.design_attention || '',
      '施工注意事项': space.construction_attention || '',
      '创建时间': space.createdAt.toLocaleString(),
      '更新时间': space.updatedAt.toLocaleString(),
    }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 商家编号
      { wch: 20 }, // 商家名称
      { wch: 15 }, // 广告位类型
      { wch: 10 }, // 数量
      { wch: 10 }, // 状态
      { wch: 10 }, // 价格因子
      { wch: 15 }, // 分类标签
      { wch: 15 }, // 位置
      { wch: 15 }, // 稳定性
      { wch: 30 }, // 投放推介
      { wch: 30 }, // 设计注意事项
      { wch: 30 }, // 施工注意事项
      { wch: 20 }, // 创建时间
      { wch: 20 }, // 更新时间
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, '广告位列表')

    // 生成文件
    const buffer = format === 'csv' 
      ? XLSX.write(wb, { type: 'buffer', bookType: 'csv' })
      : XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // 设置响应头
    const headers = new Headers()
    headers.set('Content-Type', format === 'csv' 
      ? 'text/csv; charset=utf-8'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    headers.set('Content-Disposition', `attachment; filename=spaces.${format}`)

    return new Response(buffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error exporting spaces:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 