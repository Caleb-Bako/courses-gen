// app/api/check-run-status/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return NextResponse.json({ error: "Missing runId" }, { status: 400 });
  }

  try {
    const result = await fetch(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
      },
    });

    const json = await result.json();

    if (!Array.isArray(json.data) || json.data.length === 0) {
      return NextResponse.json({ status: "Pending" });
    }

    const run = json.data[0];

    if (run.status === "Completed") {
      return NextResponse.json({
        status: "Completed",
        output: Array.isArray(run.output) ? run.output[0] : run.output,
      });
    }

    return NextResponse.json({ status: run.status });
  } catch (err) {
    console.error("Error checking run status:", err);
    return NextResponse.json({ error: "Run check failed" }, { status: 500 });
  }
}
