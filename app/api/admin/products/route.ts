import { NextResponse } from "next/server";
import { getAllProducts } from "@/app/actions/admin";

export async function GET() {
  try {
    const products = await getAllProducts();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

