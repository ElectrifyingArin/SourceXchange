export type SupportedLanguage = {
  id: string;
  displayName: string;
  prismLanguage: string;
  monacoLanguage: string;
};

export const supportedLanguages: SupportedLanguage[] = [
  {
    id: "javascript",
    displayName: "JavaScript",
    prismLanguage: "javascript",
    monacoLanguage: "javascript"
  },
  {
    id: "python",
    displayName: "Python",
    prismLanguage: "python",
    monacoLanguage: "python"
  },
  {
    id: "java",
    displayName: "Java",
    prismLanguage: "java",
    monacoLanguage: "java"
  },
  {
    id: "csharp",
    displayName: "C#",
    prismLanguage: "csharp",
    monacoLanguage: "csharp"
  },
  {
    id: "cpp",
    displayName: "C++",
    prismLanguage: "cpp",
    monacoLanguage: "cpp"
  },
  {
    id: "php",
    displayName: "PHP",
    prismLanguage: "php",
    monacoLanguage: "php"
  },
  {
    id: "ruby",
    displayName: "Ruby",
    prismLanguage: "ruby",
    monacoLanguage: "ruby"
  },
  {
    id: "swift",
    displayName: "Swift",
    prismLanguage: "swift",
    monacoLanguage: "swift"
  },
  {
    id: "kotlin",
    displayName: "Kotlin",
    prismLanguage: "kotlin",
    monacoLanguage: "kotlin"
  },
  {
    id: "go",
    displayName: "Go",
    prismLanguage: "go",
    monacoLanguage: "go"
  },
  {
    id: "rust",
    displayName: "Rust",
    prismLanguage: "rust",
    monacoLanguage: "rust"
  },
  {
    id: "typescript",
    displayName: "TypeScript",
    prismLanguage: "typescript",
    monacoLanguage: "typescript"
  },
  {
    id: "scala",
    displayName: "Scala",
    prismLanguage: "scala",
    monacoLanguage: "scala"
  },
  {
    id: "dart",
    displayName: "Dart",
    prismLanguage: "dart",
    monacoLanguage: "dart"
  },
  {
    id: "r",
    displayName: "R",
    prismLanguage: "r",
    monacoLanguage: "r"
  },
  {
    id: "perl",
    displayName: "Perl",
    prismLanguage: "perl",
    monacoLanguage: "perl"
  },
  {
    id: "haskell",
    displayName: "Haskell",
    prismLanguage: "haskell",
    monacoLanguage: "haskell"
  },
  {
    id: "bash",
    displayName: "Bash",
    prismLanguage: "bash",
    monacoLanguage: "shell"
  }
];

export function getLanguageById(id: string): SupportedLanguage {
  const language = supportedLanguages.find(lang => lang.id === id);
  if (!language) {
    throw new Error(`Language with ID "${id}" not found`);
  }
  return language;
}

export function getLanguageByDisplayName(name: string): SupportedLanguage {
  const language = supportedLanguages.find(lang => lang.displayName === name);
  if (!language) {
    throw new Error(`Language with name "${name}" not found`);
  }
  return language;
}
