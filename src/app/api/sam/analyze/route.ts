import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const API_BASE = process.env.NEXT_PUBLIC_SAM_API_URL || "https://sam.gavinlou.com";

async function getSamApiKey(): Promise<string> {
  // In production, get from Cloudflare secrets
  const { env } = getCloudflareContext();
  if (env?.SAM_API_KEY) {
    return env.SAM_API_KEY;
  }
  
  // For development, use environment variable or default
  return process.env.SAM_API_KEY || "sam-demo-key-123";
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = await getSamApiKey();
    const formData = await request.formData();
    
    // Forward the request to the SAM service
    const response = await fetch(`${API_BASE}/analyze_image`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`SAM API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('SAM analyze API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze image' 
      },
      { status: 500 }
    );
  }
} 