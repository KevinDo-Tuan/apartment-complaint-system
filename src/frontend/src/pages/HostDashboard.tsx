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
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Filter,
  LogIn,
  PlusCircle,
  RefreshCw,
  Shield,
  User,
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
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from "../hooks/useQueries";
import {
  useCreateApartment,
  useGetApartmentComplaints,
  useGetComplaintStats,
  useGetMyApartments,
  useGetUserProfile,
  useUpdateComplaintStatus,
} from "../hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrincipal(p: string) {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}…${p.slice(-6)}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  active,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-card border rounded-lg p-4 flex items-center gap-4 transition-all duration-150 ${
        active
          ? "border-primary ring-2 ring-primary/20 shadow-sm"
          : "border-border hover:border-primary/40 hover:shadow-sm"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-display font-semibold text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </button>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

type StatusFilter = "All" | "Open" | "InProgress" | "Resolved";
type CategoryFilter =
  | "All"
  | "Maintenance"
  | "Noise"
  | "Cleanliness"
  | "Safety"
  | "Other";
type PriorityFilter = "All" | "High" | "Medium" | "Low";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "All", label: "All Status" },
  { value: "Open", label: "Open" },
  { value: "InProgress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "All", label: "All Categories" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Noise", label: "Noise" },
  { value: "Cleanliness", label: "Cleanliness" },
  { value: "Safety", label: "Safety" },
  { value: "Other", label: "Other" },
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: "All", label: "All Priority" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

// ─── Update Status Inline Panel ───────────────────────────────────────────────

