import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Parse the request body
  const { prompt } = await request.json();

  const endPoint = "https://api.deepseek.com/chat/completions";

  try {
    const response = await fetch(endPoint, {
      method: "POST",
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "你是一个专业的json代码生成模型，按需提供规范的代码，现在输入问题",
          },
          { role: "user", content: prompt },
        ],
        stream: true,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
    });

    if (!response.body) {
      throw new Error("Response body is null");
    }

    // Set headers for streaming response
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    };

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // Create a ReadableStream for streaming the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              console.log(`🦐🦐🦐 chunk: ${chunk}`); // Replace with your preferred logging
              controller.enqueue(new TextEncoder().encode(chunk));
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
      cancel() {
        reader.cancel();
      },
    });

    // Return the streaming response
    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error("Network error:", error);
    return new NextResponse(`Error: Network error - ${error}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
