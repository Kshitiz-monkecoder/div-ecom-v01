import { OrderStatus, TicketStatus, Role } from "@prisma/client";

export type { OrderStatus, TicketStatus, Role };

export const ORDER_STATUSES: OrderStatus[] = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "INSTALLED",
  "CANCELLED",
];

export const TICKET_STATUSES: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export const TICKET_CATEGORIES = [
  "Installation Issue",
  "Product Issue",
  "Billing / Payment",
  "General Query",
] as const;

export type TicketCategory = typeof TICKET_CATEGORIES[number];

export const PRODUCT_CATEGORIES = ["Residential", "Commercial"] as const;

export const DELIVERY_SLOTS = [
  { value: "EARLY", label: "Early (6AM - 10AM)" },
  { value: "MID", label: "Mid (10AM - 2PM)" },
  { value: "LATE", label: "Late (2PM - 6PM)" },
  { value: "NIGHT", label: "Night (6PM - 10PM)" },
] as const;

export type DeliverySlot = (typeof DELIVERY_SLOTS)[number]["value"];

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

import { Product } from "@prisma/client";

export type ParsedProduct = Omit<Product, "images"> & { images: string[] };

