"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Workspace } from "@/types/database";

interface WorkspaceContextType {
  activeWorkspace: Workspace;
  workspaces: Workspace[];
  setActiveWorkspace: (ws: Workspace) => void;
  updateActiveWorkspace: (updates: Partial<Workspace>) => void;
  createWorkspace: (name: string, avgValue?: number) => Workspace;
  currentRole: "owner" | "admin" | "agent" | "viewer";
  uiMode: "simple" | "pro";
  setUiMode: (mode: "simple" | "pro") => void;
  toggleUiMode: () => void;
  isTestDrawerOpen: boolean;
  setIsTestDrawerOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

// Fallback baseline workspace
const BASELINE_WORKSPACE: Workspace = {
  id: "ws-demo-001",
  name: "Apex Dental Clinic",
  slug: "apex-dental",
  logo_url: null,
  accent_color: "#2563eb",
  currency: "USD",
  avg_job_value: 350.0,
  custom_domain: null,
  custom_domain_verified: false,
  white_label_enabled: false,
  is_suspended: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace>(BASELINE_WORKSPACE);
  const [workspaces, setWorkspacesState] = useState<Workspace[]>([BASELINE_WORKSPACE]);
  const [currentRole, setCurrentRole] = useState<"owner" | "admin" | "agent" | "viewer">("owner");
  const [uiMode, setUiModeState] = useState<"simple" | "pro">("simple");
  const [isTestDrawerOpen, setIsTestDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate user workspace dynamically from client storage & active session
  useEffect(() => {
    try {
      // 1. Restore UI Mode
      const savedMode = localStorage.getItem("chatify_ui_mode") as "simple" | "pro" | null;
      if (savedMode === "simple" || savedMode === "pro") {
        setUiModeState(savedMode);
      }

      // 2. Restore Active Workspace
      const savedActiveWs = localStorage.getItem("chatify_active_workspace");
      if (savedActiveWs) {
        const parsedWs: Workspace = JSON.parse(savedActiveWs);
        if (parsedWs && parsedWs.name) {
          setActiveWorkspaceState(parsedWs);
        }
      }

      // 3. Restore Multi-Workspace List
      const savedWorkspaces = localStorage.getItem("chatify_user_workspaces");
      if (savedWorkspaces) {
        const parsedList: Workspace[] = JSON.parse(savedWorkspaces);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          setWorkspacesState(parsedList);
        }
      } else if (savedActiveWs) {
        // If single workspace was saved, ensure it is in the list
        const parsedWs: Workspace = JSON.parse(savedActiveWs);
        setWorkspacesState([parsedWs]);
      }

      // 4. Restore User Role
      const savedUser = localStorage.getItem("chatify_current_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.role === "admin") {
          setCurrentRole("admin");
        } else {
          setCurrentRole("owner");
        }
      }
    } catch (e) {
      console.warn("Workspace hydration note:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspaceState(ws);
    try {
      localStorage.setItem("chatify_active_workspace", JSON.stringify(ws));
    } catch {}
  };

  const setWorkspaces = (list: Workspace[]) => {
    setWorkspacesState(list);
    try {
      localStorage.setItem("chatify_user_workspaces", JSON.stringify(list));
    } catch {}
  };

  const setUiMode = (mode: "simple" | "pro") => {
    setUiModeState(mode);
    try {
      localStorage.setItem("chatify_ui_mode", mode);
    } catch {}
  };

  const toggleUiMode = () => {
    const next = uiMode === "simple" ? "pro" : "simple";
    setUiMode(next);
  };

  const updateActiveWorkspace = (updates: Partial<Workspace>) => {
    setActiveWorkspaceState((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem("chatify_active_workspace", JSON.stringify(updated));
      } catch {}

      setWorkspacesState((list) => {
        const newList = list.map((item) => (item.id === updated.id ? updated : item));
        try {
          localStorage.setItem("chatify_user_workspaces", JSON.stringify(newList));
        } catch {}
        return newList;
      });

      return updated;
    });
  };

  // Multi-Dashboard: Create additional isolated workspaces
  const createWorkspace = (name: string, avgValue: number = 350.0): Workspace => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const newWs: Workspace = {
      id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      slug: slug || `practice-${Date.now()}`,
      logo_url: null,
      accent_color: "#2563eb",
      currency: "USD",
      avg_job_value: avgValue,
      custom_domain: null,
      custom_domain_verified: false,
      white_label_enabled: false,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedList = [...workspaces, newWs];
    setWorkspaces(updatedList);
    setActiveWorkspace(newWs);
    return newWs;
  };

  const logout = () => {
    try {
      localStorage.removeItem("chatify_active_workspace");
      localStorage.removeItem("chatify_user_workspaces");
      localStorage.removeItem("chatify_current_user");
      document.cookie = "chatify_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "chatify_active_ws=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {}
    window.location.href = "/login";
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        workspaces,
        setActiveWorkspace,
        updateActiveWorkspace,
        createWorkspace,
        currentRole,
        uiMode,
        setUiMode,
        toggleUiMode,
        isTestDrawerOpen,
        setIsTestDrawerOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        logout,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
