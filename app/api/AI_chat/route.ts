import { ai } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { prompt } = await request.json();
    try {
        const response = await ai.models.generateContent({
            model: "gemma-3n-e4b-it",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const ai_resp = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return NextResponse.json({ result: ai_resp }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ result: e }, { status: 400 });
    }
}