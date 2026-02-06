import React from 'react';
import { Archery } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Goals: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display">Goals</h1>
            <p className="text-muted-foreground mt-1">
              Track your daily spiritual habits and recurring tasks.
            </p>
          </div>
          <Button>
            <Archery className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Archery className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No goals yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first goal to start tracking your daily habits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Goals;
