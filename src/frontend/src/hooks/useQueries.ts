import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = { Host: null } | { Tenant: null };
export type ComplaintStatus =
  | { Open: null }
  | { InProgress: null }
  | { Resolved: null };
export type ComplaintCategory =
  | { Maintenance: null }
  | { Noise: null }
  | { Cleanliness: null }
  | { Safety: null }
  | { Other: null };
export type ComplaintPriority =
  | { Low: null }
  | { Medium: null }
  | { High: null };

export interface UserProfile {
  principal: string;
  name: string;
  role: UserRole;
  apartmentId: [] | [bigint];
  createdAt: bigint;
}

export interface Apartment {
  id: bigint;
  name: string;
  address: string;
  hostPrincipal: string;
  createdAt: bigint;
}

export interface Complaint {
  id: bigint;
  tenantPrincipal: string;
  apartmentId: bigint;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: bigint;
  updatedAt: bigint;
  resolvedAt: [] | [bigint];
  resolutionNotes: [] | [string];
}

export interface ComplaintStats {
  total: bigint;
  open: bigint;
  inProgress: bigint;
  resolved: bigint;
}

export interface CreateApartmentArgs {
  name: string;
  address: string;
}

export interface PostComplaintArgs {
  apartmentId: bigint;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
}

export interface UpdateComplaintStatusArgs {
  complaintId: bigint;
  status: ComplaintStatus;
  resolutionNotes: [] | [string];
}

// ─── Typed actor helper ───────────────────────────────────────────────────────

type TypedActor = {
  getUserProfile: () => Promise<[] | [UserProfile]>;
  isRegistered: () => Promise<boolean>;
  registerAsHost: (
    name: string,
  ) => Promise<{ ok: UserProfile } | { err: string }>;
  registerAsTenant: (
    name: string,
    apartmentId: bigint,
  ) => Promise<{ ok: UserProfile } | { err: string }>;
  getApartments: () => Promise<Apartment[]>;
  getMyApartments: () => Promise<Apartment[]>;
  createApartment: (
    name: string,
    address: string,
  ) => Promise<{ ok: Apartment } | { err: string }>;
  getAllComplaints: () => Promise<Complaint[]>;
  getMyComplaints: () => Promise<Complaint[]>;
  getApartmentComplaints: (id: bigint) => Promise<Complaint[]>;
  getComplaint: (id: bigint) => Promise<[] | [Complaint]>;
  postComplaint: (
    apartmentId: bigint,
    title: string,
    description: string,
    category: ComplaintCategory,
    priority: ComplaintPriority,
  ) => Promise<{ ok: Complaint } | { err: string }>;
  updateComplaintStatus: (
    id: bigint,
    status: ComplaintStatus,
    notes: [] | [string],
  ) => Promise<{ ok: Complaint } | { err: string }>;
  deleteComplaint: (id: bigint) => Promise<{ ok: null } | { err: string }>;
  getComplaintsByStatus: (status: ComplaintStatus) => Promise<Complaint[]>;
  getComplaintsByCategory: (cat: ComplaintCategory) => Promise<Complaint[]>;
  getComplaintStats: (id: bigint) => Promise<[] | [ComplaintStats]>;
};

function typed(actor: unknown): TypedActor {
  return actor as TypedActor;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetUserProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await typed(actor).getUserProfile();
      return result.length > 0 ? (result[0] ?? null) : null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsRegistered() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isRegistered"],
    queryFn: async () => {
      if (!actor) return false;
      return typed(actor).isRegistered();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterAsHost() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return typed(actor).registerAsHost(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      qc.invalidateQueries({ queryKey: ["isRegistered"] });
    },
  });
}

export function useRegisterAsTenant() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      apartmentId,
    }: { name: string; apartmentId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return typed(actor).registerAsTenant(name, apartmentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      qc.invalidateQueries({ queryKey: ["isRegistered"] });
    },
  });
}

// ─── Apartments ───────────────────────────────────────────────────────────────

