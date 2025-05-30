import Replicate from "replicate";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
});


export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const contentType = req.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            return new NextResponse("Content-Type must be application/json", { status: 400 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return new NextResponse("Invalid JSON payload", { status: 400 });
        }
        
        const { prompt } = body;
        if (!prompt) {
            return new NextResponse("Prompt is required", { status: 400 });
        }
        const freeTrial = await checkApiLimit();
                const isPro = await checkSubscription();
                if(!freeTrial && !isPro) {
                    return new NextResponse("Free trial has expired", { status: 403 });
                }
        const response = await replicate.run(
            "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
            {
                input: {
                    prompt_a: prompt,
                },
            }
        );
        if(!isPro) {
        await increaseApiLimit();
        }
        return NextResponse.json(response);

    } catch (error) {
        console.log("[MUSIC_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}