import React, { useState } from 'react';
import { Home, Clock, User, Archery, Plus, Calendar as CalendarIcon } from 'iconoir-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';

const leftItems = [
  { title: 'Today', url: '/today', icon: Home },
  { title: 'Calendar', url: '/calendar', icon: CalendarIcon },
];

const rightItems = [
  { title: 'Goals', url: '/goals', icon: Archery },
  { title: 'Profile', url: '/profile', icon: User },
];

interface MobileBottomNavProps {
  onAddGoal: () => void;
  onAddTasbeeh: () => void;
}

export function MobileBottomNav({ onAddGoal, onAddTasbeeh }: MobileBottomNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <InstallBanner />
      <div className="flex justify-around items-center h-16 pb-2 bg-background/40 backdrop-blur-xl backdrop-saturate-150 border-t border-border/50 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
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

        {/* Center + button with popover */}
        <div className="flex items-center justify-center flex-1">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center justify-center h-12 w-12 -mt-5 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
              >
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="center" <PopoverContent side="top" align="center" className="w-[calc(100vw-2rem)] p-2" sideOffset={12}> sideOffset={12}>
              <button
                onClick={() => { setMenuOpen(false); onAddGoal(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-base rounded-lg hover:bg-accent transition-colors"
              >
                <Archery className="h-5 w-5 text-muted-foreground" />
                <span>New Goal</span>
              </button>
              <div className="h-px bg-border mx-2 my-1" />
              <button
                onClick={() => { setMenuOpen(false); onAddTasbeeh(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-base rounded-lg hover:bg-accent transition-colors"
              >
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>Tasbeeh Counter</span>
              </button>
            </PopoverContent>
          </Popover>
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