import { useCallback, useState } from "react";

export type FilterStatus = "all" | "open" | "inprogress" | "resolved";
export type FilterCategory =
  | "all"
  | "maintenance"
  | "noise"
  | "cleanliness"
  | "safety"
  | "other";
export type FilterPriority = "all" | "low" | "medium" | "high";

// Re-export for use in pages
export type { FilterStatus as AppFilterStatus };

interface AppState {
  showRegistrationModal: boolean;
  filterStatus: FilterStatus;
  filterCategory: FilterCategory;
  filterPriority: FilterPriority;
  searchQuery: string;
}

export function useAppState() {
  const [state, setState] = useState<AppState>({
    showRegistrationModal: false,
    filterStatus: "all",
    filterCategory: "all",
    filterPriority: "all",
    searchQuery: "",
  });

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlers = {
    openRegistrationModal: useCallback(() => {
      updateState({ showRegistrationModal: true });
    }, [updateState]),

    closeRegistrationModal: useCallback(() => {
      updateState({ showRegistrationModal: false });
    }, [updateState]),

    setFilterStatus: useCallback(
      (filterStatus: FilterStatus) => updateState({ filterStatus }),
      [updateState],
    ),

    setFilterCategory: useCallback(
      (filterCategory: FilterCategory) => updateState({ filterCategory }),
      [updateState],
    ),

    setFilterPriority: useCallback(
      (filterPriority: FilterPriority) => updateState({ filterPriority }),
      [updateState],
    ),

    setSearchQuery: useCallback(
      (searchQuery: string) => updateState({ searchQuery }),
      [updateState],
    ),

    resetFilters: useCallback(() => {
      updateState({
        filterStatus: "all",
        filterCategory: "all",
        filterPriority: "all",
        searchQuery: "",
      });
    }, [updateState]),
  };

  return { state, handlers };
}
