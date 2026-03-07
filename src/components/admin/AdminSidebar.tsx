import React from 'react';
import { Home, Megaphone, Tag, ArrowLeft } from 'iconoir-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';

const adminNavItems = [
  { title: 'Dashboard', url: '/admin', icon: Home },
  { title: 'Elans', url: '/admin/elans', icon: Megaphone },
  { title: 'Tags', url: '/admin/tags', icon: Tag },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">Admin</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="flex items-center gap-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'sm'}
            onClick={() => navigate('/today')}
            className="w-full justify-start gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {!isCollapsed && <span>Back to App</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
