"use client"

import { type ComponentType, useEffect, useState } from "react"
import type { Route } from 'next'

import {
  Building2,
  Frame,
  Map,
  PieChart,
  Settings2,
  ShoppingCart,
  SquareTerminal,
  CreditCard,
  Users,
  Microscope,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSessionStore } from "@/state/session"

export type NavItem = {
  title: string
  url: Route
  icon?: ComponentType
}

export type NavMainItem = NavItem & {
  isActive?: boolean
  items?: NavItem[]
}

type Data = {
  user: {
    name: string
    email: string
  }
  teams: {
    name: string
    logo: ComponentType
    plan: string
  }[]
  navMain: NavMainItem[]
  projects: NavItem[]
}

// TODO Add a theme switcher
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session, isGuestSession, getUserSession } = useSessionStore();
  const [formattedTeams, setFormattedTeams] = useState<Data['teams']>([]);

  // Map session teams to the format expected by TeamSwitcher
  useEffect(() => {
    const userSession = getUserSession();
    if (userSession?.teams && userSession.teams.length > 0) {
      // Map teams from session to the format expected by TeamSwitcher
      const teamData = userSession.teams.map(team => {
        return {
          name: team.name,
          // TODO Get the actual logo when we implement team avatars
          logo: Building2,
          // Default plan - you might want to add plan data to your team structure
          plan: team.role.name || "Member"
        };
      });

      setFormattedTeams(teamData);
    } else {
      setFormattedTeams([]);
    }
  }, [session, getUserSession]);

  const userSession = getUserSession();
  const isGuest = isGuestSession();

  const data: Data = {
    user: {
      name: isGuest ? "Guest User" : userSession?.user?.firstName || "User",
      email: isGuest ? "guest@demo.com" : userSession?.user?.email || "user@example.com",
    },
    teams: formattedTeams,
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: "SAM Droplet",
        url: "/dashboard/sam-droplet",
        icon: Microscope,
      },
      {
        title: "Marketplace",
        url: "/dashboard/marketplace",
        icon: ShoppingCart,
      },
      // Show Teams and Billing only for authenticated users
      ...(isGuest ? [] : [
        {
          title: "Teams",
          url: "/dashboard/teams" as Route,
          icon: Users,
        } as NavMainItem,
        {
          title: "Billing",
          url: "/dashboard/billing" as Route,
          icon: CreditCard,
        } as NavMainItem,
        {
          title: "Settings",
          url: "/settings" as Route,
          icon: Settings2,
          items: [
            {
              title: "Profile",
              url: "/settings" as Route,
            },
            {
              title: "Security",
              url: "/settings/security" as Route,
            },
            {
              title: "Sessions",
              url: "/settings/sessions" as Route,
            },
            {
              title: "Change Password",
              url: "/forgot-password" as Route,
            },
          ],
        } as NavMainItem,
      ]),
    ],
    projects: [
      {
        title: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        title: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        title: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {data?.teams?.length > 0 && (
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
      )}

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
