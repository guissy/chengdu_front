// 使用类型导入而不是直接导入Phaser
import { default as Phaser, type Types } from 'phaser';
import MainScene from './scenes/MusicScene';

// 判断是否为开发环境
const isDev = process.env.NODE_ENV !== 'production';

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO, // 使用字符串代替Phaser.AUTO
  width: 800,
  height: 600,
  backgroundColor: "#030",
  parent: 'game-container',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0.8, x: 0 },
      debug: isDev // 只在开发环境中显示调试信息
    }
  },
  // 添加渲染器设置
  render: {
    pixelArt: false, // 关闭像素艺术模式
    antialias: true, // 启用抗锯齿
    antialiasGL: true, // 启用 WebGL 抗锯齿
    roundPixels: false, // 关闭像素取整
    clearBeforeRender: true, // 确保每帧都清除画布
    transparent: false // 不透明背景
  },
  // 添加缩放设置，使游戏适应不同屏幕
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // 添加音频设置
  audio: {
    disableWebAudio: false,
    noAudio: false
  },
  // 添加输入设置
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: false
  },
  // 添加性能设置
  fps: {
    min: 30,
    target: 60,
    forceSetTimeOut: false,
    deltaHistory: 10
  },
  // 添加场景
  scene: MainScene
};

export default config;