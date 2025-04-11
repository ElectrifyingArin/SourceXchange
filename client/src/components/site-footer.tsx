import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-white dark:bg-slate-800 py-6 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="text-center mb-10">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} SourceXchange. All rights reserved.
            </p>
          </div>
          
          {/* Made by Arin with animated lightning bolt - matching the header style */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 animate-pulse"></div>
              <Zap className="w-6 h-6 text-amber-400 relative" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-amber-400 bg-clip-text text-transparent">
              Made by Arin
            </h2>
          </div>
        </div>
      </div>
    </footer>
  );
}
