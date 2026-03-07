import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';

const WHATS_NEW_KEY = 'whats-new-v2';

const UPDATES = [
  { emoji: '🎨', text: 'Softer pastel prayer gradients across the app' },
  { emoji: '📅', text: 'Swipe between weeks on the Calendar page' },
  { emoji: '🏷️', text: 'Goals are now grouped by tags on your Today page' },
  { emoji: '🔀', text: 'Reorder your tag groups from Profile settings' },
  { emoji: '🔍', text: 'Filter goals by tag on the Goals page' },
];

const THEME_GRADIENTS: Record<ThemeName, string> = {
  oudh: 'linear-gradient(135deg, hsl(40 30% 94%), hsl(160 30% 85%), hsl(40 25% 92%))',
  khalaf: 'linear-gradient(135deg, hsl(0 0% 98%), hsl(220 15% 94%), hsl(0 0% 97%))',
  bhukur: 'linear-gradient(135deg, hsl(207 11% 18%), hsl(24 40% 22%), hsl(210 14% 20%))',
};

const THEME_TEXT: Record<ThemeName, { fg: string; muted: string; btnBg: string; btnFg: string }> = {
  oudh: { fg: 'text-foreground', muted: 'text-muted-foreground', btnBg: 'bg-primary', btnFg: 'text-primary-foreground' },
  khalaf: { fg: 'text-foreground', muted: 'text-muted-foreground', btnBg: 'bg-primary', btnFg: 'text-primary-foreground' },
  bhukur: { fg: 'text-[hsl(0_0%_92%)]', muted: 'text-[hsl(0_0%_60%)]', btnBg: 'bg-accent', btnFg: 'text-accent-foreground' },
};

const WhatsNewPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (localStorage.getItem(WHATS_NEW_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem(WHATS_NEW_KEY, 'true');
  };

  const colors = THEME_TEXT[theme];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent
        className="border-0 shadow-2xl p-0 overflow-hidden"
        style={{ background: THEME_GRADIENTS[theme] }}
      >
        <div className="p-8 space-y-6">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${colors.muted}`}>
              What's new
            </span>
            <DialogTitle className={`text-2xl font-display font-bold mt-1 ${colors.fg}`}>
              Fresh updates for you ✨
            </DialogTitle>
          </div>

          <ul className="space-y-4">
            {UPDATES.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-xl leading-none mt-0.5">{item.emoji}</span>
                <span className={`text-[15px] leading-relaxed ${colors.fg}`}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          <Button
            onClick={dismiss}
            className={`w-full ${colors.btnBg} ${colors.btnFg} font-semibold`}
            size="lg"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewPopup;
