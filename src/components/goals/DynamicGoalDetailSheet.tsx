import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getRecurrenceDescription } from '@/lib/recurrence';
import type { GoalWithStatus } from '@/types/goals';

interface DynamicGoalDetailSheetProps {
  goal: GoalWithStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DynamicGoalDetailSheet: React.FC<DynamicGoalDetailSheetProps> = ({
  goal,
  open,
  onOpenChange,
}) => {
  if (!goal) return null;

  const recurrenceLabel = getRecurrenceDescription(goal);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="text-xl font-display font-normal tracking-tight">
            {goal.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs px-2 py-0.5 text-primary border-primary/30">
            Dynamic
          </Badge>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {recurrenceLabel}
          </Badge>
        </div>

        {goal.description && (
          <div className="prose prose-sm max-w-none">
            <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {goal.description}
            </p>
          </div>
        )}

        {!goal.description && (
          <p className="text-sm text-muted-foreground italic">
            No additional details for this goal.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DynamicGoalDetailSheet;
