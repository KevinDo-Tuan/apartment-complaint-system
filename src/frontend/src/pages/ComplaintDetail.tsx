import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
  getStatusKey,
} from "../components/Badge";
import { ErrorMessage } from "../components/ErrorMessage";
import {
  useDeleteComplaint,
  useGetApartments,
  useGetComplaint,
  useGetUserProfile,
  useUpdateComplaintStatus,
} from "../hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateLong(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Detail Skeleton ───────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6" data-ocid="complaint_detail.loading_state">
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-6 pt-4 border-t border-border">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  );
}

// ─── Status Timeline ───────────────────────────────────────────────────────────

function StatusTimeline({
  status,
  createdAt,
  updatedAt,
  resolvedAt,
}: {
  status: import("../hooks/useQueries").ComplaintStatus;
  createdAt: bigint;
  updatedAt: bigint;
  resolvedAt: [] | [bigint];
}) {
  const statusKey = getStatusKey(status);

  const steps = [
    {
      key: "Open",
      label: "Submitted",
      date: formatDateShort(createdAt),
      done: true,
      icon: <Circle className="w-4 h-4" />,
    },
    {
      key: "InProgress",
      label: "In Progress",
      date:
        statusKey === "InProgress" || statusKey === "Resolved"
          ? formatDateShort(updatedAt)
          : null,
      done: statusKey === "InProgress" || statusKey === "Resolved",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: "Resolved",
      label: "Resolved",
      date: resolvedAt.length > 0 ? formatDateShort(resolvedAt[0]!) : null,
      done: statusKey === "Resolved",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="flex items-start gap-0"
      data-ocid="complaint_detail.timeline"
    >
      {steps.map((step, idx) => (
        <div key={step.key} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            {idx > 0 && (
              <div
                className={`flex-1 h-0.5 ${step.done ? "bg-primary" : "bg-border"}`}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                step.done
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.icon}
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${steps[idx + 1]?.done ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
          <div className="mt-2 text-center">
            <p
              className={`text-xs font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}
            >
              {step.label}
            </p>
            {step.date && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.date}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Host Actions Panel ────────────────────────────────────────────────────────

function HostActionsPanel({
  complaintId,
  statusKey,
}: {
  complaintId: bigint;
  statusKey: string;
}) {
  const updateStatus = useUpdateComplaintStatus();
  const [resolutionNote, setResolutionNote] = useState("");
  const [error, setError] = useState("");

  async function handleMarkInProgress() {
    const result = await updateStatus.mutateAsync({
      complaintId,
      status: { InProgress: null },
      resolutionNotes: [],
    });
    if ("err" in result) {
      toast.error(result.err ?? "Failed to update status.");
    } else {
      toast.success("Marked as In Progress.");
    }
  }

  async function handleMarkResolved() {
    if (!resolutionNote.trim()) {
      setError("Please add a resolution note before marking as resolved.");
      return;
    }
    setError("");
    const result = await updateStatus.mutateAsync({
      complaintId,
      status: { Resolved: null },
      resolutionNotes: [resolutionNote.trim()],
    });
    if ("err" in result) {
      toast.error(result.err ?? "Failed to update status.");
    } else {
      toast.success("Complaint marked as resolved.");
      setResolutionNote("");
    }
  }

  async function handleReopen() {
    const result = await updateStatus.mutateAsync({
      complaintId,
      status: { Open: null },
      resolutionNotes: [],
    });
    if ("err" in result) {
      toast.error(result.err ?? "Failed to reopen complaint.");
    } else {
      toast.success("Complaint reopened.");
    }
  }

  if (statusKey === "Resolved") {
    return (
      <div
        className="bg-card border border-border rounded-lg p-5"
        data-ocid="complaint_detail.host_actions"
      >
        <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Host Actions
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This complaint has been resolved.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReopen}
            disabled={updateStatus.isPending}
            className="gap-2"
            data-ocid="complaint_detail.reopen_button"
          >
            <Circle className="w-3.5 h-3.5" />
            Reopen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-lg p-5 space-y-4"
      data-ocid="complaint_detail.host_actions"
    >
      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
        <Building2 className="w-4 h-4 text-primary" />
        Host Actions
      </h3>

      {statusKey === "Open" && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-foreground">
              Mark as In Progress
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acknowledge the complaint and begin working on it.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkInProgress}
            disabled={updateStatus.isPending}
            className="gap-2 flex-shrink-0 ml-4"
            data-ocid="complaint_detail.mark_inprogress_button"
          >
            <Clock className="w-3.5 h-3.5" />
            Start
          </Button>
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="resolution-note" className="text-sm font-medium">
          Resolution Note{" "}
          <span className="text-muted-foreground font-normal">
            (required to resolve)
          </span>
        </Label>
        <Textarea
          id="resolution-note"
          placeholder="Describe how the issue was resolved…"
          value={resolutionNote}
          onChange={(e) => {
            setResolutionNote(e.target.value);
            if (error) setError("");
          }}
          rows={3}
          data-ocid="complaint_detail.resolution_note_input"
        />
        {error && (
          <p
            className="text-xs text-destructive"
            data-ocid="complaint_detail.resolution_note.field_error"
          >
            {error}
          </p>
        )}
      </div>

      <Button
        onClick={handleMarkResolved}
        disabled={updateStatus.isPending}
        className="w-full gap-2"
        data-ocid="complaint_detail.mark_resolved_button"
      >
        <CheckCircle2 className="w-4 h-4" />
        {updateStatus.isPending ? "Updating…" : "Mark as Resolved"}
      </Button>
    </div>
  );
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-sm"
        data-ocid="delete_complaint.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete Complaint?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This action is permanent and cannot be undone. Your complaint will be
          removed from the board.
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-ocid="delete_complaint.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={isDeleting}
            data-ocid="delete_complaint.confirm_button"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const { data: apartments = [] } = useGetApartments();

  const complaintId = id ? BigInt(id) : null;
  const {
    data: complaint,
    isLoading,
    error,
    refetch,
  } = useGetComplaint(complaintId);
  const deleteComplaint = useDeleteComplaint();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const myPrincipal = identity?.getPrincipal().toText();
  const isHost = profile && "Host" in profile.role;
  const isOwner = complaint && myPrincipal === complaint.tenantPrincipal;
  const statusKey = complaint ? getStatusKey(complaint.status) : "";

  const apartment = apartments.find(
    (a) => complaint && String(a.id) === String(complaint.apartmentId),
  );

  async function handleDelete() {
    if (!complaint) return;
    setIsDeleting(true);
    const result = await deleteComplaint.mutateAsync(complaint.id);
    setIsDeleting(false);
    if ("err" in result) {
      toast.error(result.err ?? "Failed to delete complaint.");
    } else {
      toast.success("Complaint deleted.");
      navigate("/");
    }
  }

  return (
    <div
      className="min-h-screen bg-background"
      data-ocid="complaint_detail.page"
    >
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="complaint_detail.back_link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Complaint Board
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {error ? (
          <ErrorMessage
            title="Failed to load complaint"
            message="Could not retrieve complaint details. Please try again."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <DetailSkeleton />
        ) : !complaint ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
            data-ocid="complaint_detail.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg">
                Complaint not found
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                This complaint may have been deleted or the ID is invalid.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Board
            </Button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            data-ocid="complaint_detail.panel"
          >
            {/* Left column — main content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Main complaint card */}
              <div className="bg-card border border-border rounded-lg p-6">
                {/* ID + Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm font-mono text-muted-foreground">
                    #{String(complaint.id).padStart(3, "0")}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <CategoryBadge category={complaint.category} />
                  <PriorityBadge priority={complaint.priority} />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold font-display text-foreground mb-4 leading-tight">
                  {complaint.title}
                </h1>

                {/* Description */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {complaint.description}
                  </p>
                </div>

                {/* Timestamps */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-border text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Submitted {formatDateLong(complaint.createdAt)}
                  </span>
                  {complaint.updatedAt !== complaint.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Updated {formatDateLong(complaint.updatedAt)}
                    </span>
                  )}
                  {complaint.resolvedAt.length > 0 && (
                    <span className="flex items-center gap-1.5 text-[oklch(0.45_0.15_155)] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved {formatDateLong(complaint.resolvedAt[0]!)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Progress
                </h3>
                <StatusTimeline
                  status={complaint.status}
                  createdAt={complaint.createdAt}
                  updatedAt={complaint.updatedAt}
                  resolvedAt={complaint.resolvedAt}
                />
              </div>

              {/* Resolution notes */}
              {complaint.resolutionNotes.length > 0 && (
                <div
                  className="border border-[oklch(0.85_0.08_155)] bg-[oklch(0.95_0.05_155)] rounded-lg p-5"
                  data-ocid="complaint_detail.resolution_notes"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.45_0.15_155)] flex-shrink-0" />
                    <h3 className="font-semibold text-[oklch(0.35_0.12_155)] text-sm">
                      Resolution Notes
                    </h3>
                  </div>
                  <p className="text-sm text-[oklch(0.40_0.13_155)] leading-relaxed whitespace-pre-wrap">
                    {complaint.resolutionNotes[0]}
                  </p>
                </div>
              )}

              {/* Delete button — complaint author only, open/in-progress complaints */}
              {isOwner && statusKey !== "Resolved" && (
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowDeleteConfirm(true)}
                    data-ocid="complaint_detail.delete_button"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Complaint
                  </Button>
                </div>
              )}
            </div>

            {/* Right column — metadata + host actions */}
            <div className="space-y-5">
              {/* Metadata card */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Details
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Apartment
                      </p>
                      <p className="font-medium text-foreground">
                        {apartment?.name ??
                          `Apartment #${complaint.apartmentId}`}
                      </p>
                      {apartment?.address && (
                        <p className="text-xs text-muted-foreground">
                          {apartment.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Submitted by
                      </p>
                      <p className="font-medium text-foreground font-mono text-xs break-all">
                        {complaint.tenantPrincipal.slice(0, 20)}…
                      </p>
                      {isOwner && (
                        <span className="inline-block mt-1 text-xs text-primary font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Host actions */}
              {isHost && (
                <HostActionsPanel
                  complaintId={complaint.id}
                  statusKey={statusKey}
                />
              )}

              {/* Not authenticated prompt */}
              {!identity && (
                <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sign in to manage this complaint.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
