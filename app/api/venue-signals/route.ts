import { NextRequest, NextResponse } from "next/server";
import { buildVenueSearchQuery, draftsFromTavilyResults, type TavilyResult } from "../../../lib/venueSignals";

type TavilySearchResponse = {
  results?: Array<{
    title?: unknown;
    url?: unknown;
    content?: unknown;
  }>;
  usage?: {
    credits?: number;
  };
};

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const input = isRecord(body) && typeof body.query === "string" ? body.query : "";
  const query = buildVenueSearchQuery(input);
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Tavily API key is not set. Add TAVILY_API_KEY to .env.local, then restart the dev server.",
        query,
        drafts: []
      },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 8,
      chunks_per_source: 2,
      topic: "general",
      include_answer: false,
      include_raw_content: false,
      include_images: false,
      include_usage: true,
      safe_search: true
    })
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      {
        error: `Tavily search failed with ${response.status}. ${message}`,
        query,
        drafts: []
      },
      { status: response.status }
    );
  }

  const data = (await response.json()) as TavilySearchResponse;
  const results: TavilyResult[] = (data.results ?? []).flatMap((result) => {
    if (typeof result.title !== "string" || typeof result.url !== "string" || typeof result.content !== "string") {
      return [];
    }

    return [{ title: result.title, url: result.url, content: result.content }];
  });

  return NextResponse.json({
    query,
    drafts: draftsFromTavilyResults(query, results),
    credits: data.usage?.credits ?? null
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