function UpdateStatusPanel({
  complaintId,
  currentStatus,
  onClose,
}: {
  complaintId: bigint;
  currentStatus: ComplaintStatus;
  onClose: () => void;
}) {
  const updateStatus = useUpdateComplaintStatus();
  const currentKey = getStatusKey(currentStatus);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentKey);
  const [notes, setNotes] = useState("");

  const statusMap: Record<string, ComplaintStatus> = {
    Open: { Open: null },
    InProgress: { InProgress: null },
    Resolved: { Resolved: null },
  };

  const handleUpdate = async () => {
    const newStatus = statusMap[selectedStatus];
    if (!newStatus) return;
    const result = await updateStatus.mutateAsync({
      complaintId,
      status: newStatus,
      resolutionNotes: notes.trim() ? [notes.trim()] : [],
    });
    if ("err" in result) {
      toast.error(result.err);
      return;
    }
    toast.success("Status updated successfully");
    onClose();
  };

  return (
    <div
      className="mt-3 p-3 bg-muted/40 rounded-lg border border-border space-y-3 animate-fade-in"
      data-ocid="update_status.panel"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
          Update Status
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close panel"
          data-ocid="update_status.close_button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="h-8 text-xs" data-ocid="update_status.select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Open">Open</SelectItem>
          <SelectItem value="InProgress">In Progress</SelectItem>
          <SelectItem value="Resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>
      {selectedStatus === "Resolved" && (
        <Textarea
          placeholder="Optional resolution notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-xs min-h-[60px] resize-none"
          data-ocid="update_status.notes_textarea"
        />
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={handleUpdate}
          disabled={updateStatus.isPending || selectedStatus === currentKey}
          data-ocid="update_status.confirm_button"
        >
          {updateStatus.isPending ? "Saving…" : "Save"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={onClose}
          data-ocid="update_status.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Complaint Card ───────────────────────────────────────────────────────────

function ComplaintCard({
  complaint,
  idx,
}: {
  complaint: {
    id: bigint;
    title: string;
    description: string;
    tenantPrincipal: string;
    createdAt: bigint;
    resolvedAt: [] | [bigint];
    resolutionNotes: [] | [string];
    status: ComplaintStatus;
    category: ComplaintCategory;
    priority: ComplaintPriority;
  };
  idx: number;
}) {
  const [showUpdate, setShowUpdate] = useState(false);
  const isResolved = "Resolved" in complaint.status;

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors duration-150"
      data-ocid={`host_dashboard.complaint.${idx}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="font-mono text-xs text-muted-foreground">
            #{String(complaint.id).padStart(2, "0")}
          </span>
          <StatusBadge status={complaint.status} />
          <CategoryBadge category={complaint.category} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <Link
          to={`/complaint/${complaint.id}`}
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
          data-ocid={`host_dashboard.complaint_detail_link.${idx}`}
        >
          View <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Title */}
      <Link
        to={`/complaint/${complaint.id}`}
        className="block font-semibold text-foreground hover:text-primary transition-colors text-sm leading-snug mb-1"
      >
        {complaint.title}
      </Link>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {complaint.description}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {formatPrincipal(complaint.tenantPrincipal)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(complaint.createdAt)}
        </span>
        {isResolved && complaint.resolvedAt.length > 0 && (
          <span className="flex items-center gap-1 text-[oklch(0.45_0.15_155)]">
            <CheckCircle2 className="w-3 h-3" />
            Resolved {formatDate(complaint.resolvedAt[0]!)}
          </span>
        )}
      </div>

      {/* Resolution notes */}
      {isResolved && complaint.resolutionNotes.length > 0 && (
        <div className="mt-2 p-2 bg-[oklch(0.95_0.05_155)] border border-[oklch(0.88_0.06_155)] rounded text-xs text-[oklch(0.35_0.12_155)]">
          <span className="font-medium">Note: </span>
          {complaint.resolutionNotes[0]}
        </div>
      )}

      {/* Update status action */}
      {!showUpdate && (
        <div className="mt-3 pt-2 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5"
            onClick={() => setShowUpdate(true)}
            data-ocid={`host_dashboard.update_status_button.${idx}`}
          >
            <RefreshCw className="w-3 h-3" />
            Update Status
          </Button>
        </div>
      )}
      {showUpdate && (
        <UpdateStatusPanel
          complaintId={complaint.id}
          currentStatus={complaint.status}
          onClose={() => setShowUpdate(false)}
        />
      )}
    </div>
  );
}

// ─── Apartment Panel ──────────────────────────────────────────────────────────

function ApartmentPanel({
  apartmentId,
  apartmentName,
}: {
  apartmentId: bigint;
  apartmentName: string;
}) {
  const {
    data: complaints = [],
    isLoading,
    error,
    refetch,
  } = useGetApartmentComplaints(apartmentId);
  const { data: stats } = useGetComplaintStats(apartmentId);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");
  const [search, setSearch] = useState("");

  // When clicking a stat card, toggle the status filter
  const handleStatClick = (key: StatusFilter) => {
    setStatusFilter((prev) => (prev === key ? "All" : key));
  };

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter !== "All" && getStatusKey(c.status) !== statusFilter)
        return false;
      if (
        categoryFilter !== "All" &&
        getCategoryKey(c.category) !== categoryFilter
      )
        return false;
      if (
        priorityFilter !== "All" &&
        getPriorityKey(c.priority) !== priorityFilter
      )
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [complaints, statusFilter, categoryFilter, priorityFilter, search]);

  const hasActiveFilters =
    statusFilter !== "All" ||
    categoryFilter !== "All" ||
    priorityFilter !== "All" ||
    search.trim() !== "";

  const clearFilters = () => {
    setStatusFilter("All");
    setCategoryFilter("All");
    setPriorityFilter("All");
    setSearch("");
  };

  if (isLoading)
    return (
      <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading complaints…</span>
      </div>
    );

  if (error)
    return (
      <ErrorMessage
        message="Failed to load complaints for this apartment."
        onRetry={refetch}
      />
    );

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      {stats && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          data-ocid="host_dashboard.stats"
        >
          <StatCard
            label="Total"
            value={Number(stats.total)}
            icon={ClipboardList}
            colorClass="bg-primary/10 text-primary"
          />
          <StatCard
            label="Open"
            value={Number(stats.open)}
            icon={AlertCircle}
            colorClass="bg-[oklch(0.95_0.02_255)] text-[oklch(0.45_0.15_255)]"
            active={statusFilter === "Open"}
            onClick={() => handleStatClick("Open")}
          />
          <StatCard
            label="In Progress"
            value={Number(stats.inProgress)}
            icon={Clock}
            colorClass="bg-[oklch(0.95_0.05_80)] text-[oklch(0.45_0.15_80)]"
            active={statusFilter === "InProgress"}
            onClick={() => handleStatClick("InProgress")}
          />
          <StatCard
            label="Resolved"
            value={Number(stats.resolved)}
            icon={CheckCircle2}
            colorClass="bg-[oklch(0.95_0.05_155)] text-[oklch(0.45_0.15_155)]"
            active={statusFilter === "Resolved"}
            onClick={() => handleStatClick("Resolved")}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div
        className="bg-card border border-border rounded-lg p-3 space-y-3"
        data-ocid="host_dashboard.filter_bar"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Search complaints…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm max-w-[220px]"
            data-ocid="host_dashboard.search_input"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger
              className="h-8 text-xs w-[130px]"
              data-ocid="host_dashboard.status_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
          >
            <SelectTrigger
              className="h-8 text-xs w-[145px]"
              data-ocid="host_dashboard.category_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}
          >
            <SelectTrigger
              className="h-8 text-xs w-[130px]"
              data-ocid="host_dashboard.priority_filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs gap-1 text-muted-foreground"
              onClick={clearFilters}
              data-ocid="host_dashboard.clear_filters_button"
            >
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {filtered.length} of {complaints.length} complaint
            {complaints.length !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && (
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs font-medium">
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="host_dashboard.complaints.empty_state"
        >
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-foreground">No complaints yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complaints for <strong>{apartmentName}</strong> will appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          data-ocid="host_dashboard.filtered.empty_state"
        >
          <Filter className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-foreground text-sm">
            No complaints match your filters
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Try adjusting your filters or search term.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={clearFilters}
            className="text-xs h-7"
            data-ocid="host_dashboard.filtered_empty.clear_button"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
          data-ocid="host_dashboard.complaints_list"
        >
          {filtered.map((complaint, i) => (
            <ComplaintCard
              key={complaint.id.toString()}
              complaint={complaint}
              idx={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Host Dashboard ───────────────────────────────────────────────────────────

export function HostDashboard() {
  const { identity, login } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const {
    data: apartments = [],
    isLoading: aptLoading,
    error: aptError,
    refetch,
  } = useGetMyApartments();
  const createApartment = useCreateApartment();

  const [showAddApt, setShowAddApt] = useState(false);
  const [aptName, setAptName] = useState("");
  const [aptAddress, setAptAddress] = useState("");
  const [selectedApt, setSelectedApt] = useState<string>("");

  const isHost = profile && "Host" in profile.role;
  const isLoading = profileLoading || aptLoading;

  const handleCreateApartment = async () => {
    if (!aptName.trim() || !aptAddress.trim()) return;
    const result = await createApartment.mutateAsync({
      name: aptName.trim(),
      address: aptAddress.trim(),
    });
    if ("err" in result) {
      toast.error(result.err);
      return;
    }
    toast.success("Apartment created successfully!");
    setShowAddApt(false);
    setAptName("");
    setAptAddress("");
  };

  // ── Not authenticated ──
  if (!identity) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-24 text-center"
        data-ocid="host_dashboard.unauthenticated"
      >
        <div className="inline-flex w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-5">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          Sign in required
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          You must be signed in as a Host to access this dashboard.
        </p>
        <Button
          onClick={() => login()}
          className="gap-2"
          data-ocid="host_dashboard.login_button"
        >
          <LogIn className="w-4 h-4" />
          Sign in with Internet Identity
        </Button>
      </div>
    );
  }

  if (isLoading) return <PageLoader label="Loading dashboard…" />;

  // ── Not a host ──
  if (profile && !isHost) {
    return (
      <div
        className="max-w-xl mx-auto px-4 py-24 text-center"
        data-ocid="host_dashboard.not_host"
      >
        <div className="inline-flex w-16 h-16 rounded-full bg-muted items-center justify-center mb-5">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          Host access only
        </h2>
        <p className="text-muted-foreground text-sm">
          This dashboard is only accessible to registered hosts. Please register
          as a host first to manage apartments and complaints.
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-ocid="host_dashboard.page"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Host Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your apartments and resolve tenant complaints
          </p>
        </div>
        <Button
          onClick={() => setShowAddApt(true)}
          className="gap-2 self-start sm:self-auto"
          data-ocid="host_dashboard.add_apartment_button"
        >
          <PlusCircle className="w-4 h-4" />
          Add Apartment
        </Button>
      </div>

      {/* Error state */}
      {aptError ? (
        <ErrorMessage message="Failed to load apartments." onRetry={refetch} />
      ) : apartments.length === 0 ? (
        /* ── No apartments CTA ── */
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="host_dashboard.empty_state"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <Building2 className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">
            Create your first apartment
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Add an apartment to start receiving and managing complaints from
            your tenants.
          </p>
          <Button
            onClick={() => setShowAddApt(true)}
            className="gap-2"
            data-ocid="host_dashboard.add_first_button"
          >
            <PlusCircle className="w-4 h-4" />
            Create Apartment
          </Button>
        </div>
      ) : (
        /* ── Main content ── */
        <div className="space-y-6">
          {/* Apartment selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 max-w-sm">
              <Label
                htmlFor="apt-select"
                className="text-sm font-medium mb-2 block"
              >
                Apartment
              </Label>
              <Select
                value={selectedApt || apartments[0]?.id.toString()}
                onValueChange={setSelectedApt}
              >
                <SelectTrigger
                  id="apt-select"
                  className="w-full"
                  data-ocid="host_dashboard.apartment_select"
                >
                  <SelectValue placeholder="Choose apartment" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apt) => (
                    <SelectItem
                      key={apt.id.toString()}
                      value={apt.id.toString()}
                    >
                      <span className="flex flex-col">
                        <span className="font-medium">{apt.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {apartments.length > 1 && (
              <p className="text-xs text-muted-foreground mt-5 sm:mt-auto pb-0.5">
                {apartments.length} apartments total
              </p>
            )}
          </div>

          {/* Active apartment info + complaint panel */}
          {(() => {
            const activeId = BigInt(
              selectedApt || apartments[0]?.id.toString() || "0",
            );
            const activeApt = apartments.find((a) => a.id === activeId);
            if (!activeApt) return null;
            return (
              <div className="space-y-5">
                {/* Apartment info card */}
                <div className="bg-muted/40 border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {activeApt.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activeApt.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                    <span>Added {formatDate(activeApt.createdAt)}</span>
                  </div>
                </div>

                {/* Complaint panel with filters */}
                <ApartmentPanel
                  apartmentId={activeApt.id}
                  apartmentName={activeApt.name}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Apartment Dialog */}
      <Dialog open={showAddApt} onOpenChange={setShowAddApt}>
        <DialogContent className="sm:max-w-md" data-ocid="add_apartment.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Add New Apartment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="apt-name">Apartment Name</Label>
              <Input
                id="apt-name"
                placeholder="e.g. Sunset Residences Block A"
                value={aptName}
                onChange={(e) => setAptName(e.target.value)}
                data-ocid="add_apartment.name_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apt-addr">Address</Label>
              <Input
                id="apt-addr"
                placeholder="Full street address"
                value={aptAddress}
                onChange={(e) => setAptAddress(e.target.value)}
                data-ocid="add_apartment.address_input"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAddApt(false);
                  setAptName("");
                  setAptAddress("");
                }}
                data-ocid="add_apartment.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateApartment}
                disabled={
                  createApartment.isPending ||
                  !aptName.trim() ||
                  !aptAddress.trim()
                }
                data-ocid="add_apartment.submit_button"
              >
                {createApartment.isPending ? "Creating…" : "Create Apartment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
