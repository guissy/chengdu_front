import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { SpacePhotoUploadRequestSchema, SpacePhotoUploadResponseSchema } from '@/lib/schema/space'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

/**
 * @desc: 上传空间照片
 * @body: SpacePhotoUploadRequest
 * @response: SpacePhotoUploadResponse
 */

// 配置图片上传参数
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/spaces')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const THUMB_SIZE = 300

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const id = formData.get('id') as string
    const photos = formData.getAll('photos') as File[]

    // 验证请求参数
    const requestResult = SpacePhotoUploadRequestSchema.safeParse({
      id,
      photos,
    })
    if (!requestResult.success) {
      return errorResponse('Invalid parameters', 400, requestResult.error)
    }

    // 检查广告位是否存在
    const space = await prisma.space.findUnique({
      where: { id },
    })

    if (!space) {
      return errorResponse('Space not found', 404)
    }

    // 确保上传目录存在
    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const uploadedUrls: string[] = []
    const errors: string[] = []

    // 处理每个图片文件
    for (const photo of photos) {
      try {
        // 验证文件类型
        if (!ALLOWED_TYPES.includes(photo.type)) {
          throw new Error(`不支持的文件类型: ${photo.type}`)
        }

        // 验证文件大小
        if (photo.size > MAX_FILE_SIZE) {
          throw new Error(`文件大小超过限制: ${photo.size} bytes`)
        }

        // 读取文件内容
        const buffer = Buffer.from(await photo.arrayBuffer())

        // 生成文件名
        const timestamp = Date.now()
        const filename = `${id}_${timestamp}`
        const ext = photo.type.split('/')[1]

        // 处理原图
        const originalFilename = `${filename}.${ext}`
        const originalPath = path.join(UPLOAD_DIR, originalFilename)
        await sharp(buffer)
          .rotate() // 自动旋转
          .withMetadata() // 保留元数据
          .toFile(originalPath)

        // 生成缩略图
        const thumbFilename = `${filename}_thumb.${ext}`
        const thumbPath = path.join(UPLOAD_DIR, thumbFilename)
        await sharp(buffer)
          .rotate() // 自动旋转
          .resize(THUMB_SIZE, THUMB_SIZE, {
            fit: 'cover',
            position: 'centre',
          })
          .withMetadata() // 保留元数据
          .toFile(thumbPath)

        // 生成URL
        const baseUrl = '/uploads/spaces'
        const originalUrl = `${baseUrl}/${originalFilename}`
        uploadedUrls.push(originalUrl)
      } catch (error) {
        errors.push(error instanceof Error ? error.message : '图片处理失败')
      }
    }

    if (errors.length > 0) {
      return errorResponse('Some photos failed to upload', 400, errors)
    }

    // 更新广告位图片列表
    const updatedSpace = await prisma.space.update({
      where: { id },
      data: {
        photo: [...space.photo, ...uploadedUrls],
      },
    })

    const response = {
      id: updatedSpace.id,
      photo: updatedSpace.photo,
    }

    // 验证响应数据
    const responseResult = SpacePhotoUploadResponseSchema.safeParse({ data: response })
    if (!responseResult.success) {
      return errorResponse('Invalid response format', 500, responseResult.error)
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error uploading photos:', error)
    return errorResponse('Internal Server Error', 500)
  }
} 