"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createAdminOrder } from "@/app/actions/orders";
import { getAllUsersForAssignment } from "@/app/actions/admin";
import { getAllProducts } from "@/app/actions/products";
import { User } from "@prisma/client";
import { Trash2, Plus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: string;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
};

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number; // in rupees for display
  name: string;
  description: string;
  capacity: string;
}

interface CreateOrderFormProps {
  users?: User[];
  products?: Product[];
}

type WarrantyPdfInput = {
  documentNo: string;
  systemSizeKwp: string;
  customerName: string;
  customerNumber: string;
  customerAddress: string;
  pinCode: string;
  installationDate: string;
  invoiceNo: string;

  moduleType: string;
  moduleSerialNumbers: string[];

  inverterWarrantyYears: number;
  inverterModel: string;
  inverterSerialNumber: string;
};

export function CreateOrderForm({ users: initialUsers, products: initialProducts }: CreateOrderFormProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isMaterialDelivery, setIsMaterialDelivery] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Warranty PDF (generated) inputs
  const [warrantyDocumentNo, setWarrantyDocumentNo] = useState("");
  const [warrantySystemSizeKwp, setWarrantySystemSizeKwp] = useState("");
  const [warrantyCustomerName, setWarrantyCustomerName] = useState("");
  const [warrantyCustomerNumber, setWarrantyCustomerNumber] = useState("");
  const [warrantyCustomerAddress, setWarrantyCustomerAddress] = useState("");
  const [warrantyPinCode, setWarrantyPinCode] = useState("");
  const [warrantyInstallationDate, setWarrantyInstallationDate] = useState("");
  const [warrantyInvoiceNo, setWarrantyInvoiceNo] = useState("");
  const [warrantyModuleType, setWarrantyModuleType] = useState("");
  const [warrantyModuleSerialNumbersText, setWarrantyModuleSerialNumbersText] =
    useState("");
  const [warrantyInverterWarrantyYears, setWarrantyInverterWarrantyYears] =
    useState<number>(5);
  const [warrantyInverterModel, setWarrantyInverterModel] = useState("");
  const [warrantyInverterSerialNumber, setWarrantyInverterSerialNumber] =
    useState("");

  const [generatingWarranty, setGeneratingWarranty] = useState(false);
  const [generatedWarrantyUrl, setGeneratedWarrantyUrl] = useState<string | null>(
    null
  );
  const [isWarrantyGeneratorOpen, setIsWarrantyGeneratorOpen] = useState(false);


  // Load users and products on mount if not provided
  useEffect(() => {
    if (!initialUsers || !initialProducts) {
      Promise.all([
        getAllUsersForAssignment(),
        getAllProducts(),
      ]).then(([usersData, productsData]) => {
        setUsers(usersData);
        setProducts(productsData);
      }).catch(() => {
        toast.error("Failed to load users or products");
      });
    }
  }, [initialUsers, initialProducts]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Best-effort defaults for warranty fields from selected customer + entered address/phone
  useEffect(() => {
    if (selectedUser) {
      setWarrantyCustomerName((prev) => prev || selectedUser.name || "");
      setWarrantyCustomerNumber((prev) => prev || selectedUser.phone || "");
    }
  }, [selectedUser]);

  useEffect(() => {
    setWarrantyCustomerAddress((prev) => prev || address || "");
  }, [address]);

  const addProduct = () => {
    if (products.length === 0) {
      toast.error("No products available");
      return;
    }
    const firstProduct = products[0];
    setItems([
      ...items,
      {
        productId: firstProduct.id,
        quantity: 1,
        unitPrice: firstProduct.price / 100, // Convert paise to rupees
        name: firstProduct.name,
        description: firstProduct.description,
        capacity: firstProduct.capacity,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index] = {
          ...updated[index],
          productId: product.id,
          unitPrice: product.price / 100,
          name: product.name,
          description: product.description,
          capacity: product.capacity,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setItems(updated);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity * 100, // Convert back to paise
    0
  );

  const warrantyModuleSerialNumbers = warrantyModuleSerialNumbersText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const warrantyPdfInput: WarrantyPdfInput = {
    documentNo: warrantyDocumentNo,
    systemSizeKwp: warrantySystemSizeKwp,
    customerName: warrantyCustomerName,
    customerNumber: warrantyCustomerNumber,
    customerAddress: warrantyCustomerAddress,
    pinCode: warrantyPinCode,
    installationDate: warrantyInstallationDate,
    invoiceNo: warrantyInvoiceNo,

    moduleType: warrantyModuleType,
    moduleSerialNumbers: warrantyModuleSerialNumbers,

    inverterWarrantyYears: warrantyInverterWarrantyYears,
    inverterModel: warrantyInverterModel,
    inverterSerialNumber: warrantyInverterSerialNumber,
  };

  const handleGenerateWarranty = async () => {
    // Basic validations (API validates again)
    if (
      !warrantyPdfInput.documentNo ||
      !warrantyPdfInput.systemSizeKwp ||
      !warrantyPdfInput.customerName ||
      !warrantyPdfInput.customerNumber ||
      !warrantyPdfInput.customerAddress ||
      !warrantyPdfInput.pinCode ||
      !warrantyPdfInput.installationDate ||
      !warrantyPdfInput.invoiceNo ||
      !warrantyPdfInput.moduleType ||
      !warrantyPdfInput.inverterModel ||
      !warrantyPdfInput.inverterSerialNumber
    ) {
      toast.error("Please fill all warranty fields before generating");
      return;
    }

    setGeneratingWarranty(true);
    try {
      const res = await fetch("/api/generate-warranty-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(warrantyPdfInput),
      });

      const data = await res.json();
      if (!res.ok || !data?.pdfUrl) {
        throw new Error(data?.error || "Failed to generate warranty PDF");
      }

      setGeneratedWarrantyUrl(data.pdfUrl);
      toast.success("Warranty PDF generated successfully");
    } catch (error) {
      console.error("Generate warranty error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate warranty PDF");
    } finally {
      setGeneratingWarranty(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      setStep(1);
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one product");
      setStep(2);
      return;
    }

    if (!address || !phone) {
      toast.error("Please fill in address and phone");
      setStep(3);
      return;
    }

    setLoading(true);

    try {
      // Convert items to paise (multiply by 100)
      const itemsInPaise = items.map((item) => ({
        ...item,
        unitPrice: Math.round(item.unitPrice * 100),
      }));

      // Upload documents first via API route
      let warrantyCardUrl: string | undefined;
      let invoiceUrl: string | undefined;
      const additionalFileUrls: string[] = [];

      // Upload warranty card
      if (warrantyFile) {
        try {
          const warrantyFormData = new FormData();
          warrantyFormData.append("file", warrantyFile);
          warrantyFormData.append("folder", "order-documents/warranty");
          const warrantyResponse = await fetch("/api/upload-documents", {
            method: "POST",
            body: warrantyFormData,
          });
          if (!warrantyResponse.ok) throw new Error("Failed to upload warranty card");
          const warrantyData = await warrantyResponse.json();
          warrantyCardUrl = warrantyData.url;
        } catch (error) {
          console.error("Warranty upload error:", error);
          toast.error("Failed to upload warranty card, but order will be created");
        }
      }

      // If no warranty file was uploaded, use generated warranty PDF (Cloudinary URL)
      if (!warrantyCardUrl && generatedWarrantyUrl) {
        warrantyCardUrl = generatedWarrantyUrl;
      }

      // Upload invoice
      if (invoiceFile) {
        try {
          const invoiceFormData = new FormData();
          invoiceFormData.append("file", invoiceFile);
          invoiceFormData.append("folder", "order-documents/invoice");
          const invoiceResponse = await fetch("/api/upload-documents", {
            method: "POST",
            body: invoiceFormData,
          });
          if (!invoiceResponse.ok) throw new Error("Failed to upload invoice");
          const invoiceData = await invoiceResponse.json();
          invoiceUrl = invoiceData.url;
        } catch (error) {
          console.error("Invoice upload error:", error);
          toast.error("Failed to upload invoice, but order will be created");
        }
      }

      // Upload additional files
      if (additionalFiles.length > 0) {
        try {
          const additionalUploadPromises = additionalFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "order-documents/additional");
            const response = await fetch("/api/upload-documents", {
              method: "POST",
              body: formData,
            });
            if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
            const data = await response.json();
            return data.url;
          });
          const urls = await Promise.all(additionalUploadPromises);
          additionalFileUrls.push(...urls);
        } catch (error) {
          console.error("Additional files upload error:", error);
          toast.error("Some additional files failed to upload, but order will be created");
        }
      }

      const warrantyPdfData =
        warrantyPdfInput.documentNo && warrantyPdfInput.systemSizeKwp
          ? JSON.stringify(warrantyPdfInput)
          : undefined;

      // Create order with document URLs
      const order = await createAdminOrder({
        userId: selectedUserId,
        items: itemsInPaise,
        address,
        phone,
        notes: notes || undefined,
        warrantyDocumentNo: warrantyPdfInput.documentNo || undefined,
        warrantyPdfData,
        warrantyCardUrl,
        invoiceUrl,
        additionalFiles: additionalFileUrls.length > 0 ? additionalFileUrls : undefined,
        isMaterialDelivery,
      });

      toast.success(`Order ${order.orderNumber} created successfully!`);
      setIsSubmitted(true); 
      router.push("/admin/orders");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-500"
              }`}
            >
              {s}
            </div>
            {s < 5 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > s ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Step 1: Select Customer"}
            {step === 2 && "Step 2: Add Products"}
            {step === 3 && "Step 3: Order Details"}
            {step === 4 && "Step 4: Documents"}
            {step === 5 && "Step 5: Review & Submit"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: User Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="user">Select Customer *</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.phone}) {user.email && `- ${user.email}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUser && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.email || "No email"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.phone}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedUserId}
                >
                  Next: Add Products
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Product Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Products in Order</Label>
                <Button type="button" onClick={addProduct} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No products added. Click &quot;Add Product&quot; to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold">Product #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>

                        <div>
                          <Label>Product *</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) =>
                              updateItem(index, "productId", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {product.capacity} (₹
                                  {(product.price / 100).toFixed(2)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Unit Price (₹) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Product Name *</Label>
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              updateItem(index, "name", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label>Capacity *</Label>
                          <Input
                            value={item.capacity}
                            onChange={(e) =>
                              updateItem(index, "capacity", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label>Description *</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            rows={3}
                          />
                        </div>

                        <div className="text-right font-semibold">
                          Line Total: ₹
                          {(item.unitPrice * item.quantity).toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Order Total: ₹{(totalAmount / 100).toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={items.length === 0}>
                    Next: Order Details
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Order Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Installation Address *</Label>
                <Textarea
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter installation address"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="phone">Contact Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes or requirements"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="material-delivery"
                  checked={isMaterialDelivery}
                  onCheckedChange={(value) => setIsMaterialDelivery(value === true)}
                />
                <Label
                  htmlFor="material-delivery"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Material delivery order
                </Label>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!address || !phone}>
                  Next: Documents
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border rounded-lg">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setIsWarrantyGeneratorOpen((v) => !v)}
                >
                  <div>
                    <p className="font-semibold">Generate warranty</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {isWarrantyGeneratorOpen ? "Hide" : "Show"}
                  </span>
                </button>

                {isWarrantyGeneratorOpen && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Document No *</Label>
                        <Input
                          value={warrantyDocumentNo}
                          onChange={(e) => setWarrantyDocumentNo(e.target.value)}
                          placeholder="e.g. DV25GST-83"
                        />
                      </div>
                      <div>
                        <Label>System Size (kWp) *</Label>
                        <Input
                          value={warrantySystemSizeKwp}
                          onChange={(e) => setWarrantySystemSizeKwp(e.target.value)}
                          placeholder="e.g. 4 KWP"
                        />
                      </div>
                      <div>
                        <Label>Customer Name *</Label>
                        <Input
                          value={warrantyCustomerName}
                          onChange={(e) => setWarrantyCustomerName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Customer Number *</Label>
                        <Input
                          value={warrantyCustomerNumber}
                          onChange={(e) => setWarrantyCustomerNumber(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Customer Address *</Label>
                        <Textarea
                          value={warrantyCustomerAddress}
                          onChange={(e) => setWarrantyCustomerAddress(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Pin Code *</Label>
                        <Input
                          value={warrantyPinCode}
                          onChange={(e) => setWarrantyPinCode(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Date of Installation &amp; Commissioning *</Label>
                        <Input
                          value={warrantyInstallationDate}
                          onChange={(e) => setWarrantyInstallationDate(e.target.value)}
                          placeholder="e.g. 28-08-2024"
                        />
                      </div>
                      <div>
                        <Label>Invoice No. *</Label>
                        <Input
                          value={warrantyInvoiceNo}
                          onChange={(e) => setWarrantyInvoiceNo(e.target.value)}
                          placeholder="e.g. DV25GST-83"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>Module Type *</Label>
                        <Input
                          value={warrantyModuleType}
                          onChange={(e) => setWarrantyModuleType(e.target.value)}
                          placeholder="e.g. Monocrystalline 500WP Bluebird"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Module Serial Numbers (one per line)</Label>
                        <Textarea
                          value={warrantyModuleSerialNumbersText}
                          onChange={(e) =>
                            setWarrantyModuleSerialNumbersText(e.target.value)
                          }
                          rows={4}
                          placeholder={"e.g.\nMS2404301A0928\nMS2404301A0966"}
                        />
                      </div>
                      <div>
                        <Label>Inverter Warranty Years *</Label>
                        <Input
                          type="number"
                          min={1}
                          value={warrantyInverterWarrantyYears}
                          onChange={(e) =>
                            setWarrantyInverterWarrantyYears(
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Inverter Model *</Label>
                        <Input
                          value={warrantyInverterModel}
                          onChange={(e) => setWarrantyInverterModel(e.target.value)}
                          placeholder="e.g. DEYE 3 SUN-3K-G01"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Inverter Serial Number *</Label>
                        <Input
                          value={warrantyInverterSerialNumber}
                          onChange={(e) =>
                            setWarrantyInverterSerialNumber(e.target.value)
                          }
                          placeholder="e.g. XM4033K5621039"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                        {generatedWarrantyUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={generatedWarrantyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Generated
                            </a>
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleGenerateWarranty}
                          disabled={generatingWarranty}
                        >
                          {generatingWarranty ? "Generating..." : "Generate"}
                        </Button>
                      </div>
                  </div>
                )}
              </div>
                {!isWarrantyGeneratorOpen && (
              <div>
                <Label htmlFor="warranty">Warranty Card (PDF)</Label>
                <Input
                  id="warranty"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  disabled={generatingWarranty || isWarrantyGeneratorOpen}
                  onChange={(e) =>
                    setWarrantyFile(e.target.files?.[0] || null)
                  }
                />
                {warrantyFile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Selected: {warrantyFile.name}
                  </p>
                )}
              </div>
                )}

              <div>
                <Label htmlFor="invoice">Invoice (PDF)</Label>
                <Input
                  id="invoice"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                />
                {invoiceFile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Selected: {invoiceFile.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="additional">Additional Files (Multiple)</Label>
                <Input
                  id="additional"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setAdditionalFiles(Array.from(e.target.files || []))
                  }
                />
                {additionalFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {additionalFiles.map((file, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        {file.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setStep(5)}>Next: Review</Button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Customer</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p>{selectedUser?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser?.email || "No email"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser?.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Products ({items.length})</h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.capacity} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right text-lg font-semibold border-t pt-4">
                  Total: ₹{(totalAmount / 100).toFixed(2)}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                  <p>
                    <span className="font-medium">Address:</span> {address}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {phone}
                  </p>
                  {notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {notes}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Documents</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                  <p>
                    <span className="font-medium">Warranty:</span>{" "}
                    {warrantyFile ? warrantyFile.name : "Not provided"}
                  </p>
                  <p>
                    <span className="font-medium">Invoice:</span>{" "}
                    {invoiceFile ? invoiceFile.name : "Not provided"}
                  </p>
                  <p>
                    <span className="font-medium">Additional Files:</span>{" "}
                    {additionalFiles.length > 0
                      ? `${additionalFiles.length} file(s)`
                      : "None"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button onClick={handleSubmit}   disabled={loading || isSubmitted} >
                  {loading ? "Creating Order..." : "Create Order"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}