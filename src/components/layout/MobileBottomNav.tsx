import React from 'react';
import { Home, Clock, User, LogOut } from 'iconoir-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Home', url: '/dashboard', icon: Home },
  { title: 'Namaz', url: '/namaz', icon: Clock },
  { title: 'Profile', url: '/profile', icon: User },
];

export function MobileBottomNav() {
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={cn(
              'flex flex-col items-center justify-center gap-1 flex-1 h-full',
              'text-muted-foreground transition-colors'
            )}
            activeClassName="text-foreground"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.title}</span>
          </NavLink>
        ))}
        <button
          onClick={signOut}
          className={cn(
            'flex flex-col items-center justify-center gap-1 flex-1 h-full',
            'text-muted-foreground hover:text-foreground transition-colors'
          )}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
}