export function useGetApartments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Apartment[]>({
    queryKey: ["apartments"],
    queryFn: async () => {
      if (!actor) return [];
      return typed(actor).getApartments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyApartments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Apartment[]>({
    queryKey: ["myApartments"],
    queryFn: async () => {
      if (!actor) return [];
      return typed(actor).getMyApartments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateApartment() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: CreateApartmentArgs) => {
      if (!actor) throw new Error("Not connected");
      return typed(actor).createApartment(args.name, args.address);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apartments"] });
      qc.invalidateQueries({ queryKey: ["myApartments"] });
    },
  });
}

// ─── Complaints ───────────────────────────────────────────────────────────────

export function useGetAllComplaints() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Complaint[]>({
    queryKey: ["allComplaints"],
    queryFn: async () => {
      if (!actor) return [];
      return typed(actor).getAllComplaints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyComplaints() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Complaint[]>({
    queryKey: ["myComplaints"],
    queryFn: async () => {
      if (!actor) return [];
      return typed(actor).getMyComplaints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetApartmentComplaints(apartmentId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Complaint[]>({
    queryKey: ["apartmentComplaints", apartmentId?.toString()],
    queryFn: async () => {
      if (!actor || apartmentId === null) return [];
      return typed(actor).getApartmentComplaints(apartmentId);
    },
    enabled: !!actor && !isFetching && apartmentId !== null,
  });
}

export function useGetComplaint(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Complaint | null>({
    queryKey: ["complaint", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      const result = await typed(actor).getComplaint(id);
      return result.length > 0 ? (result[0] ?? null) : null;
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function usePostComplaint() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: PostComplaintArgs) => {
      if (!actor) throw new Error("Not connected");
      return typed(actor).postComplaint(
        args.apartmentId,
        args.title,
        args.description,
        args.category,
        args.priority,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allComplaints"] });
      qc.invalidateQueries({ queryKey: ["myComplaints"] });
      qc.invalidateQueries({ queryKey: ["apartmentComplaints"] });
      qc.invalidateQueries({ queryKey: ["complaintStats"] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: UpdateComplaintStatusArgs) => {
      if (!actor) throw new Error("Not connected");
      return typed(actor).updateComplaintStatus(
        args.complaintId,
        args.status,
        args.resolutionNotes,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["allComplaints"] });
      qc.invalidateQueries({ queryKey: ["myComplaints"] });
      qc.invalidateQueries({ queryKey: ["apartmentComplaints"] });
      qc.invalidateQueries({
        queryKey: ["complaint", vars.complaintId.toString()],
      });
      qc.invalidateQueries({ queryKey: ["complaintStats"] });
    },
  });
}

export function useDeleteComplaint() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return typed(actor).deleteComplaint(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allComplaints"] });
      qc.invalidateQueries({ queryKey: ["myComplaints"] });
      qc.invalidateQueries({ queryKey: ["apartmentComplaints"] });
      qc.invalidateQueries({ queryKey: ["complaintStats"] });
    },
  });
}

export function useGetComplaintsByStatus(status: ComplaintStatus | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Complaint[]>({
    queryKey: ["complaintsByStatus", JSON.stringify(status)],
    queryFn: async () => {
      if (!actor || status === null) return [];
      return typed(actor).getComplaintsByStatus(status);
    },
    enabled: !!actor && !isFetching && status !== null,
  });
}

export function useGetComplaintsByCategory(category: ComplaintCategory | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Complaint[]>({
    queryKey: ["complaintsByCategory", JSON.stringify(category)],
    queryFn: async () => {
      if (!actor || category === null) return [];
      return typed(actor).getComplaintsByCategory(category);
    },
    enabled: !!actor && !isFetching && category !== null,
  });
}

export function useGetComplaintStats(apartmentId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ComplaintStats | null>({
    queryKey: ["complaintStats", apartmentId?.toString()],
    queryFn: async () => {
      if (!actor || apartmentId === null) return null;
      const result = await typed(actor).getComplaintStats(apartmentId);
      return result.length > 0 ? (result[0] ?? null) : null;
    },
    enabled: !!actor && !isFetching && apartmentId !== null,
  });
}
