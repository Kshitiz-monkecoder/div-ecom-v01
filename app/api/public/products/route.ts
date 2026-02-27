import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/product-helpers";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        name: true,
        description: true,
        capacity: true,
        category: true,
        images: true,
        price: true,
      },
    });

    return NextResponse.json(
      products.map((p) => ({
        ...p,
        images: parseImages(p.images),
      }))
    );
  } catch (error) {
    console.error("Public products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

