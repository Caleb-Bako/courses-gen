// app/api/ai-timtable-chat/route.ts
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json({ error: "Missing user input" }, { status: 400 });
    }

    const result = await inngest.send({
      name: "AiTableAgent",
      data: { userInput },
    });

    const runId = result?.ids?.[0];

    if (!runId) {
      return NextResponse.json({ error: "Failed to get run ID" }, { status: 500 });
    }

    return NextResponse.json({ runId });
  } catch (err) {
    console.error("Error in ai-timtable-chat:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
