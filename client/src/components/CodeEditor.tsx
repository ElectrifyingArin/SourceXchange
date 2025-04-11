import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Clipboard, X } from "lucide-react";
import { motion } from "framer-motion";
import { CODE_TEMPLATES, SupportedLanguage } from "@/lib/code-templates";
import { toast } from "@/components/ui/use-toast";

interface CodeEditorProps {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  sourceCode: string;
  targetCode: string;
  onSourceCodeChange: (code: string) => void;
}

export function CodeEditor({ 
  sourceLanguage, 
  targetLanguage,
  sourceCode,
  targetCode,
  onSourceCodeChange
}: CodeEditorProps) {
  const handleSourceCodeChange = (value: string | undefined) => {
    onSourceCodeChange(value || "");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard",
    });
  };

  const clearSourceCode = () => {
    onSourceCodeChange("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      {/* Source code editor */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="font-medium">
            Source Code ({sourceLanguage})
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyCode(sourceCode)}
              className="h-8 w-8 rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Copy code"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSourceCode}
              className="h-8 w-8 rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Clear code"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900">
          <Editor
            height="400px"
            defaultLanguage={sourceLanguage}
            language={sourceLanguage}
            value={sourceCode}
            onChange={handleSourceCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              wrappingIndent: "same",
            }}
          />
        </div>
      </motion.div>
      
      {/* Target code editor */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="font-medium">
            Target Code ({targetLanguage})
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyCode(targetCode)}
              className="h-8 w-8 rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Copy code"
              disabled={!targetCode}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900">
          <Editor
            height="400px"
            defaultLanguage={targetLanguage}
            language={targetLanguage}
            value={targetCode}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              readOnly: true,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              wrappingIndent: "same",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
} 