import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Hash,
  LayoutDashboard,
  LogIn,
  PlusCircle,
  Shield,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
  getStatusKey,
} from "../components/Badge";
import { ErrorMessage } from "../components/ErrorMessage";
import { PageLoader } from "../components/LoadingSpinner";
import type { Apartment, Complaint } from "../hooks/useQueries";
import {
  useDeleteComplaint,
  useGetApartmentComplaints,
  useGetMyApartments,
  useGetMyComplaints,
  useGetUserProfile,
} from "../hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateShort(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  ocid,
}: {
  label: string;
  value: number | bigint | string;
  icon: React.ElementType;
  colorClass: string;
  ocid: string;
}) {
  return (
    <div
      className="bg-card border border-border rounded-lg p-4 flex items-center gap-3"
      data-ocid={ocid}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display font-bold text-foreground leading-none">
          {value.toString()}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Apartment Row (Host) ─────────────────────────────────────────────────────

function ApartmentComplaintRow({
  apartment,
  index,
}: {
  apartment: Apartment;
  index: number;
}) {
  const { data: complaints = [], isLoading } = useGetApartmentComplaints(
    apartment.id,
  );
  const open = complaints.filter((c) => "Open" in c.status).length;
  const inProgress = complaints.filter((c) => "InProgress" in c.status).length;
  const resolved = complaints.filter((c) => "Resolved" in c.status).length;

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 animate-fade-in"
      data-ocid={`profile.apartment.${index}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
            <h4 className="font-semibold text-foreground text-sm truncate">
              {apartment.name}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground truncate pl-6">
            {apartment.address}
          </p>
        </div>
        {isLoading ? (
          <div className="flex gap-2 pl-6 sm:pl-0">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pl-6 sm:pl-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[oklch(0.95_0.02_255)] text-[oklch(0.45_0.15_255)] border border-[oklch(0.85_0.04_255)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.18_255)]" />
              {open} open
            </span>
            {inProgress > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[oklch(0.95_0.05_80)] text-[oklch(0.45_0.15_80)] border border-[oklch(0.85_0.06_80)]">
                <Clock className="w-3 h-3" />
                {inProgress} in-progress
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[oklch(0.95_0.05_155)] text-[oklch(0.45_0.15_155)] border border-[oklch(0.85_0.06_155)]">
              <CheckCircle2 className="w-3 h-3" />
              {resolved} resolved
            </span>
          </div>
        )}
        <div className="flex items-center gap-1 pl-6 sm:pl-0 text-xs text-muted-foreground flex-shrink-0">
          <Hash className="w-3 h-3" />
          {complaints.length} total
        </div>
      </div>
    </div>
  );
}

// ─── Complaint Row (Tenant) ───────────────────────────────────────────────────

function ComplaintRow({
  complaint,
  index,
  onDelete,
  isDeleting,
}: {
  complaint: Complaint;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const isOpen = "Open" in complaint.status;
  return (
    <div
      className="bg-card border border-border rounded-lg p-4 transition-smooth hover:shadow-sm"
      data-ocid={`profile.complaint.${index}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-muted-foreground">
              #{complaint.id.toString().padStart(3, "0")}
            </span>
            <StatusBadge status={complaint.status} />
            <CategoryBadge category={complaint.category} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <Link
            to={`/complaint/${complaint.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors text-sm leading-tight"
          >
            {complaint.title}
          </Link>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {complaint.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(complaint.createdAt)}
            </span>
            {complaint.resolvedAt.length > 0 && complaint.resolvedAt[0] && (
              <span className="text-xs text-[oklch(0.45_0.15_155)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Resolved {formatDateShort(complaint.resolvedAt[0])}
              </span>
            )}
          </div>
          {complaint.resolutionNotes.length > 0 &&
            complaint.resolutionNotes[0] && (
              <div className="mt-2 p-2 bg-muted/60 border border-border rounded text-xs text-foreground">
                <span className="font-medium text-muted-foreground">
                  Host note:{" "}
                </span>
                {complaint.resolutionNotes[0]}
              </div>
            )}
        </div>
        <div className="flex items-center gap-2 pl-0 sm:pl-2 flex-shrink-0">
          <Link to={`/complaint/${complaint.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              aria-label="View complaint"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          {isOpen && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              disabled={isDeleting}
              aria-label="Delete complaint"
              data-ocid={`profile.delete_button.${index}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Host Section ─────────────────────────────────────────────────────────────

function HostProfileContent({ apartments }: { apartments: Apartment[] }) {
  return (
    <div className="space-y-6">
      {/* Quick CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Host Dashboard
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all complaints, update statuses, and view analytics for your
            properties.
          </p>
        </div>
        <Link to="/host">
          <Button
            className="gap-2 flex-shrink-0"
            data-ocid="profile.go_to_host_button"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Managed Apartments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">
            Managed Apartments
          </h3>
          <Badge variant="secondary" className="text-xs font-mono">
            {apartments.length}{" "}
            {apartments.length === 1 ? "property" : "properties"}
          </Badge>
        </div>

        {apartments.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg"
            data-ocid="profile.apartments_empty_state"
          >
            <Building2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground text-sm">
              No apartments yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Create your first apartment in the Host Dashboard.
            </p>
            <Link to="/host">
              <Button variant="outline" size="sm" className="gap-2">
                <PlusCircle className="w-4 h-4" /> Create Apartment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apartments.map((apt, idx) => (
              <ApartmentComplaintRow
                key={apt.id.toString()}
                apartment={apt}
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tenant Section ───────────────────────────────────────────────────────────

function TenantProfileContent({
  complaints,
  complaintsLoading,
  error,
  refetch,
}: {
  complaints: Complaint[];
  complaintsLoading: boolean;
  error: Error | null;
  refetch: () => void;
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);
  const deleteComplaint = useDeleteComplaint();

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => "Open" in c.status).length,
    inProgress: complaints.filter((c) => "InProgress" in c.status).length,
    resolved: complaints.filter((c) => "Resolved" in c.status).length,
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === "all") return true;
    return getStatusKey(c.status) === activeTab;
  });

  const sorted = [...filteredComplaints].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    const result = await deleteComplaint.mutateAsync(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if ("err" in result) {
      toast.error(result.err);
      return;
    }
    toast.success("Complaint deleted.");
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        data-ocid="profile.stats_section"
      >
        <StatCard
          label="Total Submitted"
          value={stats.total}
          icon={ClipboardList}
          colorClass="bg-primary/10 text-primary"
          ocid="profile.stat.total"
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon={AlertCircle}
          colorClass="bg-[oklch(0.95_0.02_255)] text-[oklch(0.45_0.15_255)]"
          ocid="profile.stat.open"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock}
          colorClass="bg-[oklch(0.95_0.05_80)] text-[oklch(0.45_0.15_80)]"
          ocid="profile.stat.in_progress"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          colorClass="bg-[oklch(0.95_0.05_155)] text-[oklch(0.45_0.15_155)]"
          ocid="profile.stat.resolved"
        />
      </div>

      {/* Quick Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/40 border border-border rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>
            {stats.resolved > 0
              ? `${Math.round((stats.resolved / stats.total) * 100)}% of your complaints have been resolved.`
              : "Submit a complaint to get started."}
          </span>
        </div>
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 flex-shrink-0"
            data-ocid="profile.new_complaint_button"
          >
            <PlusCircle className="w-4 h-4" /> New Complaint
          </Button>
        </Link>
      </div>

      {/* Complaint List with Tabs */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">
          Complaint History
        </h3>
        {complaintsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <ErrorMessage
            message="Failed to load your complaints."
            onRetry={refetch}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            data-ocid="profile.filter_tabs"
          >
            <TabsList className="mb-4" data-ocid="profile.filter.tab">
              <TabsTrigger value="all" data-ocid="profile.tab.all">
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="Open" data-ocid="profile.tab.open">
                Open ({stats.open})
              </TabsTrigger>
              <TabsTrigger
                value="InProgress"
                data-ocid="profile.tab.in_progress"
              >
                In Progress ({stats.inProgress})
              </TabsTrigger>
              <TabsTrigger value="Resolved" data-ocid="profile.tab.resolved">
                Resolved ({stats.resolved})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {sorted.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-border rounded-lg"
                  data-ocid="profile.complaints_empty_state"
                >
                  <ClipboardList className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground text-sm">
                    {activeTab === "all"
                      ? "No complaints yet"
                      : `No ${activeTab.toLowerCase()} complaints`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    {activeTab === "all"
                      ? "Post your first complaint from the Complaint Board."
                      : "Try a different filter."}
                  </p>
                  {activeTab === "all" && (
                    <Link to="/">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        data-ocid="profile.go_to_board_button"
                      >
                        <ClipboardList className="w-4 h-4" /> Complaint Board
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {sorted.map((complaint, idx) => (
                    <ComplaintRow
                      key={complaint.id.toString()}
                      complaint={complaint}
                      index={idx + 1}
                      onDelete={() => setConfirmDeleteId(complaint.id)}
                      isDeleting={deletingId === complaint.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="confirm_delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Delete Complaint?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The complaint will be permanently
            removed.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmDeleteId(null)}
              data-ocid="confirm_delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={deletingId !== null}
              data-ocid="confirm_delete.confirm_button"
            >
              {deletingId !== null ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Not Registered State ─────────────────────────────────────────────────────

function NotRegisteredPrompt({ principalText }: { principalText: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-16 px-4">
      <div className="inline-flex w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-5">
        <UserCheck className="w-8 h-8 text-primary" />
      </div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">
        Complete your registration
      </h2>
      <p className="text-sm text-muted-foreground mb-2">
        You are connected, but haven't set up your profile yet.
      </p>
      <p className="text-xs font-mono text-muted-foreground/70 mb-6 truncate px-4">
        {principalText}
      </p>
      <div className="bg-muted/40 border border-border rounded-lg p-4 text-left space-y-3 mb-6">
        <p className="text-sm font-medium text-foreground">
          You can register as:
        </p>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Host</p>
            <p className="text-xs text-muted-foreground">
              Manage apartments, track and resolve tenant complaints.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <User className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Tenant</p>
            <p className="text-xs text-muted-foreground">
              Submit complaints about your apartment and track their status.
            </p>
          </div>
        </div>
      </div>
      <Link to="/">
        <Button className="gap-2" data-ocid="profile.register_button">
          <ArrowRight className="w-4 h-4" /> Go to Complaint Board to Register
        </Button>
      </Link>
    </div>
  );
}

// ─── Login Prompt ─────────────────────────────────────────────────────────────

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="max-w-sm mx-auto text-center py-20 px-4">
      <div className="inline-flex w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-5">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">
        Sign in to view your profile
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Your account details, complaint history, and apartment information will
        appear here.
      </p>
      <Button
        onClick={onLogin}
        className="gap-2 w-full sm:w-auto"
        size="lg"
        data-ocid="profile.login_button"
      >
        <LogIn className="w-4 h-4" /> Sign in with Internet Identity
      </Button>
    </div>
  );
}

// ─── Profile Header ───────────────────────────────────────────────────────────

function ProfileHeader({
  name,
  isHost,
  principalText,
  createdAt,
}: {
  name: string;
  isHost: boolean;
  principalText: string;
  createdAt: bigint;
}) {
  return (
    <div
      className="bg-card border border-border rounded-lg p-6 mb-6"
      data-ocid="profile.header"
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {isHost ? (
            <Building2 className="w-8 h-8 text-primary" />
          ) : (
            <User className="w-8 h-8 text-primary" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {name}
            </h1>
            <Badge
              variant={isHost ? "default" : "secondary"}
              className="text-xs font-medium"
              data-ocid="profile.role_badge"
            >
              {isHost ? "🏠 Host" : "👤 Tenant"}
            </Badge>
          </div>
          <p className="text-xs font-mono text-muted-foreground/70 truncate mb-2">
            {principalText}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {formatDate(createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {isHost ? "Host Account" : "Tenant Account"}
            </span>
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex-shrink-0">
          {isHost ? (
            <Link to="/host">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                data-ocid="profile.host_dashboard_link"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                data-ocid="profile.complaint_board_link"
              >
                <ClipboardList className="w-3.5 h-3.5" /> Complaint Board
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Host Stats Bar ───────────────────────────────────────────────────────────

function HostStatsBar({ apartments }: { apartments: Apartment[] }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
      data-ocid="profile.host_stats"
    >
      <StatCard
        label="Properties Managed"
        value={apartments.length}
        icon={Building2}
        colorClass="bg-primary/10 text-primary"
        ocid="profile.stat.properties"
      />
      <StatCard
        label="Active Since"
        value={
          apartments.length > 0 ? formatDateShort(apartments[0].createdAt) : "—"
        }
        icon={Calendar}
        colorClass="bg-muted text-muted-foreground"
        ocid="profile.stat.active_since"
      />
      <StatCard
        label="Role"
        value="Host"
        icon={Shield}
        colorClass="bg-accent/20 text-accent"
        ocid="profile.stat.role"
      />
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────

export function ProfilePage() {
  const { identity, login } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const {
    data: myComplaints = [],
    isLoading: complaintsLoading,
    error: complaintsError,
    refetch,
  } = useGetMyComplaints();
  const { data: myApartments = [], isLoading: apartmentsLoading } =
    useGetMyApartments();

  const isHost = profile ? "Host" in profile.role : false;
  const isLoading = profileLoading;

  // Not logged in
  if (!identity) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoginPrompt onLogin={() => login()} />
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return <PageLoader label="Loading profile…" />;
  }

  // Logged in but not registered
  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <NotRegisteredPrompt principalText={identity.getPrincipal().toText()} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Profile Header Card */}
      <ProfileHeader
        name={profile.name}
        isHost={isHost}
        principalText={identity.getPrincipal().toText()}
        createdAt={profile.createdAt}
      />

      <Separator className="my-6" />

      {/* Role-based Content */}
      {isHost ? (
        <div>
          {/* Host Stats */}
          {!apartmentsLoading && <HostStatsBar apartments={myApartments} />}
          {apartmentsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <HostProfileContent apartments={myApartments} />
          )}
        </div>
      ) : (
        <TenantProfileContent
          complaints={myComplaints}
          complaintsLoading={complaintsLoading}
          error={complaintsError}
          refetch={refetch}
        />
      )}
    </div>
  );
}
