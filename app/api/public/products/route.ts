import { NextResponse } from "next/server";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET() {
  try {
    const response = await divyEngineFetch<{
      success: boolean;
      data: Array<{
        id: string;
        name: string;
        description: string;
        capacity: string;
        category: string;
        images: string[];
        price: number;
      }>;
    }>("/api/ecom/public/products");

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Public products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
