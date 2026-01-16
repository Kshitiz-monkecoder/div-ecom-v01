"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProduct } from "@/app/actions/products";
import { PRODUCT_CATEGORIES, ParsedProduct } from "@/types";
import Image from "next/image";

interface EditProductFormProps {
  product: ParsedProduct & { orders?: any[] };
}

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: (product.price / 100).toFixed(2),
    capacity: product.capacity,
    category: product.category as typeof PRODUCT_CATEGORIES[number],
    images: [] as File[],
    existingImages: product.images,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        images: Array.from(e.target.files),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new images using API route
      let newImageUrls: string[] = [];
      if (formData.images.length > 0) {
        const uploadFormData = new FormData();
        formData.images.forEach((file) => {
          uploadFormData.append("images", file);
        });
        
        const uploadResponse = await fetch("/api/upload-images", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload images");
        }

        const { urls } = await uploadResponse.json();
        newImageUrls = urls;
      }

      const allImages = [...formData.existingImages, ...newImageUrls];

      await updateProduct(product.id, {
        name: formData.name,
        description: formData.description,
        price: Math.round(parseFloat(formData.price) * 100),
        capacity: formData.capacity,
        category: formData.category,
        images: allImages,
      });

      toast.success("Product updated successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            required
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value as typeof PRODUCT_CATEGORIES[number] })
          }
          required
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.existingImages.length > 0 && (
        <div>
          <Label>Existing Images</Label>
          <div className="grid grid-cols-4 gap-4 mt-2">
            {formData.existingImages.map((url, index) => (
              <div key={index} className="relative h-24">
                <Image src={url} alt={`Product image ${index + 1}`} fill className="object-cover rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="images">Add More Images</Label>
        <Input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Product"}
      </Button>
    </form>
  );
}

