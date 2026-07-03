import React from 'react';
import { MoreHoriz, Minus, Plus } from 'iconoir-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useReaderPrefs, READER_FONT_SIZES } from '@/hooks/useReaderPrefs';

export const ReaderPreferencesMenu: React.FC = () => {
  const { prefs, increaseFont, decreaseFont, canIncrease, canDecrease } =
    useReaderPrefs();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Reader preferences"
        >
          <MoreHoriz className="h-5 w-5" strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <DropdownMenuLabel className="px-1 pb-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Arabic size
        </DropdownMenuLabel>
        <div className="flex items-center justify-between gap-2 px-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={decreaseFont}
            disabled={!canDecrease}
            aria-label="Decrease font size"
          >
            <Minus className="h-4 w-4" strokeWidth={2} />
          </Button>
          <div className="flex-1 flex items-center justify-center gap-1">
            {READER_FONT_SIZES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i <= prefs.fontStep ? 'bg-foreground' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={increaseFont}
            disabled={!canIncrease}
            aria-label="Increase font size"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
