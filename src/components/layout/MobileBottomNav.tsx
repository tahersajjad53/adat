import React from 'react';
import { Home, Clock, User, Archery } from 'iconoir-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Today', url: '/today', icon: Home },
  { title: 'Namaz', url: '/namaz', icon: Clock },
  { title: 'Goals', url: '/goals', icon: Archery },
  { title: 'Profile', url: '/profile', icon: User },
];

export function MobileBottomNav() {
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
      </div>
    </nav>
  );
}
