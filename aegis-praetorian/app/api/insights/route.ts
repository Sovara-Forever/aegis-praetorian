import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { query, context } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: `You are Praetorian, an advanced AI intelligence system specialized in automotive inventory analysis and market intelligence. 

Your role is to:
- Analyze automotive inventory data with precision
- Identify pricing anomalies and market opportunities
- Provide actionable insights for dealers and inventory managers
- Detect competitive advantages and market trends
- Be concise, data-driven, and strategic in your responses

When analyzing data:
- Focus on actionable insights
- Highlight key metrics and trends
- Identify opportunities and risks
- Provide specific recommendations
- Use clear, professional language`,
      messages: [
        {
          role: "user",
          content: `Analyze the following automotive inventory context and answer the query.

CONTEXT:
${JSON.stringify(context, null, 2)}

QUERY:
${query}

Provide a detailed, actionable analysis.`,
        },
      ],
    });

    const textContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      insight: textContent,
      model: "claude-3-5-sonnet-20241022",
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
