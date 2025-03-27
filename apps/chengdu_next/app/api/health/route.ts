import { successResponse } from '@/lib/api/response'
import prisma from '@/lib/prisma'

/**
 * @desc: 健康检查接口
 * @response: { status: string, timestamp: string, database: string, error?: string }
 */

export async function GET() {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`
    
    return successResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch (error) {
    return successResponse({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
} 