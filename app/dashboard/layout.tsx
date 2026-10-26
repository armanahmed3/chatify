import { WorkspaceProvider } from "@/components/dashboard/workspace-provider";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { QuickTestDrawer } from "@/components/dashboard/quick-test-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardTopbar />
          <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
        <QuickTestDrawer />
      </div>
    </WorkspaceProvider>
  );
}
