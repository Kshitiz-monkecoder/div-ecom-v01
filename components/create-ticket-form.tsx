"use client";

import { useState } from "react";
import type { ElementType, FormEvent } from "react";
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
import { Check, ChevronLeft, HelpCircle, Receipt, Search, Sun, UploadCloud, Wrench } from "lucide-react";

interface CreateTicketFormProps {
  orders: (Order & {
    items: Array<OrderItem & { product: Product | null }>;
  })[];
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["Category", "Issue", "Details"];
  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-3">
        {steps.map((label, index) => {
          const step = index + 1;
          const complete = step < currentStep;
          const active = step === currentStep;
          return (
            <div
              key={label}
              className={`rounded-2xl border p-3 transition-colors ${
                complete
                  ? "border-emerald-200 bg-emerald-50"
                  : active
                  ? "border-slate-950 bg-white"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-7 items-center justify-center rounded-xl text-xs font-semibold ${
                    complete
                      ? "bg-emerald-600 text-white"
                      : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-slate-400"
                  }`}
                >
                  {complete ? <Check className="size-3.5" /> : step}
                </span>
                <span className="truncate text-xs font-semibold text-slate-700">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ElementType;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[1.35rem] border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-[0_18px_50px_-38px_rgba(15,23,42,0.75)] customer-focus-ring"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-colors group-hover:bg-emerald-700">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-orange-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
    </button>
  );
}

function IssueCard({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-2xl border p-4 text-left transition-all customer-focus-ring ${
        checked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-orange-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${
            checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-orange-200 bg-white"
          }`}
        >
          {checked && <Check className="size-3.5" />}
        </span>
        <span className={`text-sm leading-6 ${checked ? "font-semibold text-orange-950" : "text-slate-700"}`}>{label}</span>
      </div>
    </button>
  );
}

export function CreateTicketForm({ orders }: CreateTicketFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof TICKET_CATEGORIES[number] | "">("");
  const [selectedSubIssues, setSelectedSubIssues] = useState<string[]>([]);
  const [generalQueryText, setGeneralQueryText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [orderId, setOrderId] = useState("");
  const [description, setDescription] = useState("");
  const [supportImages, setSupportImages] = useState<File[]>([]);

  const minDescriptionLength = 100;
  const descriptionLength = description.trim().length;

  const categoryConfig = [
    {
      value: "Installation Issue",
      icon: Sun,
      subtitle: "Delivery, installation, panel, inverter, civil work, or earthing issues.",
    },
    {
      value: "Product Issue",
      icon: Wrench,
      subtitle: "Generation, inverter, meter, app, cable, shadow, or warranty concerns.",
    },
    {
      value: "Billing / Payment",
      icon: Receipt,
      subtitle: "Bills, exported units, portal configuration, or payment questions.",
    },
    {
      value: "General Query",
      icon: HelpCircle,
      subtitle: "Anything else where you need guidance from the Divy Power team.",
    },
  ] as const;

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

  const handleSubmit = async (e: FormEvent) => {
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
        description,
        orderId,
        images: imageUrls,
        subCategories,
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

  const getSubCategories = () => {
    if (!selectedCategory || selectedCategory === "General Query") return [];
    const subCats = TICKET_SUB_CATEGORIES[selectedCategory] || [];
    if (!searchFilter) return subCats;
    return subCats.filter((sc) =>
      sc.label.toLowerCase().includes(searchFilter.toLowerCase())
    );
  };

  return (
    <div>
      <ProgressIndicator currentStep={step} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-orange-900">Choose the request type</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Pick the closest category so the request reaches the right team faster.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {categoryConfig.map((cat) => (
                <CategoryCard
                  key={cat.value}
                  icon={cat.icon}
                  title={cat.value}
                  subtitle={cat.subtitle}
                  onClick={() => handleCategorySelect(cat.value)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="rounded-full text-muted-foreground">
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{selectedCategory}</span>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-orange-900">
                {selectedCategory === "General Query" ? "Describe your query" : "Select the issues you noticed"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedCategory === "General Query"
                  ? "A short summary helps us route your question."
                  : "Select every option that applies. More context means fewer follow-up calls."}
              </p>
            </div>

            {selectedCategory === "General Query" ? (
              <div className="space-y-2">
                <Textarea
                  value={generalQueryText}
                  onChange={(e) => setGeneralQueryText(e.target.value)}
                  placeholder="Briefly describe what you need help with..."
                  rows={4}
                  className="min-h-32 rounded-2xl border-slate-200 bg-white shadow-none"
                />
                <p className="text-xs text-slate-500">{generalQueryText.trim().length}/10 characters minimum</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCategory === "Product Issue" && (
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search issues"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="h-12 rounded-full border-slate-200 bg-white pl-11 shadow-none"
                    />
                  </div>
                )}
                <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
                  {getSubCategories().map((subCat) => (
                    <IssueCard
                      key={subCat.value}
                      label={subCat.label}
                      checked={selectedSubIssues.includes(subCat.value)}
                      onToggle={() => handleSubIssueToggle(subCat.value)}
                    />
                  ))}
                </div>
                {getSubCategories().length === 0 && searchFilter && (
                  <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No issues found matching "{searchFilter}"
                  </p>
                )}
              </div>
            )}

            <Button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canProceedFromStep2()}
              className="h-12 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-slate-800"
            >
              Continue to details
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={() => setStep(2)} className="rounded-full text-muted-foreground">
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{selectedCategory}</span>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-orange-900">Add order, details, and photos</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">The more specific you are, the faster the team can diagnose and resolve the issue.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order" className="text-sm font-semibold text-slate-700">Related order</Label>
              <Select value={orderId} onValueChange={setOrderId} required>
                <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white shadow-none">
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

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Detailed description</Label>
              <Textarea
                id="description"
                required
                minLength={minDescriptionLength}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, when it started, what you tried, and anything visible in the photos..."
                rows={6}
                className="min-h-40 rounded-2xl border-slate-200 bg-white shadow-none"
              />
              <p className={`text-xs ${descriptionLength >= minDescriptionLength ? "text-orange-600" : "text-slate-500"}`}>
                {descriptionLength}/{minDescriptionLength} characters minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportImages" className="text-sm font-semibold text-slate-700">Supporting images</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-slate-50 px-4 py-8 text-center transition-colors hover:bg-white customer-focus-ring">
                <UploadCloud className="size-7 text-slate-400" />
                <span className="mt-3 text-sm font-semibold text-orange-900">Upload photos of the issue</span>
                <span className="mt-1 text-xs text-slate-500">
                  {supportImages.length > 0 ? `${supportImages.length} selected` : "At least one image is required"}
                </span>
                <Input
                  id="supportImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setSupportImages(Array.from(e.target.files || []))}
                  className="sr-only"
                />
              </label>
            </div>

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800">
              {loading ? "Creating ticket..." : "Submit ticket"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
