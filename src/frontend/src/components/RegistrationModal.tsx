import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { AlertCircle, Building2, Users } from "lucide-react";
import { useState } from "react";
import {
  useGetApartments,
  useRegisterAsHost,
  useRegisterAsTenant,
} from "../hooks/useQueries";

interface RegistrationModalProps {
  onClose: () => void;
}

type Step = "role" | "host-form" | "tenant-form";

export function RegistrationModal({ onClose }: RegistrationModalProps) {
  const [step, setStep] = useState<Step>("role");
  const [name, setName] = useState("");
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: apartments = [] } = useGetApartments();
  const registerHost = useRegisterAsHost();
  const registerTenant = useRegisterAsTenant();

  const isLoading = registerHost.isPending || registerTenant.isPending;

  const handleRegisterHost = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError(null);
    const result = await registerHost.mutateAsync(name.trim());
    if ("err" in result) {
      setError(result.err);
      return;
    }
    onClose();
  };

  const handleRegisterTenant = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!selectedApartmentId) {
      setError("Please select your apartment");
      return;
    }
    setError(null);
    const result = await registerTenant.mutateAsync({
      name: name.trim(),
      apartmentId: BigInt(selectedApartmentId),
    });
    if ("err" in result) {
      setError(result.err);
      return;
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        data-ocid="registration.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === "role"
              ? "Welcome — Create your account"
              : step === "host-form"
                ? "Register as Host"
                : "Register as Tenant"}
          </DialogTitle>
          <DialogDescription>
            {step === "role"
              ? "Choose your role to get started with the Apartment Complaint System."
              : "Fill in your details to complete registration."}
          </DialogDescription>
        </DialogHeader>

        {step === "role" && (
          <div
            className="grid grid-cols-2 gap-4 pt-2"
            data-ocid="registration.role_selection"
          >
            <button
              type="button"
              onClick={() => setStep("host-form")}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-ocid="registration.host_role_button"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground text-sm">Host</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage apartments & resolve complaints
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStep("tenant-form")}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-ocid="registration.tenant_role_button"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground text-sm">Tenant</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit and track complaints
                </p>
              </div>
            </button>
          </div>
        )}

        {(step === "host-form" || step === "tenant-form") && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Full Name</Label>
              <Input
                id="reg-name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    step === "host-form"
                      ? handleRegisterHost()
                      : handleRegisterTenant();
                }}
                disabled={isLoading}
                data-ocid="registration.name_input"
              />
            </div>

            {step === "tenant-form" && (
              <div className="space-y-2">
                <Label htmlFor="reg-apartment">Your Apartment</Label>
                <Select
                  value={selectedApartmentId}
                  onValueChange={setSelectedApartmentId}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="reg-apartment"
                    data-ocid="registration.apartment_select"
                  >
                    <SelectValue placeholder="Select your apartment" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartments.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No apartments registered yet
                      </SelectItem>
                    ) : (
                      apartments.map((apt) => (
                        <SelectItem
                          key={apt.id.toString()}
                          value={apt.id.toString()}
                        >
                          {apt.name} — {apt.address}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                data-ocid="registration.error_state"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("role");
                  setError(null);
                }}
                disabled={isLoading}
                data-ocid="registration.back_button"
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={
                  step === "host-form"
                    ? handleRegisterHost
                    : handleRegisterTenant
                }
                disabled={isLoading}
                data-ocid="registration.submit_button"
              >
                {isLoading ? "Registering…" : "Complete Registration"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
