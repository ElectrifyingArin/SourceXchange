export interface ConvertCodeRequest {
  sourceCode: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface ConvertCodeResponse {
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