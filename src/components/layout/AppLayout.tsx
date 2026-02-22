import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MoreHoriz } from 'iconoir-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { useGoals } from '@/hooks/useGoals';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useMissedPrayers } from '@/hooks/useMissedPrayers';
import ibadatLogo from '@/assets/ibadat-logo.svg';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const { createGoal, isCreating } = useGoals();
  const { dynamicGoalsEnabled, setDynamicGoalsEnabled } = useUserPreferences();

  const navigate = useNavigate();
  const isGoalsPage = location.pathname === '/goals';
  const isNamazPage = location.pathname === '/namaz';
  const { unfulfilledCount, clearAllQaza } = useMissedPrayers();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

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
            <div className="w-10" />
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
                <DropdownMenuContent align="end" className="bg-popover min-w-[260px] max-w-[calc(100vw-2rem)]">
                  <DropdownMenuItem onClick={() => navigate('/goals/completed')}>
                    Completed Goals
                  </DropdownMenuItem>
                  <div className="p-4 space-y-3 border-t border-border">
                    <div>
                      <p className="text-sm font-medium">Receive Dynamic Goals</p>
                      <p className="text-xs text-muted-foreground mt-1">Community goals for all Mumineen, like 'Pray Moti Us Sawalat' on days requiring rozu.</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enabled</span>
                      <Switch
                        checked={dynamicGoalsEnabled}
                        onCheckedChange={(checked) => setDynamicGoalsEnabled(checked)}
                      />
                    </div>
                  </div>
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
            ) : (
              <div className="w-10" />
            )}
          </div>
        </header>
        
        {/* Main content */}
        <main>{children}</main>
        
        {/* Bottom navigation */}
        <MobileBottomNav onAddGoal={handleAddGoal} />
        <GoalFormSheet open={goalFormOpen} onOpenChange={setGoalFormOpen} onSubmit={handleGoalSubmit} isLoading={isCreating} />
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
