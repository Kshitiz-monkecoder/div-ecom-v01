import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParsedProduct } from "@/types";

interface ProductCardProps {
  product: ParsedProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const priceInRupees = (product.price / 100).toFixed(2);

  return (
    <Card className="flex flex-col h-full">
      <div className="relative w-full h-52 overflow-hidden rounded-t-lg">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant="secondary">
          {product.category}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.capacity}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-md">₹{priceInRupees}</span>
        <Link href={`/products/${product.id}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

