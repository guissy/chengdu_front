"use client";
// import {Button} from "chengdu_ui";
import Link from "next/link";
// import { Suspense } from "react";
// import { FiArrowLeft } from "react-icons/fi";
// import {LoadingSpinner} from 'chengdu_ui';

// export const metadata = {
//   title: "404 Not Found - Business System",
// };

export default function NotFound() {
  return (
    // <Suspense fallback={<LoadingSpinner />}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-base-100 p-6 text-center">
        <div className="max-w-md">
          <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>
          <h2 className="mb-4 text-3xl font-semibold">页面未找到</h2>
          <p className="mb-8 text-base-content/70">
            您访问的页面不存在或已被移除。请检查URL地址是否正确，或返回首页继续浏览。
          </p>
          <Link href="/">
            {/* <Button
              variant="primary"
              icon={<FiArrowLeft className="h-5 w-5" />}
            >
              返回首页
            </Button> */}
          </Link>
        </div>
      </div>
    // </Suspense>
  );
}

