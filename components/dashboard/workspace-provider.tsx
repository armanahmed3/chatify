"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Workspace, WorkspaceMember } from "@/types/database";

interface WorkspaceContextType {
  activeWorkspace: Workspace;
  workspaces: Workspace[];
  setActiveWorkspace: (ws: Workspace) => void;
  updateActiveWorkspace: (updates: Partial<Workspace>) => void;
  currentRole: "owner" | "admin" | "agent" | "viewer";
}

// Default fallback workspace for seamless development and preview
const DEFAULT_WORKSPACE: Workspace = {
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
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(DEFAULT_WORKSPACE);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    DEFAULT_WORKSPACE,
    {
      ...DEFAULT_WORKSPACE,
      id: "ws-demo-002",
      name: "Downtown Auto Repairs",
      slug: "downtown-auto",
      avg_job_value: 450.0,
    },
  ]);
  const [currentRole, setCurrentRole] = useState<"owner" | "admin" | "agent" | "viewer">("owner");

  const updateActiveWorkspace = (updates: Partial<Workspace>) => {
    setActiveWorkspace((prev) => {
      const updated = { ...prev, ...updates };
      setWorkspaces((list) =>
        list.map((item) => (item.id === updated.id ? updated : item))
      );
      return updated;
    });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        workspaces,
        setActiveWorkspace,
        updateActiveWorkspace,
        currentRole,
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
