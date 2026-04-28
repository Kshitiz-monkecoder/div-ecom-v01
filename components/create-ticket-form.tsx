"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTicket } from "@/app/actions/tickets";
import {
  TICKET_CATEGORIES,
  TICKET_SUB_CATEGORIES,
  type Order,
  type OrderItem,
  type Product,
} from "@/types";
import { Sun, Wrench, Receipt, HelpCircle, ChevronLeft, Check, Search } from "lucide-react";

interface CreateTicketFormProps {
  orders: (Order & {
    items: Array<OrderItem & { product: Product | null }>;
  })[];
}

// Progress indicator component
function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                step < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : step === currentStep
                  ? "border-primary text-primary"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-0.5 mx-1 transition-colors ${
                  step < currentStep ? "bg-primary" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-2 text-xs text-muted-foreground">
        <span className="w-24 text-center">Category</span>
        <span className="w-24 text-center">Issues</span>
        <span className="w-24 text-center">Details</span>
      </div>
    </div>
  );
}

// Category card component
function CategoryCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left w-full group"
    >
      <Icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </button>
  );
}

// Checkbox card component
function CheckboxCard({
  label,
  value,
  checked,
  onToggle,
}: {
  label: string;
  value: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full p-4 border rounded-lg text-left transition-all ${
        checked
          ? "border-l-4 border-l-primary bg-primary/5 border-primary/30"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
            checked ? "bg-primary border-primary" : "border-gray-400"
          }`}
        >
          {checked && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className={`text-sm ${checked ? "font-medium" : ""}`}>{label}</span>
      </div>
    </button>
  );
}

export function CreateTicketForm({ orders }: CreateTicketFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 data
  const [selectedCategory, setSelectedCategory] = useState<typeof TICKET_CATEGORIES[number] | "">("");
  
  // Step 2 data
  const [selectedSubIssues, setSelectedSubIssues] = useState<string[]>([]);
  const [generalQueryText, setGeneralQueryText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  
  // Step 3 data
  const [orderId, setOrderId] = useState("");
  const [description, setDescription] = useState("");
  const [supportImages, setSupportImages] = useState<File[]>([]);

  const minDescriptionLength = 100;
  const descriptionLength = description.trim().length;

  // Category configuration
  const categoryConfig = [
    {
      value: "Installation Issue",
      icon: Sun,
      subtitle: "Material delivery, panel, inverter brand issues",
    },
    {
      value: "Product Issue",
      icon: Wrench,
      subtitle: "Inverter, generation, meter, cable issues",
    },
    {
      value: "Billing / Payment",
      icon: Receipt,
      subtitle: "Portal config, units, bills, name change",
    },
    {
      value: "General Query",
      icon: HelpCircle,
      subtitle: "Any other questions or concerns",
    },
  ];

  const handleCategorySelect = (category: typeof TICKET_CATEGORIES[number]) => {
    setSelectedCategory(category);
    setSelectedSubIssues([]);
    setGeneralQueryText("");
    setSearchFilter("");
    setStep(2);
  };

  const handleSubIssueToggle = (value: string) => {
    setSelectedSubIssues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const canProceedFromStep2 = () => {
    if (selectedCategory === "General Query") {
      return generalQueryText.trim().length >= 10;
    }
    return selectedSubIssues.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (descriptionLength < minDescriptionLength) {
      toast.error(`Description must be at least ${minDescriptionLength} characters.`);
      return;
    }

    if (supportImages.length === 0) {
      toast.error("Please upload at least one supporting image.");
      return;
    }

    if (!orderId) {
      toast.error("Please select a related order.");
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();
      supportImages.forEach((file) => uploadData.append("images", file));

      const uploadRes = await fetch("/api/upload-ticket-images", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to upload images");
      }

      const uploadJson = await uploadRes.json();
      const imageUrls = Array.isArray(uploadJson?.urls) ? uploadJson.urls : [];

      if (imageUrls.length === 0) {
        throw new Error("No image URLs returned from upload");
      }

      const subCategories = selectedCategory === "General Query" 
        ? [generalQueryText.trim()] 
        : selectedSubIssues;

      const ticket = await createTicket({
        category: selectedCategory as typeof TICKET_CATEGORIES[number],
        description: description,
        orderId: orderId,
        images: imageUrls,
        subCategories: subCategories,
      });
      
      toast.success(t("toasts.ticketCreated", { number: ticket.id.slice(-6).toUpperCase() }));
      
      if (typeof window !== "undefined") {
        const cooldownMs = 2 * 60 * 1000;
        localStorage.setItem("ticketCreateCooldownUntil", String(Date.now() + cooldownMs));
      }
      
      router.push(`/tickets/${ticket.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toasts.error"));
    } finally {
      setLoading(false);
    }
  };

  // Get filtered sub-categories for current category
  const getSubCategories = () => {
    if (!selectedCategory || selectedCategory === "General Query") return [];
    const subCats = TICKET_SUB_CATEGORIES[selectedCategory] || [];
    if (!searchFilter) return subCats;
    return subCats.filter((sc) =>
      sc.label.toLowerCase().includes(searchFilter.toLowerCase())
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressIndicator currentStep={step} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Select Issue Category</h2>
              <p className="text-muted-foreground">Choose the category that best describes your issue</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryConfig.map((cat) => (
                <CategoryCard
                  key={cat.value}
                  icon={cat.icon}
                  title={cat.value}
                  subtitle={cat.subtitle}
                  onClick={() => handleCategorySelect(cat.value as typeof TICKET_CATEGORIES[number])}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Sub-Issue Selection */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="text-sm text-muted-foreground">{selectedCategory}</div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {selectedCategory === "General Query" ? "Describe Your Query" : "Select Issues"}
              </h2>
              <p className="text-muted-foreground">
                {selectedCategory === "General Query"
                  ? "Tell us what you need help with"
                  : "You can select multiple issues that apply"}
              </p>
            </div>

            {selectedCategory === "General Query" ? (
              <div>
                <Textarea
                  value={generalQueryText}
                  onChange={(e) => setGeneralQueryText(e.target.value)}
                  placeholder="Briefly describe what your query is about..."
                  rows={4}
                  className="w-full"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {generalQueryText.trim().length}/10 characters minimum
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCategory === "Product Issue" && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search issues..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {getSubCategories().map((subCat) => (
                    <CheckboxCard
                      key={subCat.value}
                      label={subCat.label}
                      value={subCat.value}
                      checked={selectedSubIssues.includes(subCat.value)}
                      onToggle={() => handleSubIssueToggle(subCat.value)}
                    />
                  ))}
                </div>
                
                {getSubCategories().length === 0 && searchFilter && (
                  <p className="text-center text-muted-foreground py-8">
                    No issues found matching "{searchFilter}"
                  </p>
                )}
              </div>
            )}

            <Button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canProceedFromStep2()}
              className="w-full"
            >
              Continue to Details
            </Button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(2)}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="text-sm text-muted-foreground">{selectedCategory}</div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Provide Details</h2>
              <p className="text-muted-foreground">Help us understand your issue better</p>
            </div>

            <div>
              <Label htmlFor="order">Related Order *</Label>
              <Select value={orderId} onValueChange={setOrderId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.items.length === 1
                        ? order.items[0]?.product?.name || order.items[0]?.name || "Order"
                        : `${order.items.length} items`} - {new Date(order.createdAt).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                required
                minLength={minDescriptionLength}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of your issue..."
                rows={6}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {descriptionLength}/{minDescriptionLength} characters minimum
              </p>
            </div>

            <div>
              <Label htmlFor="supportImages">Supporting Images *</Label>
              <Input
                id="supportImages"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setSupportImages(Array.from(e.target.files || []))}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Please upload at least one image showing the issue. {supportImages.length > 0 && `(${supportImages.length} selected)`}
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Ticket..." : "Submit Ticket"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
