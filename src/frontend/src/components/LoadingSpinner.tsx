interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-7 h-7 border-2",
  lg: "w-10 h-10 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  label = "Loading…",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <output
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      aria-label={label}
      data-ocid="loading_state"
    >
      <div
        className={`${sizeClasses[size]} rounded-full border-border border-t-primary animate-spin`}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </output>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center min-h-[40vh]"
      data-ocid="loading_state"
    >
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
