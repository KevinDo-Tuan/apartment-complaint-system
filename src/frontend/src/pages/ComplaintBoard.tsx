import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  Building2,
  ClipboardList,
  FileText,
  Filter,
  LogIn,
  MessageSquarePlus,
  Search,
  SortAsc,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
  getCategoryKey,
  getPriorityKey,
  getStatusKey,
} from "../components/Badge";
import { ErrorMessage } from "../components/ErrorMessage";
import { PageLoader } from "../components/LoadingSpinner";
import type {
  Apartment,
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
} from "../hooks/useQueries";
import {
  useGetAllComplaints,
  useGetApartments,
  useGetMyComplaints,
  useGetUserProfile,
  usePostComplaint,
} from "../hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function excerptText(text: string, maxLen = 110): string {
  return text.length > maxLen ? `${text.slice(0, maxLen).trimEnd()}…` : text;
}

// ─── Filter State ──────────────────────────────────────────────────────────────

type FilterState = {
  search: string;
  status: string;
  category: string;
  priority: string;
  apartment: string;
  sort: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "all",
  category: "all",
  priority: "all",
  apartment: "all",
  sort: "newest",
};

const PRIORITY_ORDER: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

function applyFilters(complaints: Complaint[], f: FilterState): Complaint[] {
  let result = [...complaints];

  if (f.search.trim()) {
    const q = f.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }

  if (f.status !== "all") {
    result = result.filter((c) => getStatusKey(c.status) === f.status);
  }
  if (f.category !== "all") {
    result = result.filter((c) => getCategoryKey(c.category) === f.category);
  }
  if (f.priority !== "all") {
    result = result.filter((c) => getPriorityKey(c.priority) === f.priority);
  }
  if (f.apartment !== "all") {
    result = result.filter((c) => String(c.apartmentId) === f.apartment);
  }

  switch (f.sort) {
    case "oldest":
      result.sort((a, b) => Number(a.createdAt - b.createdAt));
      break;
    case "priority_high":
      result.sort(
        (a, b) =>
          (PRIORITY_ORDER[getPriorityKey(b.priority)] ?? 0) -
          (PRIORITY_ORDER[getPriorityKey(a.priority)] ?? 0),
      );
      break;
    case "priority_low":
      result.sort(
        (a, b) =>
          (PRIORITY_ORDER[getPriorityKey(a.priority)] ?? 0) -
          (PRIORITY_ORDER[getPriorityKey(b.priority)] ?? 0),
      );
      break;
    default:
      result.sort((a, b) => Number(b.createdAt - a.createdAt));
  }

  return result;
}

// ─── Complaint Card ────────────────────────────────────────────────────────────

