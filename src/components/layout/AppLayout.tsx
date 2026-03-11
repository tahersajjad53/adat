import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MoreHoriz } from 'iconoir-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import TasbeehFormSheet from '@/components/tasbeeh/TasbeehFormSheet';
import { useGoals } from '@/hooks/useGoals';
import { useTasbeehCounters } from '@/hooks/useTasbeehCounters';

import { useMissedPrayers } from '@/hooks/useMissedPrayers';
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
  const isNamazPage = location.pathname === '/namaz';
  const isCalendarPage = location.pathname === '/calendar';
  const { unfulfilledCount, clearAllQaza } = useMissedPrayers();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-background/40 backdrop-blur-xl backdrop-saturate-150 border-b border-border/50">
          <div className="container flex h-14 items-center">
            {/* Left spacer */}
            {isCalendarPage && calendarMonth ? (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('calendar:toggleMonthView'))}
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
            {/* Right: 3-dot menu on goals/namaz page, spacer otherwise */}
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
            ) : isNamazPage ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <MoreHoriz className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem
                    onClick={() => setClearConfirmOpen(true)}
                    disabled={unfulfilledCount === 0}
                  >
                    Clear Qaza Namaz
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isCalendarPage && !calendarShowingToday ? (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('calendar:goToToday'))}
                className="text-sm font-medium text-primary w-10 text-right"
              >
                Today
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </header>
        
        {/* Main content */}
        <main>{children}</main>
        
        {/* Bottom navigation */}
        <MobileBottomNav onAddGoal={handleAddGoal} onAddTasbeeh={() => setTasbeehFormOpen(true)} />
        <GoalFormSheet open={goalFormOpen} onOpenChange={setGoalFormOpen} onSubmit={handleGoalSubmit} isLoading={isCreating} />
        <TasbeehFormSheet open={tasbeehFormOpen} onOpenChange={setTasbeehFormOpen} onSubmit={async (data) => { await createCounter(data); }} isLoading={isCreatingTasbeeh} />
        <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Qaza Namaz?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark all {unfulfilledCount} missed prayers as completed. New missed prayers will continue to appear going forward.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await clearAllQaza();
                  setClearConfirmOpen(false);
                }}
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
