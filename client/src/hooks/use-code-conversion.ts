import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface ConversionResult {
  targetCode: string;
  explanation: {
    stepByStep: Array<{
      title: string;
      sourceCode: string;
      targetCode: string;
      explanation: string;
    }>;
    highLevel: string;
    languageDifferences: string;
  };
}

interface ConversionParams {
  sourceCode: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export function useCodeConversion() {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const convertJavaToPython = (sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let pythonCode = '';
    let indentLevel = 0;
    let inMainMethod = false;
    let inClass = false;

    for (let line of lines) {
      let processedLine = line;
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        pythonCode += '\n';
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith('//')) {
        processedLine = '#' + line.substring(line.indexOf('//') + 2);
      }
      // Remove class declaration
      else if (trimmedLine.startsWith('public class') || trimmedLine.startsWith('class')) {
        inClass = true;
        continue;
      }
      // Handle main method
      else if (trimmedLine.includes('public static void main')) {
        inMainMethod = true;
        indentLevel = 0;
        continue;
      }
      // Handle method declaration
      else if (trimmedLine.includes('public static') || trimmedLine.includes('private static')) {
        processedLine = line.replace(/(public|private)\s+static\s+\w+\s+(\w+)\s*\((.*?)\)\s*{/, 'def $2($3):');
        indentLevel++;
      }
      // Handle System.out.println
      else if (trimmedLine.includes('System.out.println')) {
        processedLine = line.replace(/System\.out\.println\((.*)\);/, 'print($1)');
      }
      // Handle variable declarations
      else if (trimmedLine.match(/^\s*(int|String|double|float|boolean)\s+\w+\s*=.*/)) {
        processedLine = line.replace(/^\s*(int|String|double|float|boolean)\s+(\w+)\s*=\s*(.+?);/, '$2 = $3');
      }
      // Remove semicolons
      else if (trimmedLine.endsWith(';')) {
        processedLine = line.replace(/;$/, '');
      }
      // Handle closing braces
      else if (trimmedLine === '}') {
        if (inClass) {
          inClass = false;
        }
        indentLevel = Math.max(0, indentLevel - 1);
        continue;
      }

      // Skip class-level closing brace
      if (inClass && trimmedLine === '}') {
        continue;
      }

      // Add proper indentation
      if (processedLine.trim().length > 0) {
        processedLine = '    '.repeat(indentLevel) + processedLine.trim();
      }

      pythonCode += processedLine + '\n';
    }

    return pythonCode.trim();
  };

  const convertPythonToJava = (sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let javaCode = '';
    let className = 'Main';
    let indentLevel = 1; // Start with class-level indentation

    // Add class declaration
    javaCode += `public class ${className} {\n`;

    for (let line of lines) {
      let processedLine = line;
      const trimmedLine = line.trim();
      const leadingSpaces = line.search(/\S/);
      
      // Skip empty lines
      if (!trimmedLine) {
        javaCode += '\n';
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith('#')) {
        processedLine = '//' + line.substring(line.indexOf('#') + 1);
      }
      // Handle function definitions
      else if (trimmedLine.startsWith('def ')) {
        // Convert main function
        if (trimmedLine.startsWith('def main')) {
          processedLine = line.replace(/def\s+main\s*\((.*?)\):/, 
            'public static void main(String[] args) {');
        } else {
          processedLine = line.replace(/def\s+(\w+)\s*\((.*?)\):/, 
            'public static $2 $1($2) {');
        }
        indentLevel++;
      }
      // Handle print statements
      else if (trimmedLine.startsWith('print(')) {
        processedLine = line.replace(/print\((.*)\)/, 'System.out.println($1);');
      }
      // Add semicolons to statements
      else if (!trimmedLine.endsWith(':') && !trimmedLine.startsWith('#')) {
        processedLine = line + ';';
      }

      // Add proper indentation
      if (processedLine.trim().length > 0) {
        processedLine = '    '.repeat(indentLevel) + processedLine.trim();
      }

      javaCode += processedLine + '\n';

      // Handle indentation changes
      if (trimmedLine.endsWith(':')) {
        indentLevel++;
      } else if (leadingSpaces < (indentLevel - 1) * 4) {
        indentLevel = Math.max(1, Math.floor(leadingSpaces / 4) + 1);
        javaCode += '    '.repeat(indentLevel - 1) + '}\n';
      }
    }

    // Close the class
    javaCode += '}\n';

    return javaCode;
  };

  const convertJavaScriptToPython = (sourceCode: string): string => {
    console.log('Converting JavaScript to Python:', sourceCode);
    
    // Split the code into lines for better processing
    const lines = sourceCode.split('\n');
    let pythonCode = '';
    let indentLevel = 0;

    for (let line of lines) {
      let processedLine = line;
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        pythonCode += '\n';
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith('//')) {
        processedLine = '#' + line.substring(line.indexOf('//') + 2);
      }
      // Function declaration
      else if (trimmedLine.startsWith('function')) {
        processedLine = line.replace(/function\s+(\w+)\s*\((.*?)\)\s*{/, 'def $1($2):');
        indentLevel++;
      }
      // Variable declarations
      else if (trimmedLine.startsWith('const') || trimmedLine.startsWith('let') || trimmedLine.startsWith('var')) {
        processedLine = line.replace(/(const|let|var)\s+(\w+)\s*=\s*(.+?);?$/, '$2 = $3');
      }
      // console.log
      else if (trimmedLine.includes('console.log')) {
        processedLine = line.replace(/console\.log\((.*)\);?$/, 'print($1)');
      }
      // Closing brace - decrease indent
      else if (trimmedLine === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
        continue; // Skip the line entirely
      }
      // Remove semicolons
      else {
        processedLine = line.replace(/;$/, '');
      }

      // Add proper indentation
      if (processedLine.trim().length > 0) {
        processedLine = '    '.repeat(indentLevel) + processedLine.trim();
      }

      pythonCode += processedLine + '\n';
    }

    const result = pythonCode.trim();
    console.log('Conversion result:', result);
    return result;
  };

  const convertPythonToJavaScript = (sourceCode: string): string => {
    // Basic Python to JavaScript conversion
    let jsCode = sourceCode
      // Convert function declaration
      .replace(/def\s+(\w+)\s*\((.*?)\):/g, 'function $1($2) {')
      // Convert print statements
      .replace(/print\((.*?)\)/g, 'console.log($1);')
      // Convert self. to this.
      .replace(/self\./g, 'this.')
      // Convert lambda functions
      .replace(/lambda\s+(.*?):/g, '($1) =>')
      // Add semicolons where needed
      .split('\n')
      .map(line => line.trim())
      .map(line => line.endsWith('{') || line.endsWith(':') || line.endsWith('}') ? line : line + ';')
      .join('\n');

    return jsCode;
  };

  const convertJavaScriptToJava = (sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let javaCode = '';
    let className = 'Main';
    let indentLevel = 1; // Start with class-level indentation

    // Add class declaration
    javaCode += `public class ${className} {\n`;

    for (let line of lines) {
      let processedLine = line;
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        javaCode += '\n';
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith('//')) {
        processedLine = line;
      }
      // Function declaration
      else if (trimmedLine.startsWith('function')) {
        processedLine = line.replace(
          /function\s+(\w+)\s*\((.*?)\)\s*{/, 
          (_, name, params) => {
            const javaParams = params
              .split(',')
              .map((p: string) => `Object ${p.trim()}`)
              .join(', ');
            return `    public static Object ${name}(${javaParams}) {`;
          }
        );
        indentLevel++;
      }
      // Variable declarations
      else if (trimmedLine.startsWith('const') || trimmedLine.startsWith('let') || trimmedLine.startsWith('var')) {
        processedLine = line.replace(
          /(const|let|var)\s+(\w+)\s*=\s*(.+?);?$/,
          'Object $2 = $3;'
        );
      }
      // console.log
      else if (trimmedLine.includes('console.log')) {
        processedLine = line.replace(
          /console\.log\((.*)\);?$/,
          'System.out.println($1);'
        );
      }
      // Add semicolons if missing
      else if (!trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}')) {
        processedLine = line + ';';
      }

      // Add proper indentation
      if (processedLine.trim().length > 0) {
        processedLine = '    '.repeat(indentLevel) + processedLine.trim();
      }

      javaCode += processedLine + '\n';

      // Handle closing braces
      if (trimmedLine === '}') {
        indentLevel = Math.max(1, indentLevel - 1);
      }
    }

    // Add main method if not present
    if (!sourceCode.includes('main')) {
      javaCode += `
    public static void main(String[] args) {
        // Add your main method implementation here
    }\n`;
    }

    // Close the class
    javaCode += '}\n';

    return javaCode;
  };