function ComplaintCard({
  complaint,
  apartment,
  index,
}: {
  complaint: Complaint;
  apartment: Apartment | undefined;
  index: number;
}) {
  return (
    <Link
      to={`/complaint/${complaint.id}`}
      data-ocid={`complaint_board.item.${index + 1}`}
      className="block group h-full"
    >
      <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            #{String(complaint.id).padStart(3, "0")}
          </span>
          <StatusBadge status={complaint.status} />
        </div>

        <h3 className="font-semibold text-foreground text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-shrink-0">
          {complaint.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
          {excerptText(complaint.description)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={complaint.category} />
          <PriorityBadge priority={complaint.priority} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {apartment?.name ?? `Apt #${complaint.apartmentId}`}
            </span>
          </div>
          <span className="flex-shrink-0 ml-2">
            {formatDate(complaint.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function ComplaintCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-3 h-[200px]">
      <div className="flex justify-between">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

// ─── Stats Bar ──────────────────────────────────────────────────────────────────

function StatsBar({ complaints }: { complaints: Complaint[] }) {
  const open = complaints.filter(
    (c) => getStatusKey(c.status) === "Open",
  ).length;
  const inProgress = complaints.filter(
    (c) => getStatusKey(c.status) === "InProgress",
  ).length;
  const resolved = complaints.filter(
    (c) => getStatusKey(c.status) === "Resolved",
  ).length;

  const stats = [
    { label: "Total", value: complaints.length, color: "text-foreground" },
    { label: "Open", value: open, color: "text-[oklch(0.45_0.15_255)]" },
    {
      label: "In Progress",
      value: inProgress,
      color: "text-[oklch(0.45_0.15_80)]",
    },
    {
      label: "Resolved",
      value: resolved,
      color: "text-[oklch(0.45_0.15_155)]",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      data-ocid="complaint_board.stats"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-lg px-4 py-3 text-center"
        >
          <p className={`text-2xl font-bold font-display ${s.color}`}>
            {s.value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────

function FiltersBar({
  filters,
  apartments,
  onChange,
  onReset,
}: {
  filters: FilterState;
  apartments: Apartment[];
  onChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}) {
  const hasActive =
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.priority !== "all" ||
    filters.apartment !== "all" ||
    filters.search !== "";

  return (
    <div className="flex flex-col gap-3" data-ocid="complaint_board.filters">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search complaints by title or description…"
          className="pl-9 pr-9"
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          data-ocid="complaint_board.search_input"
        />
        {filters.search && (
          <button
            onClick={() => onChange("search", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />

        <Select
          value={filters.status}
          onValueChange={(v) => onChange("status", v)}
        >
          <SelectTrigger
            className="h-8 text-xs w-auto min-w-[120px]"
            data-ocid="complaint_board.status_filter"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(v) => onChange("category", v)}
        >
          <SelectTrigger
            className="h-8 text-xs w-auto min-w-[130px]"
            data-ocid="complaint_board.category_filter"
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Noise">Noise</SelectItem>
            <SelectItem value="Cleanliness">Cleanliness</SelectItem>
            <SelectItem value="Safety">Safety</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(v) => onChange("priority", v)}
        >
          <SelectTrigger
            className="h-8 text-xs w-auto min-w-[120px]"
            data-ocid="complaint_board.priority_filter"
          >
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        {apartments.length > 0 && (
          <Select
            value={filters.apartment}
            onValueChange={(v) => onChange("apartment", v)}
          >
            <SelectTrigger
              className="h-8 text-xs w-auto min-w-[140px]"
              data-ocid="complaint_board.apartment_filter"
            >
              <SelectValue placeholder="Apartment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apartments</SelectItem>
              {apartments.map((apt) => (
                <SelectItem key={String(apt.id)} value={String(apt.id)}>
                  {apt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex items-center gap-2">
          <SortAsc className="w-3.5 h-3.5 text-muted-foreground" />
          <Select
            value={filters.sort}
            onValueChange={(v) => onChange("sort", v)}
          >
            <SelectTrigger
              className="h-8 text-xs w-auto min-w-[140px]"
              data-ocid="complaint_board.sort_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="priority_high">Highest priority</SelectItem>
              <SelectItem value="priority_low">Lowest priority</SelectItem>
            </SelectContent>
          </Select>

          {hasActive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={onReset}
              data-ocid="complaint_board.clear_filters_button"
            >
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  message,
  cta,
}: {
  message: string;
  cta?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center gap-4"
      data-ocid="complaint_board.empty_state"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <ClipboardList className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <div>
        <p className="font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Complaints will appear here once submitted.
        </p>
      </div>
      {cta}
    </div>
  );
}

// ─── Complaints Grid ───────────────────────────────────────────────────────────

function ComplaintsGrid({
  complaints,
  apartments,
  isLoading,
  emptyMessage,
  onPostClick,
  isAuthenticated,
}: {
  complaints: Complaint[];
  apartments: Apartment[];
  isLoading?: boolean;
  emptyMessage: string;
  onPostClick?: () => void;
  isAuthenticated: boolean;
}) {
  const aptMap = useMemo(
    () => new Map(apartments.map((a) => [String(a.id), a])),
    [apartments],
  );

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        data-ocid="complaint_board.loading_state"
      >
        {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => (
          <ComplaintCardSkeleton key={k} />
        ))}
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        cta={
          isAuthenticated && onPostClick ? (
            <Button
              onClick={onPostClick}
              size="sm"
              className="gap-2"
              data-ocid="complaint_board.post_complaint_empty_button"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Post First Complaint
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      data-ocid="complaint_board.list"
    >
      {complaints.map((c, i) => (
        <ComplaintCard
          key={String(c.id)}
          complaint={c}
          apartment={aptMap.get(String(c.apartmentId))}
          index={i}
        />
      ))}
    </div>
  );
}

// ─── Login Prompt Banner ───────────────────────────────────────────────────────

function LoginPromptBanner({ onLogin }: { onLogin: () => void }) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg"
      data-ocid="complaint_board.login_prompt"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Sign in to post complaints
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You are viewing all complaints in read-only mode. Sign in with
            Internet Identity to submit and track your own.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        className="gap-2 flex-shrink-0"
        onClick={onLogin}
        data-ocid="complaint_board.login_button"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    </div>
  );
}

// ─── Post Complaint Modal ──────────────────────────────────────────────────────

function PostComplaintModal({
  apartments,
  onClose,
}: {
  apartments: Apartment[];
  onClose: () => void;
}) {
  const postComplaint = usePostComplaint();
  const [form, setForm] = useState({
    apartmentId: "",
    title: "",
    description: "",
    category: "",
    priority: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.apartmentId) e.apartmentId = "Please select an apartment.";
    if (!form.title.trim()) e.title = "Title is required.";
    else if (form.title.trim().length < 5)
      e.title = "Title must be at least 5 characters.";
    if (!form.description.trim()) e.description = "Description is required.";
    else if (form.description.trim().length < 10)
      e.description = "Please provide more detail (min 10 characters).";
    if (!form.category) e.category = "Please select a category.";
    if (!form.priority) e.priority = "Please select a priority.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const categoryMap: Record<string, ComplaintCategory> = {
      Maintenance: { Maintenance: null },
      Noise: { Noise: null },
      Cleanliness: { Cleanliness: null },
      Safety: { Safety: null },
      Other: { Other: null },
    };
    const priorityMap: Record<string, ComplaintPriority> = {
      Low: { Low: null },
      Medium: { Medium: null },
      High: { High: null },
    };

    const result = await postComplaint.mutateAsync({
      apartmentId: BigInt(form.apartmentId),
      title: form.title.trim(),
      description: form.description.trim(),
      category: categoryMap[form.category]!,
      priority: priorityMap[form.priority]!,
    });

    if ("ok" in result) {
      toast.success("Complaint submitted successfully.");
      onClose();
    } else {
      toast.error(result.err ?? "Failed to submit complaint.");
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-ocid="post_complaint.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-display">
            <MessageSquarePlus className="w-5 h-5 text-primary" />
            Post a Complaint
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Apartment */}
          <div className="space-y-1.5">
            <Label htmlFor="apt-select">Apartment</Label>
            <Select
              value={form.apartmentId}
              onValueChange={(v) => setForm((f) => ({ ...f, apartmentId: v }))}
            >
              <SelectTrigger
                id="apt-select"
                data-ocid="post_complaint.apartment_select"
              >
                <SelectValue placeholder="Select your apartment…" />
              </SelectTrigger>
              <SelectContent>
                {apartments.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No apartments available
                  </SelectItem>
                ) : (
                  apartments.map((apt) => (
                    <SelectItem key={String(apt.id)} value={String(apt.id)}>
                      {apt.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.apartmentId && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_complaint.apartment.field_error"
              >
                {errors.apartmentId}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="complaint-title">Title</Label>
            <Input
              id="complaint-title"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="post_complaint.title_input"
            />
            {errors.title && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_complaint.title.field_error"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="complaint-desc">Description</Label>
            <Textarea
              id="complaint-desc"
              placeholder="Describe the issue in detail…"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="post_complaint.description_textarea"
            />
            {errors.description && (
              <p
                className="text-xs text-destructive"
                data-ocid="post_complaint.description.field_error"
              >
                {errors.description}
              </p>
            )}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-select">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger
                  id="cat-select"
                  data-ocid="post_complaint.category_select"
                >
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Noise">Noise</SelectItem>
                  <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="post_complaint.category.field_error"
                >
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pri-select">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
              >
                <SelectTrigger
                  id="pri-select"
                  data-ocid="post_complaint.priority_select"
                >
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="post_complaint.priority.field_error"
                >
                  {errors.priority}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="post_complaint.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={postComplaint.isPending}
              data-ocid="post_complaint.submit_button"
            >
              {postComplaint.isPending ? "Submitting…" : "Submit Complaint"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ComplaintBoard() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile } = useGetUserProfile();
  const {
    data: allComplaints = [],
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useGetAllComplaints();
  const { data: myComplaints = [], isLoading: myLoading } =
    useGetMyComplaints();
  const { data: apartments = [] } = useGetApartments();

  const isTenant = userProfile && "Tenant" in userProfile.role;

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showPostModal, setShowPostModal] = useState(false);

  function handleFilterChange(key: keyof FilterState, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const filteredAll = useMemo(
    () => applyFilters(allComplaints, filters),
    [allComplaints, filters],
  );

  const filteredMy = useMemo(
    () => applyFilters(myComplaints, filters),
    [myComplaints, filters],
  );

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.priority !== "all" ||
    filters.apartment !== "all" ||
    filters.search !== "";

  if (allError) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <ErrorMessage
          title="Failed to load complaints"
          message="Could not retrieve complaint data. Please try again."
          onRetry={() => refetchAll()}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background"
      data-ocid="complaint_board.page"
    >
      {/* Page header zone */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <FileText className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold font-display text-foreground">
                  Complaint Board
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Browse, search, and manage apartment complaints
              </p>
            </div>

            {isAuthenticated && isTenant && (
              <Button
                onClick={() => setShowPostModal(true)}
                className="gap-2"
                data-ocid="complaint_board.post_complaint_button"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Post Complaint
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content zone */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {!isAuthenticated && <LoginPromptBanner onLogin={login} />}

        {/* Stats — only when data loaded */}
        {!allLoading && <StatsBar complaints={allComplaints} />}

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4">
          <FiltersBar
            filters={filters}
            apartments={apartments}
            onChange={handleFilterChange}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        {/* Results count */}
        {hasActiveFilters && !allLoading && (
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredAll.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {allComplaints.length}
            </span>{" "}
            complaints
          </p>
        )}

        {/* Tabs for authenticated users */}
        {isAuthenticated ? (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList data-ocid="complaint_board.tabs">
              <TabsTrigger value="all" data-ocid="complaint_board.all_tab">
                All Complaints
                {!allLoading && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filteredAll.length}
                  </Badge>
                )}
              </TabsTrigger>
              {isTenant && (
                <TabsTrigger value="mine" data-ocid="complaint_board.my_tab">
                  My Complaints
                  {!myLoading && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filteredMy.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all">
              <ComplaintsGrid
                complaints={filteredAll}
                apartments={apartments}
                isLoading={allLoading}
                emptyMessage={
                  hasActiveFilters
                    ? "No complaints match your filters."
                    : "No complaints have been posted yet."
                }
                onPostClick={
                  isTenant ? () => setShowPostModal(true) : undefined
                }
                isAuthenticated={isAuthenticated}
              />
            </TabsContent>

            {isTenant && (
              <TabsContent value="mine">
                <ComplaintsGrid
                  complaints={filteredMy}
                  apartments={apartments}
                  isLoading={myLoading}
                  emptyMessage="You haven't posted any complaints yet."
                  onPostClick={() => setShowPostModal(true)}
                  isAuthenticated={isAuthenticated}
                />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <ComplaintsGrid
            complaints={filteredAll}
            apartments={apartments}
            isLoading={allLoading}
            emptyMessage="No complaints have been posted yet."
            isAuthenticated={false}
          />
        )}
      </div>

      {showPostModal && (
        <PostComplaintModal
          apartments={apartments}
          onClose={() => setShowPostModal(false)}
        />
      )}
    </div>
  );
}
