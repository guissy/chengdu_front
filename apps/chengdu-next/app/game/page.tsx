"use client";
import { useEffect, useRef } from "react";
// import dynamic from 'next/dynamic';
// import config from './config';

// 将游戏实例保存在ref中以便管理生命周期
export async function startGame() {
  // 确保只在浏览器环境中运行
  if (typeof window === "undefined") return null;
  // 动态导入Phaser以避免服务器端渲染问题
  const { default: Phaser } = await import("phaser");
  const { default: config } = await import("./config");
  return new Phaser.Game(config);
}

export default function GamePage() {
  // 使用类型导入避免直接引用Phaser
  const gameRef = useRef<any>(null);

  useEffect(() => {
    // 确保只在客户端执行游戏初始化
    if (typeof window !== "undefined") {
      // 初始化游戏（异步）
      const initGame = async () => {
        gameRef.current = await startGame();
      };

      initGame();

      // 组件卸载时清理游戏实例
      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }
  }, []);

  return <div id="game-container" className="h-full" />;
}
