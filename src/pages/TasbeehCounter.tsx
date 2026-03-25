import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavArrowLeft, MoreHoriz } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTasbeehCounters } from '@/hooks/useTasbeehCounters';
import TasbeehFormSheet from '@/components/tasbeeh/TasbeehFormSheet';
import { useConfetti } from '@/components/ui/confetti';

const TasbeehCounterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { counters, incrementCounter, resetCounter, updateCounter, deleteCounter, isLoading } = useTasbeehCounters();
  const counter = counters.find(c => c.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { triggerCelebration, ConfettiPortal } = useConfetti();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Counter not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/today')}>Go back</Button>
      </div>
    );
  }

  const percentage = counter.target_count
    ? Math.min(100, (counter.current_count / counter.target_count) * 100)
    : 0;
  const hasTarget = counter.target_count !== null && counter.target_count > 0;

  // Contrast logic
  const isInFill = hasTarget && percentage > 45;
  const isHeaderInFill = hasTarget && percentage > 85;
  const countColor = isInFill ? 'text-primary-foreground' : 'text-foreground';
  const subtextColor = isInFill ? 'text-primary-foreground/80' : 'text-muted-foreground';
  const headerColor = isHeaderInFill ? 'text-primary-foreground' : 'text-foreground';

  // Fill height: when no target, show subtle 10% at low opacity
  const fillHeight = hasTarget ? percentage : 10;
  const fillOpacity = hasTarget ? 1 : 0.25;

  const handleTap = () => {
    const willHitTarget = hasTarget && counter.current_count + 1 === counter.target_count;
    incrementCounter(counter.id);
    if (willHitTarget) {
      triggerCelebration(buttonRef.current);
      if (typeof navigator.vibrate === 'function') navigator.vibrate([50, 30, 50, 30, 80]);
    } else {
      if (typeof navigator.vibrate === 'function') navigator.vibrate(10);
    }
  };

  return (
    <>
      {/* Liquid fill background */}
      <div
        className="fixed inset-x-0 bottom-0 bg-primary transition-all duration-300 ease-out"
        style={{ height: `${fillHeight}%`, opacity: fillOpacity }}
      />

      {/* Page content */}
      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Header */}
        <div className="flex flex-col px-4 pt-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className={headerColor} onClick={() => navigate(-1)}>
              <NavArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className={`text-lg font-semibold truncate mx-4 text-center flex-1 transition-colors duration-300 ${headerColor}`}>
              {counter.title || 'Tasbeeh'}
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={headerColor}>
                  <MoreHoriz className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setResetConfirm(true)}>Reset</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteConfirm(true)} className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {counter.current_count > 0 && (
            <div className="flex justify-center mt-2">
              <Button variant="outline" size="sm" onClick={() => setResetConfirm(true)}>
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* Full-page tap area */}
        <button
          ref={buttonRef}
          onClick={handleTap}
          className="flex-1 flex flex-col items-center justify-center select-none active:opacity-80 transition-opacity focus:outline-none"
        >
          <span className={`text-8xl font-bold tabular-nums leading-none transition-colors duration-300 ${countColor}`} style={{ transform: 'translateY(0.05em)' }}>
            {counter.current_count}
          </span>
          {hasTarget && (
            <p className={`mt-4 text-sm transition-colors duration-300 ${subtextColor}`}>
              {counter.current_count} / {counter.target_count}
            </p>
          )}
        </button>
      </div>

      {/* Edit sheet */}
      <TasbeehFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={{ title: counter.title || '', target_count: counter.target_count }}
        onSubmit={async (data) => {
          await updateCounter({ id: counter.id, title: data.title, target_count: data.target_count ?? null });
        }}
      />

      {/* Reset confirm */}
      <AlertDialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset counter?</AlertDialogTitle>
            <AlertDialogDescription>This will set the count back to 0.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await resetCounter(counter.id); setResetConfirm(false); }}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete counter?</AlertDialogTitle>
            <AlertDialogDescription>This counter will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await deleteCounter(counter.id); navigate('/today'); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ConfettiPortal />
    </>
  );
};

export default TasbeehCounterPage;
