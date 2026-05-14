export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type OrderStatus = "NEW" | "CONTACTED" | "CONFIRMED" | "INSTALLED" | "CANCELLED";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

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

export const TICKET_SUB_CATEGORIES: Record<string, { value: string; label: string }[]> = {
  "Installation Issue": [
    { value: "material_delivery_date", label: "Estimated date of material delivery at customer location" },
    { value: "installation_pending", label: "Material delivered but installation still pending" },
    { value: "panel_watt_mismatch", label: "Panel watt-peak does not match ordered specification" },
    { value: "inverter_brand_mismatch", label: "Inverter brand does not match company selected in order" },
    { value: "earthing_incomplete", label: "Earthing work incomplete or not properly executed" },
    { value: "civil_work_pending", label: "Civil work pending / not completed yet" },
    { value: "installation_other", label: "Others" },
  ],
  "Product Issue": [
    { value: "inverter_off", label: "Inverter OFF -- not turning ON or stopped working" },
    { value: "zero_generation", label: "Zero Generation -- units showing as zero" },
    { value: "net_meter_reading", label: "Net Meter Reading -- not updating properly" },
    { value: "grid_supply_fault", label: "Grid Supply Fault -- fault with grid supply available" },
    { value: "app_wifi_issue", label: "App / Wi-Fi -- not connecting with inverter" },
    { value: "error_code", label: "Error Code -- appearing on inverter display" },
    { value: "panel_noise", label: "Panel Noise -- noise or vibration from panels" },
    { value: "cable_damage", label: "Cable Damage -- DC/AC cable loose, damaged, or cut" },
    { value: "mcb_spd_trip", label: "MCB / SPD Trip -- tripping frequently" },
    { value: "earthing_fault", label: "Earthing Fault -- earth fault reported" },
    { value: "rain_issue", label: "Rain Issue -- stopped after rain or leakage suspected" },
    { value: "shadow_issue", label: "Shadow Issue -- low generation due to shadow" },
    { value: "bill_not_reduced", label: "Bill Not Reduced -- electricity bill not reducing" },
    { value: "cable_meter_pole", label: "Cable Issue -- between meter, inverter, or pole" },
    { value: "app_guidance_missing", label: "App Guidance Missing -- vendor didn't explain app usage" },
    { value: "low_performance", label: "Low Performance -- system performance lower than expected" },
    { value: "alignment_issue", label: "Alignment Issue -- structure or panel tilt issue" },
    { value: "heating_fan_noise", label: "Heating / Fan Noise -- inverter heating or fan noise" },
    { value: "panel_cleaning", label: "Panel Cleaning -- guidance on cleaning schedule" },
    { value: "warranty_service_query", label: "Warranty / Service Query -- warranty or service visit" },
  ],
  "Billing / Payment": [
    { value: "portal_configuration", label: "Portal Configuration -- setup pending or needs correction" },
    { value: "check_units", label: "Units -- check or confirm generated units" },
    { value: "first_bill", label: "First Bill -- query regarding first bill after installation" },
    { value: "export_units", label: "Export Units -- check exported units sent to grid" },
    { value: "name_change", label: "Name Change -- name change in net meter/billing records" },
  ],
};

export const PRODUCT_CATEGORIES = ["Residential", "Commercial"] as const;

export const DELIVERY_SLOTS = [
  { value: "EARLY", label: "Early (6AM - 10AM)" },
  { value: "MID", label: "Mid (10AM - 2PM)" },
  { value: "LATE", label: "Late (2PM - 6PM)" },
  { value: "NIGHT", label: "Night (6PM - 10PM)" },
] as const;

export type DeliverySlot = (typeof DELIVERY_SLOTS)[number]["value"];

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: Role;
  referralCode?: string | null;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: string;
  category: ProductCategory | string;
  images: string[];
  isActive?: boolean;
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
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
  name: string;
  description?: string | null;
  capacity?: string | null;
  product?: Product | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  address: string;
  phone: string;
  notes?: string | null;
  deliveryDate?: Date | string | null;
  deliverySlot?: string | null;
  isMaterialDelivery?: boolean | null;
  warrantyCardUrl?: string | null;
  invoiceUrl?: string | null;
  additionalFiles?: string[] | null;
  userId?: string;
  user?: User | null;
  items?: OrderItem[];
  canonicalStages?: Array<{
    id: string;
    stageNumber: number;
    stageName: string;
    status: string;
    responsibleParty?: string | null;
    tatHours?: number | null;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
  }>;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Ticket {
  id: string;
  category: TicketCategory | string;
  description: string;
  status: TicketStatus;
  orderId?: string | null;
  order?: Order | null;
  user?: User | null;
  images?: string[] | null;
  subCategories?: string[] | null;
  assignedAgentEmpId?: string | null;
  unoloTaskId?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export type ParsedProduct = Omit<Product, "images"> & { images: string[] };