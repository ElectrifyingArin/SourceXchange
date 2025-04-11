import { useState } from "react";
import { ConvertCodeResponse } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, BookOpen, Code, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface CodeExplanationProps {
  explanation: ConvertCodeResponse["explanation"] | null;
}

export function CodeExplanation({
  explanation,
}: CodeExplanationProps) {
  const [activeTab, setActiveTab] = useState("step-by-step");
  const { toast } = useToast();

  const copyExplanation = () => {
    if (!explanation) return;
    
    let content = "";
    if (activeTab === "step-by-step") {
      content = explanation.stepByStep
        .map(step => `${step.title}\n${step.explanation}`)
        .join("\n\n");
    } else if (activeTab === "high-level") {
      content = explanation.highLevel;
    } else if (activeTab === "language-differences") {
      content = explanation.languageDifferences;
    }
    
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Explanation has been copied to your clipboard",
    });
  };

  if (!explanation) return null;

  return (
    <Card className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-primary" />
          Code Conversion Explanation
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={copyExplanation} 
            className="h-8 w-8 rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-all" 
            title="Copy explanation"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="step-by-step" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b border-slate-200 dark:border-slate-700 px-4 w-full justify-start rounded-none gap-2 h-12">
          <TabsTrigger 
            value="step-by-step" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:text-primary flex items-center gap-1"
          >
            <Code className="h-4 w-4" />
            Step-by-Step
          </TabsTrigger>
          <TabsTrigger 
            value="high-level" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:text-primary flex items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            High-Level Summary
          </TabsTrigger>
          <TabsTrigger 
            value="language-differences" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:text-primary flex items-center gap-1"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Language Differences
          </TabsTrigger>
        </TabsList>
        
        <div className="p-4 overflow-auto h-[30rem]">
          <TabsContent value="step-by-step" className="mt-0 space-y-4">
            {explanation.stepByStep.map((step, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <h5 className="font-medium text-sm mb-3 text-primary">{step.title}</h5>
                <div className="flex flex-col md:flex-row gap-6 text-sm mb-3">
                  <div className="flex-1">
                    <div className="text-xs mb-1 text-slate-500 dark:text-slate-400">Source Code:</div>
                    <div className="font-mono text-xs p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">{step.sourceCode}</div>
                  </div>
                  <div className="flex-1 relative">
                    <div className="hidden md:block absolute left-0 top-1/2 -translate-x-[18px] -translate-y-1/2">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRightLeft className="h-5 w-5 text-primary rotate-90" />
                      </motion.div>
                    </div>
                    <div className="text-xs mb-1 text-slate-500 dark:text-slate-400">Target Code:</div>
                    <div className="font-mono text-xs p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">{step.targetCode}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.explanation}
                </p>
              </motion.div>
            ))}
          </TabsContent>
          
          <TabsContent value="high-level" className="mt-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="prose dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">{explanation.highLevel}</p>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="language-differences" className="mt-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="prose dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">{explanation.languageDifferences}</p>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
