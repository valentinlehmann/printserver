"use client";

import * as React from "react";
import Link from "next/link";
import { PrinterIcon, ScanLineIcon } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { t } from "@/lib/messages";

// Primary navigation. Two destinations only — Drucken (print) and Scannen (scan).
const navMain = [
  { title: t.nav.print, url: "/print", icon: PrinterIcon },
  { title: t.nav.scan, url: "/scan", icon: ScanLineIcon },
];

type SidebarUser = {
  name: string;
  email: string;
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SidebarUser }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/print" />}
            >
              <PrinterIcon className="size-5!" />
              <span className="text-base font-semibold">
                {t.common.appName}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