  const convertJavaToJavaScript = (sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let jsCode = '';
    let skipNextLine = false;

    for (let line of lines) {
      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }

      let processedLine = line;
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        jsCode += '\n';
        continue;
      }

      // Skip class declaration and closing brace
      if (trimmedLine.startsWith('public class') || trimmedLine.startsWith('class')) {
        continue;
      }

      // Handle method declaration
      if (trimmedLine.includes('public static') || trimmedLine.includes('private static')) {
        // Skip main method
        if (trimmedLine.includes('main(String[] args)')) {
          skipNextLine = true;
          continue;
        }
        processedLine = line.replace(
          /(public|private)\s+static\s+\w+\s+(\w+)\s*\((.*?)\)\s*{/,
          (_, access, name, params) => {
            const jsParams = params
              .split(',')
              .map((p: string) => p.trim().split(' ')[1]) // Remove type declarations
              .join(', ');
            return `function ${name}(${jsParams}) {`;
          }
        );
      }
      // Handle System.out.println
      else if (trimmedLine.includes('System.out.println')) {
        processedLine = line.replace(
          /System\.out\.println\((.*)\);/,
          'console.log($1);'
        );
      }
      // Handle variable declarations with types
      else if (trimmedLine.match(/^\s*(int|String|double|float|boolean|Object)\s+\w+\s*=.*/)) {
        processedLine = line.replace(
          /^\s*(int|String|double|float|boolean|Object)\s+(\w+)\s*=\s*(.+?);/,
          'let $2 = $3;'
        );
      }
      // Skip class closing brace
      else if (trimmedLine === '}' && !jsCode.trim().endsWith('}')) {
        continue;
      }

      // Remove indentation and add back based on content
      processedLine = processedLine.trim();
      
      // Add the processed line if it's not empty
      if (processedLine) {
        jsCode += processedLine + '\n';
      }
    }

