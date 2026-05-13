import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Clock3,
  PackageCheck,
  PauseCircle,
  Wrench,
  XCircle,
} from "lucide-react";
import type { ElementType } from "react";

type StatusMeta = {
  label: string;
  tone: string;
  dot: string;
  icon: ElementType;
};

const fallbackStatus: StatusMeta = {
  label: "In review",
  tone: "bg-slate-100 text-slate-700 ring-slate-200",
  dot: "bg-slate-400",
  icon: CircleDot,
};

const statusMap: Record<string, StatusMeta> = {
  NEW: {
    label: "Processing",
    tone: "bg-sky-100 text-sky-800 ring-sky-200",
    dot: "bg-sky-500",
    icon: Clock3,
  },
  CONTACTED: {
    label: "Contacted",
    tone: "bg-amber-100 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    icon: CircleDot,
  },
  CONFIRMED: {
    label: "Confirmed",
    tone: "bg-indigo-100 text-indigo-800 ring-indigo-200",
    dot: "bg-indigo-500",
    icon: PackageCheck,
  },
  INSTALLED: {
    label: "Installed",
    tone: "bg-emerald-100 text-orange-800 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "Completed",
    tone: "bg-emerald-100 text-orange-800 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  DELIVERED: {
    label: "Delivered",
    tone: "bg-emerald-100 text-orange-800 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "bg-rose-100 text-rose-800 ring-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  PENDING: {
    label: "Pending",
    tone: "bg-amber-100 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    tone: "bg-emerald-100 text-orange-800 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    tone: "bg-rose-100 text-rose-800 ring-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  PROCESSING: {
    label: "Processing",
    tone: "bg-violet-100 text-violet-800 ring-violet-200",
    dot: "bg-violet-500",
    icon: Wrench,
  },
  SHIPPED: {
    label: "Dispatched",
    tone: "bg-cyan-100 text-cyan-800 ring-cyan-200",
    dot: "bg-cyan-500",
    icon: PackageCheck,
  },
  OPEN: {
    label: "Received",
    tone: "bg-sky-100 text-sky-800 ring-sky-200",
    dot: "bg-sky-500",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "Under review",
    tone: "bg-amber-100 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    icon: Clock3,
  },
  RESOLVED: {
    label: "Resolved",
    tone: "bg-emerald-100 text-orange-800 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    tone: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
    icon: PauseCircle,
  },
};

export function formatStatusLabel(status: string) {
  return statusMap[status]?.label ?? status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getStatusMeta(status: string): StatusMeta {
  return statusMap[status] ?? {
    ...fallbackStatus,
    label: formatStatusLabel(status),
  };
}
