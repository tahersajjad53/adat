import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MoreHoriz } from 'iconoir-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import TasbeehFormSheet from '@/components/tasbeeh/TasbeehFormSheet';
import { useGoals } from '@/hooks/useGoals';
import { useTasbeehCounters } from '@/hooks/useTasbeehCounters';

import ibadatLogo from '@/assets/ibadat-logo.svg';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [tasbeehFormOpen, setTasbeehFormOpen] = useState(false);
  const { createGoal, isCreating } = useGoals();
  const { createCounter, isCreating: isCreatingTasbeeh } = useTasbeehCounters();

  const navigate = useNavigate();
  const isGoalsPage = location.pathname === '/goals';
  const [todayTab, setTodayTab] = useState<'feed' | 'calendar'>(() => {
    if (typeof window === 'undefined') return 'feed';
    return (sessionStorage.getItem('today:tab') as 'feed' | 'calendar') || 'feed';
  });
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tab === 'feed' || detail?.tab === 'calendar') setTodayTab(detail.tab);
    };
    window.addEventListener('today:tabChanged', handler);
    return () => window.removeEventListener('today:tabChanged', handler);
  }, []);
  const isCalendarPage =
    location.pathname === '/calendar' ||
    (location.pathname === '/today' && todayTab === 'calendar');
  const [calendarShowingToday, setCalendarShowingToday] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState('');
  const [calendarInMonthView, setCalendarInMonthView] = useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCalendarShowingToday(detail?.showingToday ?? true);
    };
    window.addEventListener('calendar:showingTodayChanged', handler);
    return () => window.removeEventListener('calendar:showingTodayChanged', handler);
  }, []);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCalendarMonth(detail?.month ?? '');
    };
    window.addEventListener('calendar:monthChanged', handler);
    return () => window.removeEventListener('calendar:monthChanged', handler);
  }, []);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCalendarInMonthView(detail?.view === 'month');
    };
    window.addEventListener('calendar:viewChanged', handler);
    return () => window.removeEventListener('calendar:viewChanged', handler);
  }, []);

  const handleAddGoal = () => setGoalFormOpen(true);

  const handleGoalSubmit = async (data: any) => {
    await createGoal(data);
  };

  // Show loading state while isMobile is undefined
  if (isMobile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  const isDashboard = location.pathname === '/today';
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    if (!isDashboard) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isDashboard]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 pt-safe-min">
          {/* Feathered frosted backdrop layer */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 top-0 h-[calc(100%+48px)] bg-background/40 backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-200 ${
              isDashboard && !scrolled ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 45%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 45%, transparent 100%)',
            }}
          />
          <div className="relative container flex h-14 items-center">
            {/* Left spacer */}
            {isCalendarPage && calendarMonth ? (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent(
                  calendarInMonthView ? 'calendar:goToCurrentMonth' : 'calendar:toggleMonthView'
                ))}
                className="text-sm font-medium text-primary w-10 text-left"
              >
                {calendarMonth}
              </button>
            ) : (
              <div className="w-10" />
            )}
            {/* Centered logo */}
            <div className="flex-1 flex justify-center">
              <img src={ibadatLogo} alt="Ibadat" className="h-6 w-auto logo-themed" />
            </div>
            {/* Right: 3-dot menu on goals/calendar page, spacer otherwise */}
            {isGoalsPage ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <MoreHoriz className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => navigate('/goals/completed')}>
                    Completed Goals
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/goals/dynamic-goals')}>
                    Dynamic Goals
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isCalendarPage ? (
              <div className="flex items-center gap-1">
                {(calendarInMonthView || !calendarShowingToday) && (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('calendar:goToToday'))}
                    className="text-sm font-medium text-primary px-1"
                  >
                    Today
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <MoreHoriz className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => navigate('/calendar/qaza')}>
                      View Qaza Namaz
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </header>
        
        {/* Main content */}
        <main className="relative z-10">{children}</main>

        
        {/* Bottom navigation */}
        <MobileBottomNav onAddGoal={handleAddGoal} onAddTasbeeh={() => setTasbeehFormOpen(true)} />
        <GoalFormSheet open={goalFormOpen} onOpenChange={setGoalFormOpen} onSubmit={handleGoalSubmit} isLoading={isCreating} />
        <TasbeehFormSheet open={tasbeehFormOpen} onOpenChange={setTasbeehFormOpen} onSubmit={async (data) => { await createCounter(data); }} isLoading={isCreatingTasbeeh} />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar onAddGoal={handleAddGoal} onAddTasbeeh={() => setTasbeehFormOpen(true)} />
        <div className="flex-1 flex flex-col">
          {/* Desktop header with sidebar trigger */}
          <header className="sticky top-0 z-40 bg-background border-b border-border">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger />
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <GoalFormSheet open={goalFormOpen} onOpenChange={setGoalFormOpen} onSubmit={handleGoalSubmit} isLoading={isCreating} />
      <TasbeehFormSheet open={tasbeehFormOpen} onOpenChange={setTasbeehFormOpen} onSubmit={async (data) => { await createCounter(data); }} isLoading={isCreatingTasbeeh} />
    </SidebarProvider>
  );
}
