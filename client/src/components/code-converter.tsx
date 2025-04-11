import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/language-selector";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { useCodeConversion } from "@/hooks/use-code-conversion";
import { Sparkles, ArrowRightLeft, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { SupportedLanguage } from "@/lib/code-templates";

// Define typed code examples for different languages
interface CodeExamples {
  [key: string]: string;
}

const CODE_EXAMPLES: CodeExamples = {
  javascript: `// Simple function to add two numbers
function add(a, b) {
  return a + b;
}

// Calculate sum of 5 and 3
const result = add(5, 3);
console.log("The sum is:", result);`,

  python: `# Simple function to add two numbers
def add(a, b):
    return a + b

# Calculate sum of 5 and 3
result = add(5, 3)
print("The sum is:", result)`,

  typescript: `// Simple function to add two numbers
function add(a: number, b: number): number {
  return a + b;
}

// Calculate sum of 5 and 3
const result = add(5, 3);
console.log("The sum is:", result);`,

  java: `// Simple function to add two numbers
public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        // Calculate sum of 5 and 3
        int result = add(5, 3);
        System.out.println("The sum is: " + result);
    }
}`,

  csharp: `// Simple function to add two numbers
using System;

class Calculator {
    static int Add(int a, int b) {
        return a + b;
    }
    
    static void Main() {
        // Calculate sum of 5 and 3
        int result = Add(5, 3);
        Console.WriteLine("The sum is: " + result);
    }
}`,

  go: `// Simple function to add two numbers
package main

import "fmt"

func add(a, b int) int {
    return a + b
}

func main() {
    // Calculate sum of 5 and 3
    result := add(5, 3)
    fmt.Println("The sum is:", result)
}`,

  ruby: `# Simple function to add two numbers
def add(a, b)
  return a + b
end

# Calculate sum of 5 and 3
result = add(5, 3)
puts "The sum is: #{result}"`,

  php: `<?php
// Simple function to add two numbers
function add($a, $b) {
    return $a + $b;
}

// Calculate sum of 5 and 3
$result = add(5, 3);
echo "The sum is: " . $result;
?>`,

  swift: `// Simple function to add two numbers
func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}

// Calculate sum of 5 and 3
let result = add(5, 3)
print("The sum is: \(result)")`,

  rust: `// Simple function to add two numbers
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    // Calculate sum of 5 and 3
    let result = add(5, 3);
    println!("The sum is: {}", result);
}`,

  kotlin: `// Simple function to add two numbers
fun add(a: Int, b: Int): Int {
    return a + b
}

fun main() {
    // Calculate sum of 5 and 3
    val result = add(5, 3)
    println("The sum is: $result")
}`,

  dart: `// Simple function to add two numbers
int add(int a, int b) {
  return a + b;
}

void main() {
  // Calculate sum of 5 and 3
  var result = add(5, 3);
  print("The sum is: $result");
}`,

  r: `# Simple function to add two numbers
add <- function(a, b) {
  return(a + b)
}

# Calculate sum of 5 and 3
result <- add(5, 3)
print(paste("The sum is:", result))`,

  julia: `# Simple function to add two numbers
function add(a, b)
    return a + b
end

# Calculate sum of 5 and 3
result = add(5, 3)
println("The sum is: $result")`,

  shell: `#!/bin/bash
# Simple function to add two numbers
add() {
  echo $(($1 + $2))
}

# Calculate sum of 5 and 3
result=$(add 5 3)
echo "The sum is: $result"`,
};

export function CodeConverter() {
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>("javascript");
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>("python");
  const [sourceCode, setSourceCode] = useState(CODE_EXAMPLES.javascript);
  const [targetCode, setTargetCode] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const {
    convert,
    isConverting,
  } = useCodeConversion();

  const handleConvertCode = async () => {
    if (!sourceCode?.trim()) {
      toast({
        title: "Error",
        description: "Please enter some source code to convert",
        variant: "destructive",
      });
      return;
    }

    // Start the animation
    setIsAnimating(true);
    setTargetCode("// Converting...");
    
    try {
      const result = await convert({
        sourceCode,
        sourceLanguage,
        targetLanguage,
      });
      setTargetCode(result.targetCode);
    } catch (error) {
      console.error('Conversion error:', error);
      setTargetCode("// Conversion failed. Please try again.");
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "An error occurred during conversion",
        variant: "destructive",
      });
    } finally {
      setIsAnimating(false);
    }
  };

  // Swap source and target languages
  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
  };

  // Make sure languages are different and update source code
  useEffect(() => {
    // Update source code when language changes - safely access as key
    const langExample = sourceLanguage as keyof typeof CODE_EXAMPLES;
    if (CODE_EXAMPLES[langExample]) {
      setSourceCode(CODE_EXAMPLES[langExample]);
    } else {
      // Fallback to JavaScript if the language isn't in our examples
      setSourceCode(CODE_EXAMPLES.javascript);
    }
    
    // Ensure source and target languages are different
    if (sourceLanguage === targetLanguage) {
      // Default to Python if JavaScript is selected for both
      if (sourceLanguage === "javascript") {
        setTargetLanguage("python");
      } else {
        setTargetLanguage("javascript");
      }
    }
  }, [sourceLanguage, targetLanguage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Settings panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4"
      >
        <h3 className="font-semibold mb-4 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-primary" />
          Settings
        </h3>
        
        <div className="space-y-5">
          <div className="relative">
            <LanguageSelector
              label="From Language"
              value={sourceLanguage}
              onChange={setSourceLanguage}
            />
            
            <div className="absolute left-1/2 -translate-x-1/2 my-2 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapLanguages}
                className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-transform hover:scale-110"
                title="Swap languages"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-7">
              <LanguageSelector
                label="To Language"
                value={targetLanguage}
                onChange={setTargetLanguage}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleConvertCode}
              disabled={isConverting}
            >
              <Play className={`h-4 w-4 ${isConverting ? 'animate-spin' : ''}`} />
              {isConverting ? 'Converting...' : 'Convert Code'}
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Main content area */}
      <div className="lg:col-span-4">
        <CodeEditor 
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          sourceCode={sourceCode}
          targetCode={targetCode}
          onSourceCodeChange={setSourceCode}
        />
      </div>
    </div>
  );
}
