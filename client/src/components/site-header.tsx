import { useState } from "react";
import { useTheme } from "@/contexts/theme-provider";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Moon, Sun, Menu, Code, Sparkles } from "lucide-react";

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 shadow-md backdrop-blur-sm bg-white/90 dark:bg-slate-800/90">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left spacer */}
        <div className="w-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full transition-transform hover:scale-110"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Centered logo */}
        <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse"></div>
            <Code className="w-6 h-6 text-primary relative" />
          </div>
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            SourceXchange
          </Link>
        </div>
        
        {/* Right side */}
        <div className="w-10">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden rounded-full transition-transform hover:scale-110"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {mobileMenuOpen && (
            <div className="absolute top-full right-0 w-48 mt-2 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-5 duration-300">
              {/* Mobile menu is empty now since we removed Examples link */}
              <div className="px-4 py-2 text-sm text-slate-400">No menu items</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
