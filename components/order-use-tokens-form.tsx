"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins } from "lucide-react";

interface OrderUseTokensFormProps {
  orderId: string;
  userId: string;
  availableTokens: number;
}

export function OrderUseTokensForm({ orderId, availableTokens }: OrderUseTokensFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenAmount = parseInt(amount, 10);
    if (!tokenAmount || tokenAmount <= 0) {
      toast.error("Enter a valid token amount");
      return;
    }
    if (tokenAmount > availableTokens) {
      toast.error(`Customer only has ${availableTokens} tokens available`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/use-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      toast.success(`${tokenAmount} tokens utilized successfully`);
      setAmount("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to use tokens");
    } finally {
      setLoading(false);
    }
  };

  if (availableTokens === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This customer has no available tokens to utilize.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2">
        <Coins className="h-4 w-4 text-amber-500 shrink-0" />
        <span className="text-sm font-medium text-amber-800">
          {availableTokens} tokens available
        </span>
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          min={1}
          max={availableTokens}
          placeholder={`Amount to use (max ${availableTokens})`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="max-w-[220px]"
        />
        <Button type="submit" disabled={loading || !amount}>
          {loading ? "Processing..." : "Use Tokens"}
        </Button>
      </div>
    </form>
  );
}