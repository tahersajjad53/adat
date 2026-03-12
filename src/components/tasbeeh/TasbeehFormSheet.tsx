import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardOffset } from '@/hooks/use-keyboard-offset';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TasbeehFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title?: string; target_count?: number }) => Promise<void>;
  isLoading?: boolean;
  initial?: { title?: string; target_count?: number | null };
}

export default function TasbeehFormSheet({ open, onOpenChange, onSubmit, isLoading, initial }: TasbeehFormSheetProps) {
  const isMobile = useIsMobile();
  const sheetRef = useRef<HTMLDivElement>(null);
  const keyboardOffset = useKeyboardOffset({ enabled: isMobile && open, containerRef: sheetRef });
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');

  const isEditing = !!initial;
  const formTitle = isEditing ? 'Edit Tasbeeh' : 'New Tasbeeh';
  const formDescription = isEditing ? 'Update your tasbeeh details' : 'Create a new tasbeeh to track';

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
      <Input
        id="tasbeeh-title"
        placeholder="Name (e.g. Subhan Allah)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="h-11 text-lg font-medium"
      />
      <Input
        id="tasbeeh-target"
        type="number"
        placeholder="Target count (leave empty for unlimited)"
        value={target}
        onChange={e => setTarget(e.target.value)}
        min={1}
      />
    </div>
  );

  const footer = (
    <div className="flex gap-3">
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">
        Cancel
      </Button>
      <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
        {isEditing ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          ref={sheetRef}
          className="max-h-[85dvh] flex flex-col rounded-t-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ paddingBottom: keyboardOffset > 0 ? keyboardOffset + 16 : undefined }}
        >
          <SheetHeader className="text-left">
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>{formDescription}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">{form}</div>
          <SheetFooter>{footer}</SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>{formDescription}</DialogDescription>
        </DialogHeader>
        {form}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
