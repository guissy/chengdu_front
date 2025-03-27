import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { SpaceBatchDeleteRequestSchema, SpaceBatchDeleteResponseSchema } from '@/lib/schema/space'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求参数
    const requestResult = SpaceBatchDeleteRequestSchema.safeParse(body)
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    const { ids } = requestResult.data

    // 检查所有广告位是否存在
    const existingSpaces = await prisma.space.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    const total = ids.length
    let success = 0
    const errors: { id: string; message: string }[] = []

    // 处理每个广告位
    for (const space of existingSpaces) {
      try {
        // 删除关联的图片文件
        const uploadDir = path.join(process.cwd(), 'public')
        for (const photoUrl of space.photo) {
          try {
            const photoPath = path.join(uploadDir, photoUrl)
            const thumbPath = photoPath.replace(/(\.[^.]+)$/, '_thumb$1')
            await fs.unlink(photoPath)
            await fs.unlink(thumbPath)
          } catch (error) {
            console.error(`Error deleting photo files for space ${space.id}:`, error)
          }
        }

        // 删除广告位记录
        await prisma.space.delete({
          where: { id: space.id },
        })

        success++
      } catch (error) {
        errors.push({
          id: space.id,
          message: error instanceof Error ? error.message : '删除失败',
        })
      }
    }

    // 检查是否有未找到的广告位
    const notFoundIds = ids.filter(id => 
      !existingSpaces.some(space => space.id === id)
    )
    for (const id of notFoundIds) {
      errors.push({
        id,
        message: '广告位不存在',
      })
    }

    const response = {
      total,
      success,
      failed: total - success,
      errors,
    }

    // 验证响应数据
    const responseResult = SpaceBatchDeleteResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error deleting spaces:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 