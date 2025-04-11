import { useRef, useEffect } from "react";

interface OutputConsoleProps {
  output: string;
}

export function OutputConsole({ output }: OutputConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-medium">Output Console</h3>
      </div>
      <div 
        ref={consoleRef}
        className="p-4 bg-slate-900 text-slate-100 font-mono text-sm h-32 overflow-auto whitespace-pre-wrap"
      >
        {output || "> Ready to execute code..."}
      </div>
    </div>
  );
}
