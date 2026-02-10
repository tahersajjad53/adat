import React from 'react';
import { Home, Clock, User, Archery, Plus } from 'iconoir-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

const leftItems = [
  { title: 'Today', url: '/today', icon: Home },
  { title: 'Namaz', url: '/namaz', icon: Clock },
];

const rightItems = [
  { title: 'Goals', url: '/goals', icon: Archery },
  { title: 'Profile', url: '/profile', icon: User },
];

interface MobileBottomNavProps {
  onAddGoal: () => void;
}

export function MobileBottomNav({ onAddGoal }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl backdrop-saturate-150 border-t border-border/50 shadow-[0_-1px_12px_rgba(0,0,0,0.06)] pb-safe">
      <div className="flex justify-around items-center h-16">
        {leftItems.map((item) => (
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

        {/* Center + button */}
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={onAddGoal}
            className="flex items-center justify-center h-12 w-12 -mt-5 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>

        {rightItems.map((item) => (
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
