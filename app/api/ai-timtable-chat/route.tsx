import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req:any) {
    const {userInput} = await req.json();

    const resultId = await inngest.send({
        name:'AiTableAgent',
        data:{
            userInput:userInput
        }
    });
    const runID = resultId?.ids[0];
     let runStatus: any; 
    while (true) {
        runStatus = await getRun(runID);
        if (
            runStatus &&
            Array.isArray(runStatus.data) &&
            runStatus.data.length > 0
        ) {
            if (runStatus.data[0]?.status === 'Completed') {
                break;
            }
        } else {
            console.warn("Inngest API response 'data' is not an array or is empty:");
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (runStatus && runStatus.data && runStatus.data.length > 0) {
        return NextResponse.json(runStatus.data?.[0].output?.output[0]);
    } else {
        return NextResponse.json({ error: "No completed run data found or response malformed" }, { status: 500 });
    }
}

export async function getRun(runId:string) {
    const result = await fetch(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
                headers: {
                    Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
                },  
            })
    const json = await result.json(); 
    return json;      
}