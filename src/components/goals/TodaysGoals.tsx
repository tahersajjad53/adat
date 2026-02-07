import React from 'react';
import { Archery, Check } from 'iconoir-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Goal } from '@/types/goals';

interface TodaysGoalsProps {
  goalsDueToday: Goal[];
  goalsCompleted: number;
  goalsTotal: number;
  isCompleted: (goalId: string) => boolean;
  onToggle: (goalId: string) => void;
  isToggling?: boolean;
}

const TodaysGoals: React.FC<TodaysGoalsProps> = ({
  goalsDueToday,
  goalsCompleted,
  goalsTotal,
  isCompleted,
  onToggle,
  isToggling = false,
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archery className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Today's Goals</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {goalsCompleted}/{goalsTotal}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {goalsTotal === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No goals scheduled for today</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/goals')}>
              Manage Goals
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {goalsDueToday.map((goal) => {
              const completed = isCompleted(goal.id);
              return (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={completed}
                    onCheckedChange={() => onToggle(goal.id)}
                    disabled={isToggling}
                  />
                  <span
                    className={`text-sm flex-1 ${
                      completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {goal.title}
                  </span>
                  {completed && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysGoals;
