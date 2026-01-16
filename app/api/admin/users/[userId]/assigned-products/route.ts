import { NextResponse } from "next/server";
import { getUserAssignedProducts } from "@/app/actions/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const products = await getUserAssignedProducts(userId);

    return NextResponse.json({
      success: true,
      productIds: products.map((product) => product.id),
    });
  } catch (error: any) {
    console.error("Error fetching assigned products:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

