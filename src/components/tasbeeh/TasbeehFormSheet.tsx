import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardOffset } from '@/hooks/use-keyboard-offset';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TasbeehFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title?: string; target_count?: number }) => Promise<void>;
  isLoading?: boolean;
  initial?: { title?: string; target_count?: number | null };
}

export default function TasbeehFormSheet({ open, onOpenChange, onSubmit, isLoading, initial }: TasbeehFormSheetProps) {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || '');
      setTarget(initial?.target_count ? String(initial.target_count) : '');
    }
  }, [open, initial]);

  const handleSubmit = async () => {
    await onSubmit({
      title: title.trim() || undefined,
      target_count: target ? parseInt(target, 10) : undefined,
    });
    onOpenChange(false);
  };

  const form = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="tasbeeh-title">Name</Label>
        <Input
          id="tasbeeh-title"
          placeholder="e.g. Salawat"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tasbeeh-target">Target count</Label>
        <Input
          id="tasbeeh-target"
          type="number"
          placeholder="Leave empty for unlimited"
          value={target}
          onChange={e => setTarget(e.target.value)}
          min={1}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl transition-[padding]" style={{ paddingBottom: keyboardOffset > 0 ? keyboardOffset + 16 : undefined }}>
          <SheetHeader>
            <SheetTitle>{initial ? 'Edit Tasbeeh' : 'New Tasbeeh Counter'}</SheetTitle>
          </SheetHeader>
          {form}
          <SheetFooter>
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
              {initial ? 'Update' : 'Create'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Tasbeeh' : 'New Tasbeeh Counter'}</DialogTitle>
        </DialogHeader>
        {form}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {initial ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
