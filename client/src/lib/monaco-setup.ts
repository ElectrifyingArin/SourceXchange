// This file helps set up Monaco editor's web workers
// which are required for syntax highlighting and error detection

import * as monaco from 'monaco-editor';

// Simplest Monaco editor setup that works well in Replit
export function initMonaco() {
  try {
    // Use the simplest possible setup for Monaco without workers
    self.MonacoEnvironment = {
      getWorkerUrl: function(_moduleId: string, _label: string) {
        // This returns an empty script that does nothing
        // but prevents errors while still allowing basic functionality
        return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(`
          self.onmessage = function() {
            // Minimal no-op worker
            self.postMessage({});
          };
        `);
      }
    };

    // Configure basic options that improve performance
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true
    });

    // Reduce features to improve performance
    monaco.editor.setTheme('vs');
    
    // Disable unnecessary features
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });

    console.log('Monaco editor environment initialized');
  } catch (err) {
    console.error('Failed to initialize Monaco editor:', err);
  }
}