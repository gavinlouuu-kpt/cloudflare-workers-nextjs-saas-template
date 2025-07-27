import { AppSidebar } from "@/components/app-sidebar"
import { getSessionOrGuest } from "@/utils/auth"
import { GuestModeBanner } from "@/components/guest-mode-banner"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Always allow access, but get session (user or guest)
  const sessionResult = await getSessionOrGuest()

  return (
    <div className="min-h-screen">
      {/* Show guest mode banner for guest sessions */}
      {sessionResult && 'type' in sessionResult && sessionResult.type === 'guest' && (
        <GuestModeBanner />
      )}
      
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
