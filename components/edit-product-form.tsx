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
  const p = product as ParsedProduct & {
    sno?: string | null;
    leadNo?: string | null;
    tenure?: string | null;
    date?: Date | string | null;
    customerCompanyName?: string | null;
    segmentProductType?: string | null;
    kWp?: string | null;
    structure?: string | null;
    inverter?: string | null;
    mobileNo?: string | null;
    systemType?: string | null;
    address?: string | null;
    area?: string | null;
    solarBrand?: string | null;
  };
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: (product.price / 100).toFixed(2),
    capacity: product.capacity,
    category: product.category as typeof PRODUCT_CATEGORIES[number],
    images: [] as File[],
    existingImages: product.images,
    sno: p.sno ?? "",
    leadNo: p.leadNo ?? "",
    tenure: p.tenure ?? "",
    date: p.date ? (typeof p.date === "string" ? p.date.slice(0, 10) : new Date(p.date).toISOString().slice(0, 10)) : "",
    customerCompanyName: p.customerCompanyName ?? "",
    segmentProductType: p.segmentProductType ?? "",
    kWp: p.kWp ?? "",
    structure: p.structure ?? "",
    inverter: p.inverter ?? "",
    mobileNo: p.mobileNo ?? "",
    systemType: p.systemType ?? "",
    address: p.address ?? "",
    area: p.area ?? "",
    solarBrand: p.solarBrand ?? "",
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
        sno: formData.sno || undefined,
        leadNo: formData.leadNo || undefined,
        tenure: formData.tenure || undefined,
        date: formData.date || undefined,
        customerCompanyName: formData.customerCompanyName || undefined,
        segmentProductType: formData.segmentProductType || undefined,
        kWp: formData.kWp || undefined,
        structure: formData.structure || undefined,
        inverter: formData.inverter || undefined,
        mobileNo: formData.mobileNo || undefined,
        systemType: formData.systemType || undefined,
        address: formData.address || undefined,
        area: formData.area || undefined,
        solarBrand: formData.solarBrand || undefined,
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

      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer font-medium">Additional / Import Info (optional)</summary>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sno">S.No</Label>
            <Input id="sno" value={formData.sno} onChange={(e) => setFormData({ ...formData, sno: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="leadNo">Lead No</Label>
            <Input id="leadNo" value={formData.leadNo} onChange={(e) => setFormData({ ...formData, leadNo: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="tenure">Tenure</Label>
            <Input id="tenure" value={formData.tenure} onChange={(e) => setFormData({ ...formData, tenure: e.target.value })} placeholder="e.g., 2021-2022" />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="customerCompanyName">Customer/Company Name</Label>
            <Input id="customerCompanyName" value={formData.customerCompanyName} onChange={(e) => setFormData({ ...formData, customerCompanyName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="segmentProductType">Segment (Product Type)</Label>
            <Input id="segmentProductType" value={formData.segmentProductType} onChange={(e) => setFormData({ ...formData, segmentProductType: e.target.value })} placeholder="e.g., SPGs, C&I" />
          </div>
          <div>
            <Label htmlFor="kWp">kWp</Label>
            <Input id="kWp" value={formData.kWp} onChange={(e) => setFormData({ ...formData, kWp: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="structure">Structure</Label>
            <Input id="structure" value={formData.structure} onChange={(e) => setFormData({ ...formData, structure: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="inverter">Inverter</Label>
            <Input id="inverter" value={formData.inverter} onChange={(e) => setFormData({ ...formData, inverter: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="mobileNo">Mobile No</Label>
            <Input id="mobileNo" value={formData.mobileNo} onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="systemType">System Type</Label>
            <Input id="systemType" value={formData.systemType} onChange={(e) => setFormData({ ...formData, systemType: e.target.value })} placeholder="e.g., On grid, Offgrid, Hybrid" />
          </div>
          <div className="col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="area">Area</Label>
            <Input id="area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="solarBrand">Solar Brand</Label>
            <Input id="solarBrand" value={formData.solarBrand} onChange={(e) => setFormData({ ...formData, solarBrand: e.target.value })} />
          </div>
        </div>
      </details>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Product"}
      </Button>
    </form>
  );
}

