import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CodeConverter } from "@/components/code-converter";
import { CodeExamples } from "@/components/code-examples";
import { motion } from "framer-motion";

export default function Home() {
  const [showExamples, setShowExamples] = useState(false);

  // Switch between converter and examples tabs
  const toggleView = (view: 'converter' | 'examples') => {
    setShowExamples(view === 'examples');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Convert code between 15+ programming languages with detailed explanations and examples.
          </p>
        </motion.div>
        
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => toggleView('converter')}
              className={`px-4 py-2 rounded-md transition-all ${
                !showExamples 
                  ? "bg-white dark:bg-slate-700 shadow-sm font-medium text-primary" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Converter
            </button>
            <button
              onClick={() => toggleView('examples')}
              className={`px-4 py-2 rounded-md transition-all ${
                showExamples 
                  ? "bg-white dark:bg-slate-700 shadow-sm font-medium text-primary" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Examples
            </button>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {showExamples ? <CodeExamples /> : <CodeConverter />}
        </motion.div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
