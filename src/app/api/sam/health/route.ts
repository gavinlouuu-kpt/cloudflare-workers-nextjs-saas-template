import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_SAM_API_URL || "https://sam.gavinlou.com";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        model_loaded: false,
        error: 'Cannot connect to SAM service'
      },
      { status: 500 }
    );
  }
} 