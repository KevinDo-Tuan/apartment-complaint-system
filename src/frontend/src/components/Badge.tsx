import type {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from "../hooks/useQueries";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  Open: {
    label: "Open",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  InProgress: {
    label: "In Progress",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Resolved: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export function getStatusKey(status: ComplaintStatus): string {
  if ("Open" in status) return "Open";
  if ("InProgress" in status) return "InProgress";
  if ("Resolved" in status) return "Resolved";
  return "Open";
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const key = getStatusKey(status);
  const config = statusConfig[key] ?? statusConfig.Open;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

const categoryConfig: Record<string, { label: string; className: string }> = {
  Maintenance: {
    label: "Maintenance",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  Noise: {
    label: "Noise",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  Cleanliness: {
    label: "Cleanliness",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  Safety: {
    label: "Safety",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  Other: {
    label: "Other",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function getCategoryKey(category: ComplaintCategory): string {
  if ("Maintenance" in category) return "Maintenance";
  if ("Noise" in category) return "Noise";
  if ("Cleanliness" in category) return "Cleanliness";
  if ("Safety" in category) return "Safety";
  return "Other";
}

export function CategoryBadge({ category }: { category: ComplaintCategory }) {
  const key = getCategoryKey(category);
  const config = categoryConfig[key] ?? categoryConfig.Other;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

const priorityConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  Low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  Medium: {
    label: "Medium",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  High: {
    label: "High",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export function getPriorityKey(priority: ComplaintPriority): string {
  if ("Low" in priority) return "Low";
  if ("Medium" in priority) return "Medium";
  if ("High" in priority) return "High";
  return "Low";
}

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const key = getPriorityKey(priority);
  const config = priorityConfig[key] ?? priorityConfig.Low;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
