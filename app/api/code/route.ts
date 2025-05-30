import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/lib/subscription";

import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";

const configuration = {
    apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAI(configuration);

const instructionMessage: OpenAI.Chat.ChatCompletionMessage = {
    role: "assistant",
    refusal : "assistant",
    content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const body = await req.json();
        const { messages } = body;
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if(!configuration.apiKey) {
            return new NextResponse("OpenAI API Key not configured", { status: 500 });
        }

        if (!messages) {
            return new NextResponse("Messages are required", { status: 400 });
        }
        const freeTrial = await checkApiLimit();
        const isPro = await checkSubscription();
        if(!freeTrial && !isPro) {
            return new NextResponse("Free trial has expired", { status: 403 });
        }
                
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [instructionMessage, ...messages]
        });
        if(!isPro) {
            await increaseApiLimit();
        }
        return NextResponse.json(response.choices[0].message);

    } catch (error) {
        console.log("[CODE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}