import React from 'react';
import ibadatLogo from '@/assets/ibadat-logo.svg';
import splashImage from '@/assets/splash-image.png';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Splash image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <img
          src={splashImage}
          alt="Spiritual sanctuary"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
        <img src={ibadatLogo} alt="Ibadat" className="w-24 h-auto" />
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3 font-display">Your Companion for Consistent Ibadat</h2>
            <p className="text-lg opacity-90 mb-3 text-left">
              عبادة ني پابندي ما ساتهي
            </p>
            <span className="text-[10px] uppercase tracking-[0.25em] opacity-70">Designed for Dawoodi Bohras</span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-background">
        <div className="lg:hidden mb-8">
          <img src={ibadatLogo} alt="Ibadat" className="w-28 h-auto" />
        </div>
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
