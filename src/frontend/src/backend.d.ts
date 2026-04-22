import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface Complaint {
    id: bigint;
    status: ComplaintStatus;
    title: string;
    apartmentId: bigint;
    createdAt: Timestamp;
    description: string;
    tenantPrincipal: Principal;
    resolutionNotes?: string;
    updatedAt: Timestamp;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    resolvedAt?: Timestamp;
}
export interface Apartment {
    id: bigint;
    name: string;
    createdAt: Timestamp;
    hostPrincipal: Principal;
    address: string;
}
export interface UserProfile {
    principal: Principal;
    apartmentId?: bigint;
    name: string;
    createdAt: Timestamp;
    role: UserRole;
}
export enum ComplaintCategory {
    Noise = "Noise",
    Safety = "Safety",
    Maintenance = "Maintenance",
    Cleanliness = "Cleanliness",
    Other = "Other"
}
export enum ComplaintPriority {
    Low = "Low",
    High = "High",
    Medium = "Medium"
}
export enum ComplaintStatus {
    Open = "Open",
    InProgress = "InProgress",
    Resolved = "Resolved"
}
export enum UserRole {
    Tenant = "Tenant",
    Host = "Host"
}
export interface backendInterface {
    createApartment(name: string, address: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteComplaint(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getApartmentComplaints(apartmentId: bigint): Promise<Array<Complaint>>;
    getApartments(): Promise<Array<Apartment>>;
    getComplaint(id: bigint): Promise<Complaint | null>;
    getComplaintStats(apartmentId: bigint): Promise<{
        resolved: bigint;
        total: bigint;
        open: bigint;
        inProgress: bigint;
    }>;
    getComplaintsByCategory(category: ComplaintCategory): Promise<Array<Complaint>>;
    getComplaintsByStatus(status: ComplaintStatus): Promise<Array<Complaint>>;
    getMyApartments(): Promise<Array<Apartment>>;
    getMyComplaints(): Promise<Array<Complaint>>;
    getUserProfile(): Promise<UserProfile | null>;
    isRegistered(): Promise<boolean>;
    postComplaint(apartmentId: bigint, title: string, description: string, category: ComplaintCategory, priority: ComplaintPriority): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerAsHost(name: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerAsTenant(name: string, apartmentId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateComplaintStatus(id: bigint, status: ComplaintStatus, resolutionNotes: string | null): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
