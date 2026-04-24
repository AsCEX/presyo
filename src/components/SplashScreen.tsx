import React from "react";
import { Package } from "lucide-react";

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl animate-bounce">
          <Package size={48} />
        </div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 text-center">
          <h1 className="text-3xl font-bold tracking-tighter mb-1">Presyo</h1>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-progress origin-left"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
