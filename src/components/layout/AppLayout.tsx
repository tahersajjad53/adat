import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import { useGoals } from '@/hooks/useGoals';
import adatLogo from '@/assets/adat-logo.svg';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const { createGoal, isCreating } = useGoals();

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
          <div className="container flex h-14 items-center justify-center">
            <img src={adatLogo} alt="Adat" className="h-6 w-auto logo-forest" />
          </div>
        </header>
        
        {/* Main content */}
        <main>{children}</main>
        
        {/* Bottom navigation */}
        <MobileBottomNav onAddGoal={handleAddGoal} />
        <GoalFormSheet open={goalFormOpen} onOpenChange={setGoalFormOpen} onSubmit={handleGoalSubmit} isLoading={isCreating} />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar onAddGoal={handleAddGoal} />
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
    </SidebarProvider>
  );
}
