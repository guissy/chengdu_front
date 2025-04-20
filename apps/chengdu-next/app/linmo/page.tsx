import React from 'react';
import Mazu from './Mazu';

export default function Linmo() {
  // URL 编码后的防伪背景 SVG 数据
  const bgSVG = (`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <defs>
        <pattern id="pattern" patternUnits="userSpaceOnUse" width="20" height="20">
          <path d="M0,10 L20,10" stroke="#a7a7a7" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pattern)"/>
    </svg>
  `);

  // URL 编码后的国徽叠加 SVG 数据（若需要调整，只需保证正确的空格和编码）
  const emblemSVG = (`
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
      <path d="M25 5 L30 20 H20 L25 5 Z" fill="red"/>
    </svg>
  `);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div
        className="relative w-[343px] h-[216px] border border-gray-300 rounded-lg overflow-hidden"
        style={{
          fontFamily: "'华文细黑', 'SimHei', sans-serif",
          background: "linear-gradient(to bottom right, #e6f0fa, #f5faff)",
          backgroundImage: `url("data:image/svg+xml;utf8,${bgSVG}")`,
          backgroundRepeat: 'repeat',
        }}
      >
        {/* National Emblem Overlay (subtle) */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,${emblemSVG}")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <div className="flex pt-7 pb-6 px-5">
          {/* Left: Information Section */}
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-gray-800 leading-4 flex flex-col gap-2">
              <div className="flex items-center mb-1.5">
                <span className="w-[36px] font-bold">姓名</span>
                <span className="text-[12px] font-medium">林默</span>
              </div>
              <div className="flex items-center mb-1.5">
                <span className="w-[36px] font-bold">性别</span>
                <span className="text-[12px] font-medium mr-2">女</span>
                <span className="w-[36px] font-bold ml-6">民族</span>
                <span className="text-[12px] font-medium">汉</span>
              </div>
              <div className="flex items-center mb-1.5">
                <span className="w-[36px] font-bold">出生</span>
                <span className="text-[12px] font-medium">960年3月23日</span>
              </div>
              <div className="flex items-start">
                <span className="w-[36px] font-bold">住址</span>
                <span className="text-[12px] font-medium leading-tight max-w-[140px]">
                  福建省莆田市湄洲岛上林村1号
                </span>
              </div>
            </div>
          </div>

          {/* Right: Photo Section (无框证件照) */}
          <div className="w-[80px] h-[100px] ml-2">
            <Mazu className="mx-auto block" />
          </div>
        </div>

        {/* Bottom: ID Number Section */}
        <div className="absolute bottom-0 w-full px-3 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-800">
              公民身份号码
            </span>
            <span className="text-[14px] font-mono text-gray-900 tracking-wide">
              350321096003237000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
