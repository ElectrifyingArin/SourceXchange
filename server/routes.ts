import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { convertCodeSchema, type ConvertCodeRequest, type ConvertCodeResponse } from "@shared/schema";
import { z } from "zod";

// Local conversion functions
  function convertJavaScriptToPython(sourceCode: string): string {
    const lines = sourceCode.split("\n");
    const convertedLines: string[] = [];
    let indentLevel = 0;
    let inFunction = false;
    let inBlock = false;
    let inComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      let convertedLine = line;
      let newIndentLevel = indentLevel;
      
      // Skip empty lines
      if (line === "") {
        convertedLines.push("");
        continue;
      }
      
    // Handle multi-line comments
    if (line.includes("/*")) {
      inComment = true;
      convertedLine = line.replace("/*", '"""');
    }
    if (line.includes("*/")) {
      inComment = false;
      convertedLine = line.replace("*/", '"""');
    }
    if (inComment) {
      convertedLines.push("    ".repeat(indentLevel) + convertedLine);
      continue;
    }
    
    // Handle single-line comments
      if (line.startsWith("//")) {
        convertedLines.push("    ".repeat(indentLevel) + "# " + line.substring(2));
        continue;
      }
      
      // Handle function declarations
      if (line.match(/function\s+(\w+)\s*\((.*?)\)/)) {
        const match = line.match(/function\s+(\w+)\s*\((.*?)\)(.*)/);
        if (match) {
          const functionName = match[1];
          const params = match[2];
          inFunction = true;
          convertedLine = `def ${functionName}(${params}):`;
          newIndentLevel++;
        }
      }
    
    // Handle variable declarations with better type inference
    else if (line.match(/(?:const|let|var)\s+(\w+)\s*=\s*(.*)/)) {
      const match = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*(.*)/);
        if (match) {
        const varName = match[1];
        let value = match[2].replace(/;$/, "");
        
        // Convert array literals
        if (value.includes("[")) {
          value = value.replace(/\[/g, "[").replace(/\]/g, "]");
        }
        
        // Convert object literals to dictionaries
        if (value.includes("{")) {
          value = value.replace(/{/g, "{").replace(/}/g, "}");
        }
        
        // Handle template literals
        if (value.includes("`")) {
          value = value.replace(/`/g, '"').replace(/\${(.*?)}/g, "{$1}");
        }
        
        convertedLine = `${varName} = ${value}`;
      }
    }
    
    // Handle if statements with better condition parsing
    else if (line.match(/if\s*\((.*)\)/)) {
      const match = line.match(/if\s*\((.*)\)/);
        if (match) {
        let condition = match[1];
        // Convert JavaScript operators to Python
        condition = condition
          .replace(/===/g, "==")
          .replace(/!==/g, "!=")
          .replace(/&&/g, "and")
          .replace(/\|\|/g, "or")
          .replace(/null/g, "None")
          .replace(/undefined/g, "None");
          convertedLine = `if ${condition}:`;
          newIndentLevel++;
        inBlock = true;
      }
    }
    
    // Handle else if statements
    else if (line.match(/else\s+if\s*\((.*)\)/)) {
      const match = line.match(/else\s+if\s*\((.*)\)/);
      if (match) {
        let condition = match[1];
        condition = condition
          .replace(/===/g, "==")
          .replace(/!==/g, "!=")
          .replace(/&&/g, "and")
          .replace(/\|\|/g, "or")
          .replace(/null/g, "None")
          .replace(/undefined/g, "None");
        convertedLine = `elif ${condition}:`;
        newIndentLevel++;
        inBlock = true;
      }
    }
    
    // Handle else statements
    else if (line.match(/else\s*{?/)) {
      convertedLine = "else:";
      newIndentLevel++;
      inBlock = true;
    }
    
    // Handle for loops with better range handling
    else if (line.match(/for\s*\((.*)\)/)) {
      const match = line.match(/for\s*\(\s*(?:let|var|const)?\s*(\w+)\s*=\s*([^;]+);\s*\1\s*(<|<=|>|>=)\s*([^;]+);\s*\1(\+\+|\-\-|.=.*)\)/);
        if (match) {
        const varName = match[1];
        const startVal = match[2];
        const operator = match[3];
        const endVal = match[4];
        const step = match[5];
        
        if (step === "++") {
          convertedLine = `for ${varName} in range(${startVal}, ${endVal}):`;
        } else if (step === "--") {
          convertedLine = `for ${varName} in range(${endVal} - 1, ${startVal} - 1, -1):`;
        } else {
          convertedLine = `for ${varName} in range(${startVal}, ${endVal}, ${step.replace(/[^0-9-]/g, "")}):`;
        }
        newIndentLevel++;
        inBlock = true;
      }
    }
    
    // Handle while loops
    else if (line.match(/while\s*\((.*)\)/)) {
      const match = line.match(/while\s*\((.*)\)/);
        if (match) {
        let condition = match[1];
        condition = condition
          .replace(/===/g, "==")
          .replace(/!==/g, "!=")
          .replace(/&&/g, "and")
          .replace(/\|\|/g, "or")
          .replace(/null/g, "None")
          .replace(/undefined/g, "None");
        convertedLine = `while ${condition}:`;
          newIndentLevel++;
        inBlock = true;
      }
    }
    
    // Handle console.log with better formatting
    else if (line.match(/console\.log\((.*)\);?/)) {
      const match = line.match(/console\.log\((.*)\);?/);
      if (match) {
        const content = match[1];
        convertedLine = `print(${content})`;
      }
    }
    
      // Handle return statements
    else if (line.match(/return\s+(.*);?/)) {
      const match = line.match(/return\s+(.*);?/);
        if (match) {
          convertedLine = `return ${match[1]}`;
        }
      }
    
    // Handle opening braces
    else if (line === "{") {
      convertedLine = "";
      newIndentLevel++;
      inBlock = true;
    }
    
    // Handle closing braces
    else if (line === "}") {
      convertedLine = "";
      newIndentLevel = Math.max(0, newIndentLevel - 1);
      inBlock = false;
    }
    
    // Add proper indentation
      if (convertedLine !== "") {
        convertedLines.push("    ".repeat(indentLevel) + convertedLine);
      }
      indentLevel = newIndentLevel;
    }
    
    return convertedLines.join("\n");
  }
  
  function convertPythonToJavaScript(sourceCode: string): string {
    const lines = sourceCode.split("\n");
    const convertedLines: string[] = [];
    let indentStack: number[] = [0];
    let currentIndent = 0;
    let inFunction = false;
    let inComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let initialSpaces = line.search(/\S|$/);
      let trimmedLine = line.trim();
      let convertedLine = trimmedLine;
      
      if (trimmedLine === "") {
        convertedLines.push("");
        continue;
      }
      
    // Handle multi-line comments
    if (trimmedLine.includes('"""')) {
      inComment = !inComment;
      convertedLine = trimmedLine.replace(/"""/g, inComment ? "/*" : "*/");
    }
    if (inComment) {
      convertedLines.push("  ".repeat(indentStack.length - 1) + convertedLine);
      continue;
    }
    
    // Handle single-line comments
      if (trimmedLine.startsWith("#")) {
        convertedLines.push("  ".repeat(indentStack.length - 1) + "// " + trimmedLine.substring(1));
        continue;
      }
      
      // Check for decrease in indentation
      if (initialSpaces < currentIndent) {
        while (indentStack.length > 1 && indentStack[indentStack.length - 1] > initialSpaces) {
          indentStack.pop();
          convertedLines.push("  ".repeat(indentStack.length - 1) + "}");
        }
      }
      
      currentIndent = initialSpaces;
      
      // Check for new indent level
      if (initialSpaces > indentStack[indentStack.length - 1]) {
        indentStack.push(initialSpaces);
      }
      
      // Handle function definitions
    if (trimmedLine.startsWith("def ")) {
      const match = trimmedLine.match(/def\s+(\w+)\s*\((.*?)\):/);
        if (match) {
          const functionName = match[1];
          const params = match[2];
          convertedLine = `function ${functionName}(${params}) {`;
        inFunction = true;
      }
    }
    
    // Handle if statements with better condition parsing
    else if (trimmedLine.startsWith("if ")) {
      let condition = trimmedLine.substring(3).replace(/:$/, "");
      condition = condition
        .replace(/==/g, "===")
        .replace(/!=/g, "!==")
        .replace(/\band\b/g, "&&")
        .replace(/\bor\b/g, "||")
        .replace(/None/g, "null");
          convertedLine = `if (${condition}) {`;
        }
    
    // Handle elif statements
    else if (trimmedLine.startsWith("elif ")) {
      let condition = trimmedLine.substring(5).replace(/:$/, "");
      condition = condition
        .replace(/==/g, "===")
        .replace(/!=/g, "!==")
        .replace(/\band\b/g, "&&")
        .replace(/\bor\b/g, "||")
        .replace(/None/g, "null");
      convertedLine = `} else if (${condition}) {`;
    }
    
    // Handle else statements
    else if (trimmedLine === "else:") {
      convertedLine = "} else {";
    }
    
    // Handle for loops with better range handling
    else if (trimmedLine.startsWith("for ")) {
      const match = trimmedLine.match(/for\s+(\w+)\s+in\s+range\(([^)]+)\):/);
      if (match) {
        const varName = match[1];
        const rangeArgs = match[2].split(",").map(arg => arg.trim());
              if (rangeArgs.length === 1) {
                convertedLine = `for (let ${varName} = 0; ${varName} < ${rangeArgs[0]}; ${varName}++) {`;
              } else if (rangeArgs.length === 2) {
                convertedLine = `for (let ${varName} = ${rangeArgs[0]}; ${varName} < ${rangeArgs[1]}; ${varName}++) {`;
              } else if (rangeArgs.length === 3) {
          const step = rangeArgs[2];
          if (step.startsWith("-")) {
            const endVal = parseInt(rangeArgs[1]);
            const startVal = parseInt(rangeArgs[0]);
            convertedLine = `for (let ${varName} = ${endVal - 1}; ${varName} >= ${startVal}; ${varName} += ${step}) {`;
          } else {
            convertedLine = `for (let ${varName} = ${rangeArgs[0]}; ${varName} < ${rangeArgs[1]}; ${varName} += ${step}) {`;
              }
            }
          } else {
        // Handle other for loops (like for...in)
        const match = trimmedLine.match(/for\s+(\w+)\s+in\s+(.+):/);
        if (match) {
          const varName = match[1];
          const iterable = match[2];
            convertedLine = `for (let ${varName} of ${iterable}) {`;
          }
        }
      }
    
    // Handle while loops
    else if (trimmedLine.startsWith("while ")) {
      let condition = trimmedLine.substring(6).replace(/:$/, "");
      condition = condition
        .replace(/==/g, "===")
        .replace(/!=/g, "!==")
        .replace(/\band\b/g, "&&")
        .replace(/\bor\b/g, "||")
        .replace(/None/g, "null");
      convertedLine = `while (${condition}) {`;
    }
    
    // Handle print statements with better formatting
    else if (trimmedLine.startsWith("print(")) {
      const match = trimmedLine.match(/print\((.*)\)/);
        if (match) {
          const content = match[1];
          convertedLine = `console.log(${content});`;
        }
      }
    
    // Handle variable assignments with better type inference
      else if (trimmedLine.match(/^(\w+)\s*=\s*(.+)/)) {
        const match = trimmedLine.match(/^(\w+)\s*=\s*(.+)/);
        if (match) {
          const varName = match[1];
        let value = match[2];
        
        // Handle Python-specific values
        value = value
          .replace(/None/g, "null")
          .replace(/True/g, "true")
          .replace(/False/g, "false");
        
          convertedLine = `let ${varName} = ${value};`;
        }
      }
    
      // Handle return statements
    else if (trimmedLine.startsWith("return ")) {
      const match = trimmedLine.match(/return\s+(.+)/);
        if (match) {
        convertedLine = `return ${match[1]};`;
        }
      }
    
    // Add semicolons to statements that need them
      else if (!trimmedLine.endsWith(":") && !trimmedLine.endsWith("{") && !trimmedLine.endsWith("}")) {
      convertedLine = convertedLine + ";";
      }
      
      // Add the proper indentation
      convertedLines.push("  ".repeat(indentStack.length - 1) + convertedLine);
    }
    
    // Close any remaining indent levels
    while (indentStack.length > 1) {
      indentStack.pop();
      convertedLines.push("  ".repeat(indentStack.length - 1) + "}");
    }
    
    return convertedLines.join("\n");
  }
  
function convertTypeScriptToJavaScript(sourceCode: string): string {
  const lines = sourceCode.split("\n");
  const convertedLines: string[] = [];
  let inComment = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    let convertedLine = line;
    
    // Skip empty lines
    if (line === "") {
      convertedLines.push("");
      continue;
    }
    
    // Handle multi-line comments
    if (line.includes("/*")) {
      inComment = true;
    }
    if (line.includes("*/")) {
      inComment = false;
    }
    if (inComment) {
      convertedLines.push(line);
      continue;
    }
    
    // Remove type annotations
    convertedLine = convertedLine
      .replace(/: (string|number|boolean|any|void|object|Array<.*>|Promise<.*>|Function|\(.*\) => .*)/g, "")
      .replace(/interface\s+\w+\s*{.*}/g, "")
      .replace(/type\s+\w+\s*=.*;/g, "")
      .replace(/declare\s+.*;/g, "")
      .replace(/export\s+type\s+\w+\s*=.*;/g, "")
      .replace(/export\s+interface\s+\w+\s*{.*}/g, "");
    
    // Convert TypeScript specific syntax
    convertedLine = convertedLine
      .replace(/public\s+/g, "")
      .replace(/private\s+/g, "")
      .replace(/protected\s+/g, "")
      .replace(/readonly\s+/g, "")
      .replace(/abstract\s+/g, "")
      .replace(/static\s+/g, "")
      .replace(/implements\s+.*{/g, "{")
      .replace(/extends\s+.*{/g, "{");
    
    // Handle enums
    if (line.match(/enum\s+\w+\s*{/)) {
      const enumName = line.match(/enum\s+(\w+)\s*{/)?.[1];
      if (enumName) {
        convertedLine = `const ${enumName} = {`;
      }
    }
    
    // Handle optional chaining
    convertedLine = convertedLine.replace(/\?\./g, "&&");
    
    // Handle nullish coalescing
    convertedLine = convertedLine.replace(/\?\?/g, "||");
    
    // Handle template literal types
    convertedLine = convertedLine.replace(/`\${(.*)}`/g, "$1");
    
    if (convertedLine !== "") {
      convertedLines.push(convertedLine);
    }
  }
  
  return convertedLines.join("\n");
}

function convertJavaToPython(sourceCode: string): string {
  const lines = sourceCode.split("\n");
  const convertedLines: string[] = [];
  let indentLevel = 0;
  let inClass = false;
  let inMethod = false;
  let inComment = false;
  let currentClass = "";
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    let convertedLine = line;
    let newIndentLevel = indentLevel;
    
    // Skip empty lines
    if (line === "") {
      convertedLines.push("");
      continue;
    }
    
    // Handle multi-line comments
    if (line.includes("/*")) {
      inComment = true;
      convertedLine = line.replace("/*", '"""');
    }
    if (line.includes("*/")) {
      inComment = false;
      convertedLine = line.replace("*/", '"""');
    }
    if (inComment) {
      convertedLines.push("    ".repeat(indentLevel) + convertedLine);
      continue;
    }
    
    // Handle single-line comments
    if (line.startsWith("//")) {
      convertedLines.push("    ".repeat(indentLevel) + "# " + line.substring(2));
      continue;
    }
    
    // Handle class declarations
    if (line.match(/class\s+(\w+)/)) {
      const match = line.match(/class\s+(\w+)/);
      if (match) {
        currentClass = match[1];
        convertedLine = `class ${currentClass}:`;
        inClass = true;
        newIndentLevel++;
      }
    }
    
    // Handle method declarations
    else if (line.match(/(public|private|protected)?\s*(static)?\s*(\w+)\s+(\w+)\s*\((.*)\)/)) {
      const match = line.match(/(public|private|protected)?\s*(static)?\s*(\w+)\s+(\w+)\s*\((.*)\)/);
      if (match) {
        const returnType = match[3];
        const methodName = match[4];
        const params = match[5];
        inMethod = true;
        
        // Convert parameters to Python style
        const pythonParams = params.split(",").map(param => {
          const parts = param.trim().split(" ");
          return parts[parts.length - 1]; // Get the variable name
        }).join(", ");
        
        convertedLine = `def ${methodName}(${pythonParams}):`;
        newIndentLevel++;
      }
    }
    
    // Handle variable declarations
    else if (line.match(/(\w+)\s+(\w+)\s*=\s*(.*);/)) {
      const match = line.match(/(\w+)\s+(\w+)\s*=\s*(.*);/);
      if (match) {
        const varName = match[2];
        const value = match[3];
        convertedLine = `${varName} = ${value}`;
      }
    }
    
    // Handle if statements
    else if (line.match(/if\s*\((.*)\)/)) {
      const match = line.match(/if\s*\((.*)\)/);
      if (match) {
        let condition = match[1];
        condition = condition
          .replace(/&&/g, "and")
          .replace(/\|\|/g, "or");
        convertedLine = `if ${condition}:`;
        newIndentLevel++;
      }
    }
    
    // Handle else if statements
    else if (line.match(/else\s+if\s*\((.*)\)/)) {
      const match = line.match(/else\s+if\s*\((.*)\)/);
      if (match) {
        let condition = match[1];
        condition = condition
          .replace(/&&/g, "and")
          .replace(/\|\|/g, "or");
        convertedLine = `elif ${condition}:`;
        newIndentLevel++;
      }
    }
    
    // Handle else statements
    else if (line.match(/else\s*{?/)) {
      convertedLine = "else:";
      newIndentLevel++;
    }
    
    // Handle for loops
    else if (line.match(/for\s*\((.*)\)/)) {
      const match = line.match(/for\s*\(\s*(\w+)\s+(\w+)\s*=\s*([^;]+);\s*\2\s*(<|<=|>|>=)\s*([^;]+);\s*\2(\+\+|\-\-|.=.*)\)/);
      if (match) {
        const varName = match[2];
        const startVal = match[3];
        const endVal = match[5];
        const step = match[6];
        
        if (step === "++") {
          convertedLine = `for ${varName} in range(${startVal}, ${endVal}):`;
        } else if (step === "--") {
          convertedLine = `for ${varName} in range(${endVal} - 1, ${startVal} - 1, -1):`;
        } else {
          convertedLine = `for ${varName} in range(${startVal}, ${endVal}, ${step.replace(/[^0-9-]/g, "")}):`;
        }
        newIndentLevel++;
      }
    }
    
    // Handle while loops
    else if (line.match(/while\s*\((.*)\)/)) {
      const match = line.match(/while\s*\((.*)\)/);
      if (match) {
        let condition = match[1];
        condition = condition
          .replace(/&&/g, "and")
          .replace(/\|\|/g, "or");
        convertedLine = `while ${condition}:`;
        newIndentLevel++;
      }
    }
    
    // Handle System.out.println
    else if (line.match(/System\.out\.println\((.*)\);/)) {
      const match = line.match(/System\.out\.println\((.*)\);/);
      if (match) {
        convertedLine = `print(${match[1]})`;
      }
    }
    
    // Handle return statements
    else if (line.match(/return\s+(.*);/)) {
      const match = line.match(/return\s+(.*);/);
      if (match) {
        convertedLine = `return ${match[1]}`;
      }
    }
    
    // Handle opening braces
    else if (line === "{") {
      convertedLine = "";
      newIndentLevel++;
    }
    
    // Handle closing braces
    else if (line === "}") {
      convertedLine = "";
      newIndentLevel = Math.max(0, newIndentLevel - 1);
      if (newIndentLevel === 0) {
        inClass = false;
        inMethod = false;
      }
    }
    
    // Add proper indentation
    if (convertedLine !== "") {
      convertedLines.push("    ".repeat(indentLevel) + convertedLine);
    }
    indentLevel = newIndentLevel;
  }
  
  return convertedLines.join("\n");
}

function convertPythonToJava(sourceCode: string): string {
  const lines = sourceCode.split("\n");
  const convertedLines: string[] = [];
  let indentStack: number[] = [0];
  let currentIndent = 0;
  let inClass = false;
  let inMethod = false;
  let currentClass = "";
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let initialSpaces = line.search(/\S|$/);
    let trimmedLine = line.trim();
    let convertedLine = trimmedLine;
    
    if (trimmedLine === "") {
      convertedLines.push("");
      continue;
    }
    
    // Handle comments
    if (trimmedLine.startsWith("#")) {
      convertedLines.push("  ".repeat(indentStack.length - 1) + "// " + trimmedLine.substring(1));
      continue;
    }
    
    // Check for decrease in indentation
    if (initialSpaces < currentIndent) {
      while (indentStack.length > 1 && indentStack[indentStack.length - 1] > initialSpaces) {
        indentStack.pop();
        convertedLines.push("  ".repeat(indentStack.length - 1) + "}");
      }
    }
    
    currentIndent = initialSpaces;
    
    // Check for new indent level
    if (initialSpaces > indentStack[indentStack.length - 1]) {
      indentStack.push(initialSpaces);
    }
    
    // Handle class definitions
    if (trimmedLine.startsWith("class ")) {
      const match = trimmedLine.match(/class\s+(\w+):/);
      if (match) {
        currentClass = match[1];
        convertedLine = `public class ${currentClass} {`;
        inClass = true;
      }
    }
    
    // Handle method definitions
    else if (trimmedLine.startsWith("def ")) {
      const match = trimmedLine.match(/def\s+(\w+)\s*\((.*?)\):/);
      if (match) {
        const methodName = match[1];
        const params = match[2];
        inMethod = true;
        
        // Convert parameters to Java style
        const javaParams = params.split(",").map(param => {
          const paramName = param.trim();
          return `Object ${paramName}`;
        }).join(", ");
        
        convertedLine = `public void ${methodName}(${javaParams}) {`;
      }
    }
    
    // Handle if statements
    else if (trimmedLine.startsWith("if ")) {
      let condition = trimmedLine.substring(3).replace(/:$/, "");
      condition = condition
        .replace(/\band\b/g, "&&")
        .replace(/\bor\b/g, "||");
      convertedLine = `if (${condition}) {`;
    }
    
    // Handle elif statements
    else if (trimmedLine.startsWith("elif ")) {
      let condition = trimmedLine.substring(5).replace(/:$/, "");
      condition = condition
        .replace(/\band\b/g, "&&")
        .replace(/\bor\b/g, "||");
      convertedLine = `} else if (${condition}) {`;
    }
    
    // Handle else statements
    else if (trimmedLine === "else:") {
      convertedLine = "} else {";
    }
    
    // Handle for loops
    else if (trimmedLine.startsWith("for ")) {
      const match = trimmedLine.match(/for\s+(\w+)\s+in\s+range\(([^)]+)\):/);
        if (match) {
        const varName = match[1];
        const rangeArgs = match[2].split(",").map(arg => arg.trim());
        if (rangeArgs.length === 1) {
          convertedLine = `for (int ${varName} = 0; ${varName} < ${rangeArgs[0]}; ${varName}++) {`;
        } else if (rangeArgs.length === 2) {
          convertedLine = `for (int ${varName} = ${rangeArgs[0]}; ${varName} < ${rangeArgs[1]}; ${varName}++) {`;
        } else if (rangeArgs.length === 3) {
          const step = rangeArgs[2];
          if (step.startsWith("-")) {
            const endVal = parseInt(rangeArgs[1]);
            const startVal = parseInt(rangeArgs[0]);
            convertedLine = `for (int ${varName} = ${endVal - 1}; ${varName} >= ${startVal}; ${varName} += ${step}) {`;
          } else {
            convertedLine = `for (int ${varName} = ${rangeArgs[0]}; ${varName} < ${rangeArgs[1]}; ${varName} += ${step}) {`;
          }
        }
      }
    }
    
    // Handle while loops
    else if (trimmedLine.startsWith("while ")) {
      let condition = trimmedLine.substring(6).replace(/:$/, "");
      condition = condition
        .replace(/\band\b/g, "&&")
        .replace(/\bor\b/g, "||");
      convertedLine = `while (${condition}) {`;
    }
    
    // Handle print statements
    else if (trimmedLine.startsWith("print(")) {
      const match = trimmedLine.match(/print\((.*)\)/);
      if (match) {
        convertedLine = `System.out.println(${match[1]});`;
      }
    }
    
    // Handle variable assignments
    else if (trimmedLine.match(/^(\w+)\s*=\s*(.+)/)) {
      const match = trimmedLine.match(/^(\w+)\s*=\s*(.+)/);
      if (match) {
        const varName = match[1];
        const value = match[2];
        convertedLine = `Object ${varName} = ${value};`;
      }
    }
    
    // Handle return statements
    else if (trimmedLine.startsWith("return ")) {
      const match = trimmedLine.match(/return\s+(.+)/);
      if (match) {
        convertedLine = `return ${match[1]};`;
      }
    }
    
    // Add the proper indentation
    convertedLines.push("  ".repeat(indentStack.length - 1) + convertedLine);
  }
  
  // Close any remaining indent levels
  while (indentStack.length > 1) {
    indentStack.pop();
    convertedLines.push("  ".repeat(indentStack.length - 1) + "}");
  }
  
  return convertedLines.join("\n");
}

function convertCSharpToJavaScript(sourceCode: string): string {
  const lines = sourceCode.split("\n");
  const convertedLines: string[] = [];
  let indentLevel = 0;
  let inClass = false;
  let inMethod = false;
  let inComment = false;
  let currentClass = "";
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    let convertedLine = line;
    let newIndentLevel = indentLevel;
    
    // Skip empty lines
    if (line === "") {
      convertedLines.push("");
      continue;
    }
    
    // Handle multi-line comments
    if (line.includes("/*")) {
      inComment = true;
    }
    if (line.includes("*/")) {
      inComment = false;
    }
    if (inComment) {
      convertedLines.push(line);
      continue;
    }
    
    // Handle single-line comments
    if (line.startsWith("//")) {
      convertedLines.push(line);
      continue;
    }
    
    // Handle class declarations
    if (line.match(/class\s+(\w+)/)) {
      const match = line.match(/class\s+(\w+)/);
      if (match) {
        currentClass = match[1];
        convertedLine = `class ${currentClass} {`;
        inClass = true;
        newIndentLevel++;
      }
    }
    
    // Handle method declarations
    else if (line.match(/(public|private|protected)?\s*(static)?\s*(\w+)\s+(\w+)\s*\((.*)\)/)) {
      const match = line.match(/(public|private|protected)?\s*(static)?\s*(\w+)\s+(\w+)\s*\((.*)\)/);
      if (match) {
        const returnType = match[3];
        const methodName = match[4];
        const params = match[5];
        inMethod = true;
        
        // Convert parameters to JavaScript style
        const jsParams = params.split(",").map(param => {
          const parts = param.trim().split(" ");
          return parts[parts.length - 1]; // Get the variable name
        }).join(", ");
        
        convertedLine = `function ${methodName}(${jsParams}) {`;
        newIndentLevel++;
      }
    }
    
    // Handle variable declarations
    else if (line.match(/(\w+)\s+(\w+)\s*=\s*(.*);/)) {
      const match = line.match(/(\w+)\s+(\w+)\s*=\s*(.*);/);
      if (match) {
        const varName = match[2];
        const value = match[3];
        convertedLine = `let ${varName} = ${value};`;
      }
    }
    
    // Handle if statements
    else if (line.match(/if\s*\((.*)\)/)) {
      const match = line.match(/if\s*\((.*)\)/);
      if (match) {
        let condition = match[1];
        condition = condition
          .replace(/&&/g, "&&")
          .replace(/\|\|/g, "||");
        convertedLine = `if (${condition}) {`;
        newIndentLevel++;
      }
    }
    
    // Handle else if statements
    else if (line.match(/else\s+if\s*\((.*)\)/)) {
      const match = line.match(/else\s+if\s*\((.*)\)/);
      if (match) {
        let condition = match[1];
        condition = condition
          .replace(/&&/g, "&&")
          .replace(/\|\|/g, "||");
        convertedLine = `} else if (${condition}) {`;
        newIndentLevel++;
      }
    }
    
    // Handle else statements
    else if (line.match(/else\s*{?/)) {
      convertedLine = "} else {";
      newIndentLevel++;
    }
    
    // Handle for loops
    else if (line.match(/for\s*\((.*)\)/)) {
      const match = line.match(/for\s*\(\s*(\w+)\s+(\w+)\s*=\s*([^;]+);\s*\2\s*(<|<=|>|>=)\s*([^;]+);\s*\2(\+\+|\-\-|.=.*)\)/);
      if (match) {
        const varName = match[2];
        const startVal = match[3];
        const endVal = match[5];
        const step = match[6];
        
        if (step === "++") {
          convertedLine = `for (let ${varName} = ${startVal}; ${varName} < ${endVal}; ${varName}++) {`;
        } else if (step === "--") {
          convertedLine = `for (let ${varName} = ${endVal} - 1; ${varName} >= ${startVal}; ${varName}--) {`;
        } else {
          convertedLine = `for (let ${varName} = ${startVal}; ${varName} < ${endVal}; ${varName} += ${step}) {`;
        }
        newIndentLevel++;
      }
    }
    
    // Handle while loops
    else if (line.match(/while\s*\((.*)\)/)) {
      const match = line.match(/while\s*\((.*)\)/);
      if (match) {
        let condition = match[1];
        condition = condition
          .replace(/&&/g, "&&")
          .replace(/\|\|/g, "||");
        convertedLine = `while (${condition}) {`;
        newIndentLevel++;
      }
    }
    
    // Handle Console.WriteLine
    else if (line.match(/Console\.WriteLine\((.*)\);/)) {
      const match = line.match(/Console\.WriteLine\((.*)\);/);
      if (match) {
        convertedLine = `console.log(${match[1]});`;
      }
    }
    
    // Handle return statements
    else if (line.match(/return\s+(.*);/)) {
      const match = line.match(/return\s+(.*);/);
      if (match) {
        convertedLine = `return ${match[1]};`;
      }
    }
    
    // Handle opening braces
    else if (line === "{") {
      convertedLine = "";
      newIndentLevel++;
    }
    
    // Handle closing braces
    else if (line === "}") {
      convertedLine = "";
      newIndentLevel = Math.max(0, newIndentLevel - 1);
      if (newIndentLevel === 0) {
        inClass = false;
        inMethod = false;
      }
    }
    
    // Add proper indentation
    if (convertedLine !== "") {
      convertedLines.push("  ".repeat(indentLevel) + convertedLine);
    }
    indentLevel = newIndentLevel;
  }
  
  return convertedLines.join("\n");
}

function convertJavaScriptToCSharp(sourceCode: string): string {
  const lines = sourceCode.split("\n");
  const convertedLines: string[] = [];
  let indentStack: number[] = [0];
  let currentIndent = 0;
  let inClass = false;
  let inMethod = false;
  let currentClass = "";
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let initialSpaces = line.search(/\S|$/);
    let trimmedLine = line.trim();
    let convertedLine = trimmedLine;
    
    if (trimmedLine === "") {
      convertedLines.push("");
      continue;
    }
    
    // Handle comments
    if (trimmedLine.startsWith("//")) {
      convertedLines.push("  ".repeat(indentStack.length - 1) + "// " + trimmedLine.substring(2));
      continue;
    }
    
    // Check for decrease in indentation
    if (initialSpaces < currentIndent) {
      while (indentStack.length > 1 && indentStack[indentStack.length - 1] > initialSpaces) {
        indentStack.pop();
        convertedLines.push("  ".repeat(indentStack.length - 1) + "}");
      }
    }
    
    currentIndent = initialSpaces;
    
    // Check for new indent level
    if (initialSpaces > indentStack[indentStack.length - 1]) {
      indentStack.push(initialSpaces);
    }
    
    // Handle class definitions
    if (trimmedLine.startsWith("class ")) {
      const match = trimmedLine.match(/class\s+(\w+)\s*{/);
      if (match) {
        currentClass = match[1];
        convertedLine = `public class ${currentClass}\n{`;
        inClass = true;
      }
    }
    
    // Handle method definitions
    else if (trimmedLine.startsWith("function ")) {
      const match = trimmedLine.match(/function\s+(\w+)\s*\((.*?)\)\s*{/);
      if (match) {
        const methodName = match[1];
        const params = match[2];
        inMethod = true;
        
        // Convert parameters to C# style
        const csharpParams = params.split(",").map(param => {
          const paramName = param.trim();
          return `object ${paramName}`;
        }).join(", ");
        
        convertedLine = `public void ${methodName}(${csharpParams})\n{`;
      }
    }
    
    // Handle if statements
    else if (trimmedLine.startsWith("if ")) {
      let condition = trimmedLine.substring(3).replace(/\s*{/, "");
      condition = condition
        .replace(/&&/g, "&&")
        .replace(/\|\|/g, "||");
      convertedLine = `if (${condition})\n{`;
    }
    
    // Handle else if statements
    else if (trimmedLine.startsWith("} else if ")) {
      let condition = trimmedLine.substring(10).replace(/\s*{/, "");
      condition = condition
        .replace(/&&/g, "&&")
        .replace(/\|\|/g, "||");
      convertedLine = `}\nelse if (${condition})\n{`;
    }
    
    // Handle else statements
    else if (trimmedLine === "} else {") {
      convertedLine = "}\nelse\n{";
    }
    
    // Handle for loops
    else if (trimmedLine.startsWith("for ")) {
      const match = trimmedLine.match(/for\s*\(\s*let\s+(\w+)\s*=\s*([^;]+);\s*\1\s*(<|<=|>|>=)\s*([^;]+);\s*\1(\+\+|\-\-|.=.*)\)\s*{/);
      if (match) {
        const varName = match[1];
        const startVal = match[2];
        const operator = match[3];
        const endVal = match[4];
        const step = match[5];
        
        if (step === "++") {
          convertedLine = `for (int ${varName} = ${startVal}; ${varName} < ${endVal}; ${varName}++)\n{`;
        } else if (step === "--") {
          convertedLine = `for (int ${varName} = ${endVal} - 1; ${varName} >= ${startVal}; ${varName}--)\n{`;
        } else {
          convertedLine = `for (int ${varName} = ${startVal}; ${varName} < ${endVal}; ${varName} += ${step})\n{`;
        }
      }
    }
    
    // Handle while loops
    else if (trimmedLine.startsWith("while ")) {
      let condition = trimmedLine.substring(6).replace(/\s*{/, "");
      condition = condition
        .replace(/&&/g, "&&")
        .replace(/\|\|/g, "||");
      convertedLine = `while (${condition})\n{`;
    }
    
    // Handle console.log
    else if (trimmedLine.startsWith("console.log(")) {
      const match = trimmedLine.match(/console\.log\((.*)\);/);
      if (match) {
        convertedLine = `Console.WriteLine(${match[1]});`;
      }
    }
    
    // Handle variable assignments
    else if (trimmedLine.match(/^let\s+(\w+)\s*=\s*(.+);/)) {
      const match = trimmedLine.match(/^let\s+(\w+)\s*=\s*(.+);/);
      if (match) {
        const varName = match[1];
        const value = match[2];
        convertedLine = `object ${varName} = ${value};`;
      }
    }
    
    // Handle return statements
    else if (trimmedLine.startsWith("return ")) {
      const match = trimmedLine.match(/return\s+(.+);/);
      if (match) {
        convertedLine = `return ${match[1]};`;
      }
    }
    
    // Add the proper indentation
    convertedLines.push("  ".repeat(indentStack.length - 1) + convertedLine);
  }
  
  // Close any remaining indent levels
  while (indentStack.length > 1) {
    indentStack.pop();
    convertedLines.push("  ".repeat(indentStack.length - 1) + "}");
  }
  
  return convertedLines.join("\n");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for code conversion
  app.post("/api/convert", async (req: Request, res: Response) => {
    try {
      const { sourceCode, sourceLanguage, targetLanguage } = convertCodeSchema.parse(req.body);
      let convertedCode = "";
      
      // Handle different language conversions
      if (sourceLanguage === "javascript" && targetLanguage === "python") {
        convertedCode = convertJavaScriptToPython(sourceCode);
      } else if (sourceLanguage === "python" && targetLanguage === "javascript") {
        convertedCode = convertPythonToJavaScript(sourceCode);
      } else if (sourceLanguage === "typescript" && targetLanguage === "javascript") {
        convertedCode = convertTypeScriptToJavaScript(sourceCode);
      } else if (sourceLanguage === "typescript" && targetLanguage === "python") {
        const jsCode = convertTypeScriptToJavaScript(sourceCode);
        convertedCode = convertJavaScriptToPython(jsCode);
      } else if (sourceLanguage === "java" && targetLanguage === "python") {
        convertedCode = convertJavaToPython(sourceCode);
      } else if (sourceLanguage === "python" && targetLanguage === "java") {
        convertedCode = convertPythonToJava(sourceCode);
      } else if (sourceLanguage === "csharp" && targetLanguage === "javascript") {
        convertedCode = convertCSharpToJavaScript(sourceCode);
      } else if (sourceLanguage === "javascript" && targetLanguage === "csharp") {
        convertedCode = convertJavaScriptToCSharp(sourceCode);
      } else {
        // For unsupported language pairs, return a comment with the original code
        convertedCode = `// Conversion from ${sourceLanguage} to ${targetLanguage} is not supported yet\n${sourceCode}`;
      }
      
      const result: ConvertCodeResponse = {
        targetCode: convertedCode,
        explanation: {
          stepByStep: [
            {
              title: "Code Conversion",
              sourceCode: sourceCode,
              targetCode: convertedCode,
              explanation: `Converted ${sourceLanguage} code to ${targetLanguage} using local conversion logic.`
            }
          ],
          highLevel: `Code was converted from ${sourceLanguage} to ${targetLanguage} using pattern matching and syntax transformation.`,
          languageDifferences: `Key differences between ${sourceLanguage} and ${targetLanguage} were handled in the conversion.`
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error in code conversion:", error);
      res.status(500).json({ 
        message: "Failed to convert code", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  return createServer(app);
}