    return jsCode.trim();
  };

  const convertPhpToPython = (sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let pythonCode = '';
    let indentLevel = 0;
    let inPhpTags = false;
    let inClass = false;
    let inFunction = false;

    for (let line of lines) {
      let processedLine = line;
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        pythonCode += '\n';
        continue;
      }

      // Handle PHP tags
      if (trimmedLine.startsWith('<?php')) {
        inPhpTags = true;
        continue;
      }
      if (trimmedLine.startsWith('?>')) {
        inPhpTags = false;
        continue;
      }

      // Skip lines outside PHP tags
      if (!inPhpTags && !trimmedLine.startsWith('<?php')) {
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith('//')) {
        processedLine = '#' + line.substring(line.indexOf('//') + 2);
      } else if (trimmedLine.startsWith('/*')) {
        processedLine = '"""' + line.substring(line.indexOf('/*') + 2);
      } else if (trimmedLine.startsWith('*/')) {
        processedLine = '"""';
      }
      // Handle class declaration
      else if (trimmedLine.startsWith('class ')) {
        inClass = true;
        processedLine = line.replace(/class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/, 'class $1($2):');
        processedLine = processedLine.replace(/\(\):/g, ':');  // Remove empty parentheses
      }
      // Handle function declaration
      else if (trimmedLine.startsWith('function ') || trimmedLine.match(/^\s*public\s+function/)) {
        inFunction = true;
        processedLine = line.replace(/(?:public\s+)?function\s+(\w+)\s*\((.*?)\)\s*{/, 'def $1($2):');
        // Remove type hints and add proper parameter handling
        processedLine = processedLine.replace(/:\s*\w+(\s*[,)])/g, '$1');
        if (inClass && !processedLine.includes('(self')) {
          processedLine = processedLine.replace(/\(/, '(self, ');
        }
      }
      // Handle variable declarations
      else if (trimmedLine.includes('$')) {
        // Handle static method calls
        processedLine = line.replace(/(\$\w+)::/g, '$1.');
        processedLine = line.replace(/(\w+)::/g, '$1.');
        // Handle regular variables
        processedLine = line.replace(/\$(\w+)/g, '$1');
        // Remove type declarations
        processedLine = processedLine.replace(/^\s*(int|string|float|bool|array)\s+/, '');
      }
      // Handle array declarations and arrow syntax
      else if (trimmedLine.includes('=>')) {
        // Convert PHP associative arrays to Python dictionaries
        processedLine = line.replace(/=>/g, ':');
        processedLine = processedLine.replace(/array\((.*?)\)/g, '{$1}');
      }
      // Handle echo statements
      else if (trimmedLine.startsWith('echo')) {
        processedLine = line.replace(/echo\s+(.+?);/, 'print($1)');
      }
      // Handle array declarations
      else if (trimmedLine.includes('array(')) {
        processedLine = line.replace(/array\((.*?)\)/g, '{$1}');
      }
      // Handle array access
      else if (trimmedLine.includes('[') && trimmedLine.includes(']')) {
        processedLine = line.replace(/\$(\w+)\s*\[\s*["'](\w+)["']\s*\]/g, '$1["$2"]');
      }
      // Handle string concatenation
      else if (trimmedLine.includes('.')) {
        processedLine = line.replace(/\s+\.\s+/g, ' + ');
      }
      // Handle method chaining
      else if (trimmedLine.includes('->')) {
        processedLine = line.replace(/->/g, '.');
      }
      // Handle closing braces
      else if (trimmedLine === '}') {
        if (inClass) {
          inClass = false;
        }
        if (inFunction) {
          inFunction = false;
        }
        indentLevel = Math.max(0, indentLevel - 1);
        continue;
      }

      // Remove semicolons
      if (processedLine.endsWith(';')) {
        processedLine = processedLine.slice(0, -1);
      }

      // Add proper indentation
      if (processedLine.trim().length > 0) {
        processedLine = '    '.repeat(indentLevel) + processedLine.trim();
      }

      pythonCode += processedLine + '\n';

      // Adjust indent level
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith(':')) {
        indentLevel++;
      }
    }

    return pythonCode.trim();
  };

  const convertPythonToPhp = (sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let phpCode = "<?php\n\n";
    let indentLevel = 0;
    let inClass = false;
    let inFunction = false;
    let currentClass = '';

    for (let line of lines) {
      let processedLine = line;
      const trimmedLine = line.trim();
      const leadingSpaces = line.search(/\S/);

      // Skip empty lines
      if (!trimmedLine) {
        phpCode += '\n';
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith('#')) {
        processedLine = '//' + line.substring(line.indexOf('#') + 1);
      }
      // Handle multiline comments
      else if (trimmedLine.startsWith('"""')) {
        processedLine = '/*' + line.substring(3);
        if (trimmedLine.endsWith('"""')) {
          processedLine = processedLine.slice(0, -3) + '*/';
        }
      }
      // Handle class declaration
      else if (trimmedLine.startsWith('class ')) {
        inClass = true;
        currentClass = trimmedLine.split(' ')[1].split('(')[0];
        // Handle inheritance
        const match = trimmedLine.match(/class\s+(\w+)\s*\((\w+)\):/);
        if (match) {
          processedLine = `class ${match[1]} extends ${match[2]} {`;
        } else {
          processedLine = line.replace(/class\s+(\w+):/, 'class $1 {');
        }
      }
      // Handle function/method declaration
      else if (trimmedLine.startsWith('def ')) {
        inFunction = true;
        if (inClass) {
          // It's a method
          if (trimmedLine.includes('__init__')) {
            processedLine = line.replace(/def\s+__init__\s*\(self,?\s*(.*?)\):/, 'public function __construct($1) {');
          } else {
            processedLine = line.replace(/def\s+(\w+)\s*\(self,?\s*(.*?)\):/, 'public function $1($2) {');
          }
        } else {
          // It's a function
          processedLine = line.replace(/def\s+(\w+)\s*\((.*?)\):/, 'function $1($2) {');
        }
      }
      // Handle print statements
      else if (trimmedLine.startsWith('print(')) {
        processedLine = line.replace(/print\((.*)\)/, 'echo $1;');
      }
      // Handle dictionary literals
      else if (trimmedLine.includes('{') && trimmedLine.includes(':')) {
        processedLine = line.replace(/{\s*(.*?)\s*}/g, (match: string, content: string) => {
          // Convert Python dict syntax to PHP array syntax
          const pairs = content.split(',').map((pair: string) => {
            const [key, value] = pair.split(':').map((s: string) => s.trim());
            return `${key} => ${value}`;
          });
          return `array(${pairs.join(', ')})`;
        });
      }
      // Handle variable declarations
      else if (trimmedLine.match(/^[a-zA-Z_]\w*\s*=/)) {
        // Handle static method calls
        if (trimmedLine.includes('.')) {
          processedLine = line.replace(/(\w+)\.(\w+)/g, '$1::$2');
        }
        processedLine = line.replace(/(\w+)\s*=/, '$$1 =');
        // Add type hints where possible
        if (trimmedLine.includes('[]')) {
          processedLine = 'array ' + processedLine;
        } else if (trimmedLine.match(/=\s*\d+/)) {
          processedLine = 'int ' + processedLine;
        } else if (trimmedLine.match(/=\s*["'].*?["']/)) {
          processedLine = 'string ' + processedLine;
        } else if (trimmedLine.match(/=\s*True|False/)) {
          processedLine = 'bool ' + processedLine;
        }
      }
      // Handle method chaining
      else if (trimmedLine.includes('.')) {
        processedLine = line.replace(/\./g, '->');
      }
      // Handle array access
      else if (trimmedLine.includes('[') && trimmedLine.includes(']')) {
        processedLine = line.replace(/(\w+)\s*\[\s*["'](\w+)["']\s*\]/g, '$$1["$2"]');
      }

      // Handle indentation changes
      if (leadingSpaces < indentLevel * 4) {
        const dedentCount = Math.floor((indentLevel * 4 - leadingSpaces) / 4);
        for (let i = 0; i < dedentCount; i++) {
          phpCode += '    '.repeat(Math.max(0, indentLevel - i - 1)) + '}\n';
        }
        indentLevel = Math.max(0, indentLevel - dedentCount);
      }

      // Add proper indentation and semicolons
      if (processedLine.trim().length > 0) {
        processedLine = '    '.repeat(indentLevel) + processedLine.trim();
        if (!processedLine.trim().endsWith('{') && !processedLine.trim().endsWith('}')) {
          processedLine += ';';
        }
      }

      phpCode += processedLine + '\n';

      // Adjust indent level
      if (trimmedLine.endsWith(':')) {
        indentLevel++;
      }
    }

    // Close any remaining blocks
    while (indentLevel > 0) {
      indentLevel--;
      phpCode += '    '.repeat(indentLevel) + '}\n';
    }

    phpCode += '?>';
    return phpCode;
  };

  const convertTypeScriptToPython = (sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let pythonCode = '';
    let indentLevel = 0;
    let inInterface = false;
    let inClass = false;

    for (let line of lines) {
      let processedLine = line;
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        pythonCode += '\n';
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith('//')) {
        processedLine = '#' + line.substring(line.indexOf('//') + 2);
      } else if (trimmedLine.startsWith('/*')) {
        processedLine = '"""' + line.substring(line.indexOf('/*') + 2);
      } else if (trimmedLine.startsWith('*/')) {
        processedLine = '"""';
      }
      // Skip interface declarations
      else if (trimmedLine.startsWith('interface ')) {
        inInterface = true;
        continue;
      }
      // Skip type declarations
      else if (trimmedLine.startsWith('type ')) {
        continue;
      }
      // Handle class declaration
      else if (trimmedLine.startsWith('class ')) {
        inClass = true;
        // Convert class with type parameters to simple class
        processedLine = line.replace(/class\s+(\w+)\s*<.*?>\s*{/, 'class $1:');
        processedLine = processedLine.replace(/class\s+(\w+)\s*{/, 'class $1:');
      }
      // Handle constructor
      else if (trimmedLine.startsWith('constructor')) {
        processedLine = line.replace(/constructor\s*\((.*?)\)/, '__init__(self, $1)');
        // Remove type annotations from parameters
        processedLine = processedLine.replace(/:\s*\w+(\s*[,)])/g, '$1');
        processedLine = processedLine.replace(/{/, ':');
      }
      // Handle method declaration
      else if (trimmedLine.match(/^\s*(public|private|protected)?\s*\w+\s*\(/)) {
        // Remove access modifiers and return type
        processedLine = line.replace(/(public|private|protected)\s+/, '');
        processedLine = processedLine.replace(/:\s*\w+(\s*[,)])/g, '$1');
        processedLine = processedLine.replace(/:\s*\w+\s*{/, ':');
        // Add self parameter if in class
        if (inClass && !processedLine.includes('(self')) {
          processedLine = processedLine.replace(/\(/, '(self, ');
        }
      }
      // Handle variable declarations
      else if (trimmedLine.match(/^\s*(let|const|var)\s+\w+/)) {
        processedLine = line.replace(/(let|const|var)\s+(\w+)\s*:\s*\w+\s*=/, '$2 =');
        processedLine = processedLine.replace(/(let|const|var)\s+(\w+)\s*=/, '$2 =');
      }
      // Remove type assertions
      else if (trimmedLine.includes(' as ')) {
        processedLine = line.replace(/\s+as\s+\w+/, '');
      }
      // Handle closing braces
      else if (trimmedLine === '}') {
        if (inInterface) {
          inInterface = false;
          continue;
        }
        if (inClass) {
          inClass = false;
        }
        indentLevel = Math.max(0, indentLevel - 1);
        continue;
      }

      // Remove semicolons
      if (processedLine.endsWith(';')) {
        processedLine = processedLine.slice(0, -1);
      }

      // Add proper indentation
      if (processedLine.trim().length > 0) {
        processedLine = '    '.repeat(indentLevel) + processedLine.trim();
      }

      pythonCode += processedLine + '\n';

      // Adjust indent level
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith(':')) {
        indentLevel++;
      }
    }

    return pythonCode.trim();
  };

  const convertPythonToTypeScript = (sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let tsCode = '';
    let indentLevel = 0;
    let currentClass = '';
    let inFunction = false;

    for (let line of lines) {
      let processedLine = line;
      const trimmedLine = line.trim();
      const leadingSpaces = line.search(/\S/);

      // Skip empty lines
      if (!trimmedLine) {
        tsCode += '\n';
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith('#')) {
        processedLine = '//' + line.substring(line.indexOf('#') + 1);
      }
      // Handle multiline string/comments
      else if (trimmedLine.startsWith('"""')) {
        processedLine = '/*' + line.substring(3);
        if (trimmedLine.endsWith('"""')) {
          processedLine = processedLine.slice(0, -3) + '*/';
        }
      }
      // Handle class declaration
      else if (trimmedLine.startsWith('class ')) {
        currentClass = trimmedLine.split(' ')[1].split('(')[0];
        processedLine = line.replace(/class\s+(\w+)(\s*\(.*?\))?:/, 'class $1 {');
      }
      // Handle function/method declaration
      else if (trimmedLine.startsWith('def ')) {
        inFunction = true;
        if (currentClass) {
          // It's a method
          if (trimmedLine.includes('__init__')) {
            processedLine = line.replace(/def\s+__init__\s*\(self,?\s*(.*?)\):/, 'constructor($1) {');
          } else {
            processedLine = line.replace(/def\s+(\w+)\s*\(self,?\s*(.*?)\):/, 'public $1($2) {');
          }
        } else {
          // It's a function
          processedLine = line.replace(/def\s+(\w+)\s*\((.*?)\):/, 'function $1($2) {');
        }
      }
      // Handle print statements
      else if (trimmedLine.startsWith('print(')) {
        processedLine = line.replace(/print\((.*)\)/, 'console.log($1);');
      }
      // Add type annotations to variables where possible
      else if (trimmedLine.match(/^[a-zA-Z_]\w*\s*=/)) {
        processedLine = line.replace(/(\w+)\s*=\s*(\d+)/, 'let $1: number = $2;');
        processedLine = processedLine.replace(/(\w+)\s*=\s*["'].*?["']/, 'let $1: string = $2;');
        processedLine = processedLine.replace(/(\w+)\s*=\s*True|False/, 'let $1: boolean = $2;');
        processedLine = processedLine.replace(/(\w+)\s*=\s*\[.*?\]/, 'let $1: any[] = $2;');
      }

      // Handle indentation changes
      if (leadingSpaces < indentLevel * 4) {
        const dedentCount = Math.floor((indentLevel * 4 - leadingSpaces) / 4);
        for (let i = 0; i < dedentCount; i++) {
          tsCode += '    '.repeat(Math.max(0, indentLevel - i - 1)) + '}\n';
        }
        indentLevel = Math.max(0, indentLevel - dedentCount);
      }

      // Add proper indentation and semicolons
      if (processedLine.trim().length > 0) {
        processedLine = '    '.repeat(indentLevel) + processedLine.trim();
        if (!processedLine.trim().endsWith('{') && !processedLine.trim().endsWith('}')) {
          processedLine += ';';
        }
      }

      tsCode += processedLine + '\n';

      // Adjust indent level
      if (trimmedLine.endsWith(':')) {
        indentLevel++;
      }
    }

    // Close any remaining blocks
    while (indentLevel > 0) {
      indentLevel--;
      tsCode += '    '.repeat(indentLevel) + '}\n';
    }

    return tsCode.trim();
  };

  const convert = async (params: ConversionParams): Promise<ConversionResult> => {
    console.log('Convert function called with params:', params);
    setIsConverting(true);
    setConversionProgress(0);
    setError(null);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Convert code based on languages
      let convertedCode = '';
      if (params.sourceLanguage === 'javascript' && params.targetLanguage === 'python') {
        convertedCode = convertJavaScriptToPython(params.sourceCode);
      } else if (params.sourceLanguage === 'python' && params.targetLanguage === 'javascript') {
        convertedCode = convertPythonToJavaScript(params.sourceCode);
      } else if (params.sourceLanguage === 'java' && params.targetLanguage === 'python') {
        convertedCode = convertJavaToPython(params.sourceCode);
      } else if (params.sourceLanguage === 'python' && params.targetLanguage === 'java') {
        convertedCode = convertPythonToJava(params.sourceCode);
      } else if (params.sourceLanguage === 'javascript' && params.targetLanguage === 'java') {
        convertedCode = convertJavaScriptToJava(params.sourceCode);
      } else if (params.sourceLanguage === 'java' && params.targetLanguage === 'javascript') {
        convertedCode = convertJavaToJavaScript(params.sourceCode);
      } else if (params.sourceLanguage === 'php' && params.targetLanguage === 'python') {
        convertedCode = convertPhpToPython(params.sourceCode);
      } else if (params.sourceLanguage === 'python' && params.targetLanguage === 'php') {
        convertedCode = convertPythonToPhp(params.sourceCode);
      } else if (params.sourceLanguage === 'typescript' && params.targetLanguage === 'python') {
        convertedCode = convertTypeScriptToPython(params.sourceCode);
      } else if (params.sourceLanguage === 'python' && params.targetLanguage === 'typescript') {
        convertedCode = convertPythonToTypeScript(params.sourceCode);
      } else {
        convertedCode = `# Conversion from ${params.sourceLanguage} to ${params.targetLanguage} is not supported yet\n${params.sourceCode}`;
      }

      // Complete progress
      clearInterval(progressInterval);
      setConversionProgress(100);

      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 200));

      const result: ConversionResult = {
        targetCode: convertedCode,
        explanation: {
          stepByStep: [
            {
              title: "Code Conversion",
              sourceCode: params.sourceCode,
              targetCode: convertedCode,
              explanation: `Converted ${params.sourceLanguage} code to ${params.targetLanguage} using local conversion logic.`
            }
          ],
          highLevel: `Code was converted from ${params.sourceLanguage} to ${params.targetLanguage} using pattern matching and syntax transformation.`,
          languageDifferences: `Key differences between ${params.sourceLanguage} and ${params.targetLanguage} were handled in the conversion.`
        }
      };

      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    convert,
    isConverting,
    conversionProgress,
    error
  };
}

export const convertTypeScriptToPython = (sourceCode: string): string => {
  const lines = sourceCode.split('\n');
  let pythonCode = '';
  let indentLevel = 0;
  let inInterface = false;
  let inClass = false;

  for (let line of lines) {
    let processedLine = line;
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      pythonCode += '\n';
      continue;
    }

    // Handle comments
    if (trimmedLine.startsWith('//')) {
      processedLine = '#' + line.substring(line.indexOf('//') + 2);
    } else if (trimmedLine.startsWith('/*')) {
      processedLine = '"""' + line.substring(line.indexOf('/*') + 2);
    } else if (trimmedLine.startsWith('*/')) {
      processedLine = '"""';
    }
    // Skip interface declarations
    else if (trimmedLine.startsWith('interface ')) {
      inInterface = true;
      continue;
    }
    // Skip type declarations
    else if (trimmedLine.startsWith('type ')) {
      continue;
    }
    // Handle class declaration
    else if (trimmedLine.startsWith('class ')) {
      inClass = true;
      // Convert class with type parameters to simple class
      processedLine = line.replace(/class\s+(\w+)\s*<.*?>\s*{/, 'class $1:');
      processedLine = processedLine.replace(/class\s+(\w+)\s*{/, 'class $1:');
    }
    // Handle constructor
    else if (trimmedLine.startsWith('constructor')) {
      processedLine = line.replace(/constructor\s*\((.*?)\)/, '__init__(self, $1)');
      // Remove type annotations from parameters
      processedLine = processedLine.replace(/:\s*\w+(\s*[,)])/g, '$1');
      processedLine = processedLine.replace(/{/, ':');
    }
    // Handle method declaration
    else if (trimmedLine.match(/^\s*(public|private|protected)?\s*\w+\s*\(/)) {
      // Remove access modifiers and return type
      processedLine = line.replace(/(public|private|protected)\s+/, '');
      processedLine = processedLine.replace(/:\s*\w+(\s*[,)])/g, '$1');
      processedLine = processedLine.replace(/:\s*\w+\s*{/, ':');
      // Add self parameter if in class
      if (inClass && !processedLine.includes('(self')) {
        processedLine = processedLine.replace(/\(/, '(self, ');
      }
    }
    // Handle variable declarations
    else if (trimmedLine.match(/^\s*(let|const|var)\s+\w+/)) {
      processedLine = line.replace(/(let|const|var)\s+(\w+)\s*:\s*\w+\s*=/, '$2 =');
      processedLine = processedLine.replace(/(let|const|var)\s+(\w+)\s*=/, '$2 =');
    }
    // Remove type assertions
    else if (trimmedLine.includes(' as ')) {
      processedLine = line.replace(/\s+as\s+\w+/, '');
    }
    // Handle closing braces
    else if (trimmedLine === '}') {
      if (inInterface) {
        inInterface = false;
        continue;
      }
      if (inClass) {
        inClass = false;
      }
      indentLevel = Math.max(0, indentLevel - 1);
      continue;
    }

    // Remove semicolons
    if (processedLine.endsWith(';')) {
      processedLine = processedLine.slice(0, -1);
    }

    // Add proper indentation
    if (processedLine.trim().length > 0) {
      processedLine = '    '.repeat(indentLevel) + processedLine.trim();
    }

    pythonCode += processedLine + '\n';

    // Adjust indent level
    if (trimmedLine.endsWith('{') || trimmedLine.endsWith(':')) {
      indentLevel++;
    }
  }

  return pythonCode.trim();
};

export const convertPythonToTypeScript = (sourceCode: string): string => {
  const lines = sourceCode.split('\n');
  let tsCode = '';
  let indentLevel = 0;
  let currentClass = '';
  let inFunction = false;

  for (let line of lines) {
    let processedLine = line;
    const trimmedLine = line.trim();
    const leadingSpaces = line.search(/\S/);

    // Skip empty lines
    if (!trimmedLine) {
      tsCode += '\n';
      continue;
    }

    // Handle comments
    if (trimmedLine.startsWith('#')) {
      processedLine = '//' + line.substring(line.indexOf('#') + 1);
    }
    // Handle multiline string/comments
    else if (trimmedLine.startsWith('"""')) {
      processedLine = '/*' + line.substring(3);
      if (trimmedLine.endsWith('"""')) {
        processedLine = processedLine.slice(0, -3) + '*/';
      }
    }
    // Handle class declaration
    else if (trimmedLine.startsWith('class ')) {
      currentClass = trimmedLine.split(' ')[1].split('(')[0];
      processedLine = line.replace(/class\s+(\w+)(\s*\(.*?\))?:/, 'class $1 {');
    }
    // Handle function/method declaration
    else if (trimmedLine.startsWith('def ')) {
      inFunction = true;
      if (currentClass) {
        // It's a method
        if (trimmedLine.includes('__init__')) {
          processedLine = line.replace(/def\s+__init__\s*\(self,?\s*(.*?)\):/, 'constructor($1) {');
        } else {
          processedLine = line.replace(/def\s+(\w+)\s*\(self,?\s*(.*?)\):/, 'public $1($2) {');
        }
      } else {
        // It's a function
        processedLine = line.replace(/def\s+(\w+)\s*\((.*?)\):/, 'function $1($2) {');
      }
    }
    // Handle print statements
    else if (trimmedLine.startsWith('print(')) {
      processedLine = line.replace(/print\((.*)\)/, 'console.log($1);');
    }
    // Add type annotations to variables where possible
    else if (trimmedLine.match(/^[a-zA-Z_]\w*\s*=/)) {
      processedLine = line.replace(/(\w+)\s*=\s*(\d+)/, 'let $1: number = $2;');
      processedLine = processedLine.replace(/(\w+)\s*=\s*["'].*?["']/, 'let $1: string = $2;');
      processedLine = processedLine.replace(/(\w+)\s*=\s*True|False/, 'let $1: boolean = $2;');
      processedLine = processedLine.replace(/(\w+)\s*=\s*\[.*?\]/, 'let $1: any[] = $2;');
    }

    // Handle indentation changes
    if (leadingSpaces < indentLevel * 4) {
      const dedentCount = Math.floor((indentLevel * 4 - leadingSpaces) / 4);
      for (let i = 0; i < dedentCount; i++) {
        tsCode += '    '.repeat(Math.max(0, indentLevel - i - 1)) + '}\n';
      }
      indentLevel = Math.max(0, indentLevel - dedentCount);
    }

    // Add proper indentation and semicolons
    if (processedLine.trim().length > 0) {
      processedLine = '    '.repeat(indentLevel) + processedLine.trim();
      if (!processedLine.trim().endsWith('{') && !processedLine.trim().endsWith('}')) {
        processedLine += ';';
      }
    }

    tsCode += processedLine + '\n';

    // Adjust indent level
    if (trimmedLine.endsWith(':')) {
      indentLevel++;
    }
  }

  // Close any remaining blocks
  while (indentLevel > 0) {
    indentLevel--;
    tsCode += '    '.repeat(indentLevel) + '}\n';
  }

  return tsCode.trim();
};
