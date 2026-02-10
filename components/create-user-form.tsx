"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateUserForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const router = useRouter();

  // Check if form is valid
  const isFormValid = formData.name.trim().length > 0 && formData.phone.length === 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: cleanPhone,
          email: formData.email.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create user");
        setLoading(false);
        return;
      }

      toast.success("User created successfully");
      setFormData({ name: "", phone: "", email: "" });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setFormData({ name: "", phone: "", email: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account. User can log in with their phone number.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                setFormData((prev) => ({ ...prev, phone: cleaned }));
              }}
              maxLength={10}
              required
              disabled={loading}
              placeholder="9876543210"
            />
            <p className="text-xs text-gray-500">
              {formData.phone.length === 10 
                ? "✓ Valid phone number" 
                : `10-digit phone number (${formData.phone.length}/10)`}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            {!isFormValid && (
              <p className="text-xs text-muted-foreground">
                {!formData.name.trim() && "Name is required. "}
                {formData.phone.length !== 10 && `Phone number must be 10 digits (${formData.phone.length}/10).`}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !isFormValid}
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

