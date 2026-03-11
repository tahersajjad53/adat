import React, { useState } from 'react';
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

const TasbeehCounterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { counters, incrementCounter, resetCounter, updateCounter, deleteCounter, isLoading } = useTasbeehCounters();
  const counter = counters.find(c => c.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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

  const handleTap = () => {
    incrementCounter(counter.id);
    if (typeof navigator.vibrate === 'function') navigator.vibrate(10);
  };

  // SVG radial ring params
  const size = 260;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="container py-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <NavArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground truncate mx-4 text-center flex-1">
          {counter.title || 'Tasbeeh'}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHoriz className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setResetConfirm(true)}>Reset</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteConfirm(true)} className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tap area */}
      <div
        className="flex flex-col items-center justify-center select-none"
        style={{ minHeight: '50vh' }}
      >
        <button
          onClick={handleTap}
          className="relative flex items-center justify-center active:scale-95 transition-transform focus:outline-none"
          style={{ width: size, height: size }}
        >
          {/* Radial ring */}
          <svg className="absolute inset-0" width={size} height={size}>
            {/* Track */}
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth}
            />
            {/* Progress / decorative ring */}
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={hasTarget ? offset : 0}
              opacity={hasTarget ? 1 : 0.25}
              className="transition-all duration-150"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
          {/* Count */}
          <span className="text-8xl font-bold text-foreground font-display tabular-nums leading-none">
            {counter.current_count}
          </span>
        </button>

        {/* Target label */}
        {hasTarget && (
          <p className="mt-4 text-sm text-muted-foreground">
            {counter.current_count} / {counter.target_count}
          </p>
        )}

        {/* Reset button */}
        {counter.current_count > 0 && (
          <Button variant="outline" size="sm" className="mt-6" onClick={() => setResetConfirm(true)}>
            Reset
          </Button>
        )}
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
    </div>
  );
};

export default TasbeehCounterPage;
