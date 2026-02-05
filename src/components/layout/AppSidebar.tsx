import React, { useEffect, useState } from 'react';
import { Home, Clock, User, LogOut } from 'iconoir-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
import adatLogo from '@/assets/adat-logo.svg';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Namaz', url: '/namaz', icon: Clock },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data?.full_name) {
          setFullName(data.full_name);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const displayName = fullName || user?.email?.split('@')[0] || 'User';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <img src={adatLogo} alt="Adat" className="h-8 w-auto" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
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
        <div className="p-2 space-y-2">
          {!isCollapsed && (
            <div className="px-2 py-1">
              <p className="font-medium text-sm truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <div className={isCollapsed ? 'space-y-1' : 'flex gap-1'}>
            <Button
              variant="ghost"
              size={isCollapsed ? 'icon' : 'sm'}
              onClick={() => navigate('/profile')}
              className={isCollapsed ? 'w-full' : 'flex-1 justify-start gap-2'}
            >
              <User className="h-4 w-4" />
              {!isCollapsed && <span>Profile</span>}
            </Button>
            <Button
              variant="ghost"
              size={isCollapsed ? 'icon' : 'sm'}
              onClick={signOut}
              className={isCollapsed ? 'w-full' : 'flex-1 justify-start gap-2'}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sign out</span>}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
