import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SupportedLanguage } from "@/lib/code-templates";

interface LanguageSelectorProps {
  label: string;
  value: SupportedLanguage;
  onChange: (value: SupportedLanguage) => void;
  excludeValue?: SupportedLanguage;
}

export function LanguageSelector({ label, value, onChange, excludeValue }: LanguageSelectorProps) {
  const languages: { value: SupportedLanguage; label: string }[] = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "typescript", label: "TypeScript" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
    { value: "swift", label: "Swift" },
    { value: "rust", label: "Rust" },
    { value: "kotlin", label: "Kotlin" },
    { value: "dart", label: "Dart" },
  ];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages
            .filter((lang) => lang.value !== excludeValue)
            .map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
