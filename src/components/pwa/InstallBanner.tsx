import React from 'react';
import { Xmark, ShareIos } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallBanner() {
  const { showBanner, isIOS, canPrompt, promptInstall, dismiss } = usePWAInstall();

  if (!showBanner) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-background/40 backdrop-blur-xl backdrop-saturate-150 border-t border-border/50">
      <div className="flex-1 min-w-0">
        {isIOS && !canPrompt ? (
          <p className="text-xs text-muted-foreground">
            Tap <ShareIos className="inline h-3.5 w-3.5 -mt-0.5" /> then <span className="font-medium text-foreground">"Add to Home Screen"</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Install <span className="font-medium text-foreground">Ibadat</span> for a better experience
          </p>
        )}
      </div>
      {canPrompt && (
        <Button size="sm" className="h-7 text-xs px-3" onClick={promptInstall}>
          Install
        </Button>
      )}
      <button
        onClick={dismiss}
        className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <Xmark className="h-4 w-4" />
      </button>
    </div>
  );
}
