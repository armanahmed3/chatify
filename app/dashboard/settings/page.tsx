"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DollarSign,
  Palette,
  Users,
  ShieldCheck,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";

export default function WorkspaceSettingsPage() {
  const { activeWorkspace, updateActiveWorkspace } = useWorkspace();

  const [name, setName] = useState(activeWorkspace.name);
  const [avgJobValue, setAvgJobValue] = useState(activeWorkspace.avg_job_value.toString());
  const [accentColor, setAccentColor] = useState(activeWorkspace.accent_color || "#2563eb");
  const [isSaved, setIsSaved] = useState(false);

  // Team members
  const [members, setMembers] = useState([
    { id: "1", name: "Dr. Sarah Khan", email: "dr.sarah@apex.com", role: "owner" },
    { id: "2", name: "Jessica Taylor", email: "jessica@apex.com", role: "agent" },
    { id: "3", name: "Front Desk Reception", email: "reception@apex.com", role: "viewer" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");

  // Advanced BYOK (Collapsed by default, never required)
  const [showAdvancedByok, setShowAdvancedByok] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [byokSaved, setByokSaved] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveWorkspace({
      name,
      avg_job_value: parseFloat(avgJobValue) || 300,
      accent_color: accentColor,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
      },
    ]);
    setInviteEmail("");
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Workspace Settings
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your business branding, team member access, and ROI calculation parameters.
        </p>
      </div>

      {/* General Settings */}
      <Card className="border-border/70 shadow-sm">
        <form onSubmit={handleSaveGeneral}>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent" />
              <span>Business Profile & Branding</span>
            </CardTitle>
            <CardDescription className="text-xs">
              These details appear on your customer chat widget and weekly reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Business Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Dental Clinic"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Average Customer Value ($)</span>
                </label>
                <Input
                  type="number"
                  value={avgJobValue}
                  onChange={(e) => setAvgJobValue(e.target.value)}
                  placeholder="300"
                  className="h-9 text-xs"
                />
                <span className="text-[11px] text-muted-foreground">
                  Used to calculate your real estimated pipeline value in ROI reports.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-accent" />
                  <span>Workspace Accent Color</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40 py-3 flex justify-between items-center">
            {isSaved ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Saved changes successfully
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Settings update across all widgets instantly
              </span>
            )}
            <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Team Member Management */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            <span>Team Members & Roles</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Invite your staff, receptionists, or technicians to view conversations and take over chats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@yourbusiness.com"
              className="h-9 text-xs flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="agent">Agent (Can chat & takeover)</option>
              <option value="admin">Admin (Can edit bot & settings)</option>
              <option value="viewer">Viewer (Read-only)</option>
            </select>
            <Button type="submit" size="sm" className="h-9 text-xs gap-1.5 shrink-0">
              <Plus className="h-3.5 w-3.5" /> Invite
            </Button>
          </form>

          <div className="rounded-lg border border-border/60 divide-y divide-border/40 text-xs">
            {members.map((member) => (
              <div key={member.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">{member.name}</div>
                  <div className="text-[11px] text-muted-foreground">{member.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {member.role}
                  </Badge>
                  {member.role !== "owner" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced BYOK (Optional Collapsed Section as per Rule 2) */}
      <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvancedByok(!showAdvancedByok)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              Advanced — Bring Your Own AI Key (Optional)
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              showAdvancedByok ? "rotate-180" : ""
            }`}
          />
        </button>

        {showAdvancedByok && (
          <div className="p-4 border-t border-border/40 space-y-3 text-xs bg-background/50">
            <p className="text-muted-foreground text-[11px]">
              Chatify provides a central, lifetime-free AI router out-of-the-box. You never need to configure this. If you are a developer or enterprise wanting to bill tokens directly to your own provider account, you may enter a custom key here.
            </p>
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Custom AI Provider Key</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="sk-..."
                  className="h-9 text-xs font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setByokSaved(true);
                    setTimeout(() => setByokSaved(false), 2000);
                  }}
                  className="h-9 text-xs"
                >
                  {byokSaved ? "Saved" : "Save Key"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
