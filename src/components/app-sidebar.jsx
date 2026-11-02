import * as React from "react";
import {
  AudioWaveform,
  BadgeIndianRupee,
  Blocks,
  Command,
  File,
  FileDown,
  Frame,
  GalleryVerticalEnd,
  Map,
  NotebookText,
  Package,
  ReceiptText,
  Settings,
  Settings2,
  ShoppingBag,
  TicketPlus,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMainUser } from "./nav-main-user";
import { useSelector } from "react-redux";

export function AppSidebar({ ...props }) {
  const nameL = useSelector((state) => state.auth.name);
  const emailL = useSelector((state) => state.auth.email);
  const userType = useSelector((state) => state.auth.user_type);

  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `Messenger`,
        logo: GalleryVerticalEnd,
        plan: "",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/home",
        icon: Frame,
        isActive: false,
      },

      ...(userType === 3
        ? [
            {
              title: "Enquiry",
              url: "#",
              isActive: false,
              icon: Settings2,
              items: [
                { title: "Pending", url: "/enquiry/pending" },
                { title: "Cancel", url: "/enquiry/cancel" },
                { title: "User", url: "/enquiry/user" },
              ],
            },
            {
              title: "Company ",
              url: "/company-list",
              icon: ShoppingBag,
              isActive: false,
            },
          ]
        : []),
      ...(userType != 1
        ? [
            {
              title: "User ",
              url: "/company-list-user",
              icon: ShoppingBag,
              isActive: false,
            },
          ]
        : []),
      ...(userType === 2
        ? [
            {
              title: "Category ",
              url: "/category-list",
              icon: ShoppingBag,
              isActive: false,
            },
          ]
        : []),
      ...(userType === 2
        ? [
            {
              title: "Template ",
              url: "/Template-list",
              icon: ShoppingBag,
              isActive: false,
            },
          ]
        : []),
      ...(userType === 2
        ? [
            {
              title: "Pipeline ",
              url: "/Pipeline-list",
              icon: ShoppingBag,
              isActive: false,
            },
          ]
        : []),

        ...(userType === 2
        ? [
            {
              title: "Default Campaign",
              url: "/default-campaign-list",
              icon: TicketPlus,
              isActive: false,
            },
          ]
        : []),

      ...(userType === 2
        ? [
            {
              title: "Campaign ",
              url: "/Campaign-list",
              icon: TicketPlus,
              isActive: false,
            },
          ]
        : []),

      ...(userType != 1
        ? [
            {
              title: "Company Status",
              url: "/company-status",
              icon: Package,
              isActive: false,
            },
          ]
        : []),
      ...(userType != 1
        ? [
            {
              title: "Upload Data",
              url: "/upload-data",
              icon: Package,
              isActive: false,
            },
          ]
        : []),
      ...(userType == 1
        ? [
            {
              title: "Pending Followup",
              url: "/pending-followup",
              icon: Package,
              isActive: false,
            },
          ]
        : []),
      {
        title: "Download",
        url: "/download",
        icon: FileDown,
        isActive: false,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        {/* <NavProjects projects={data.projects} /> */}
        <NavMain items={initialData.navMain} />
        <NavMainUser projects={initialData.userManagement} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
