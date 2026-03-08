export interface HtmlStats {
  totalTags: number;
  uniqueTagCount: number;
  divCount: number;
  imgCount: number;
  aCount: number;
  buttonCount: number;
  tagCounts: Record<string, number>;
}

export interface MainBlock {
  selectorHint: string;
  tag: string;
  className?: string;
  id?: string;
  childrenCount: number;
  imgCount: number;
  textLength: number;
}

export interface RepeatedStructureCandidate {
  signature: string;
  count: number;
  sampleSelector: string;
}

export interface AbsolutePositionInfo {
  absoluteCount: number;
  fixedCount: number;
  totalStyleSignals: number;
  absoluteRatio: number;
  isAbsoluteHeavy: boolean;
}

export interface StructureAnalysisResult {
  htmlPath: string;
  cssPath?: string;
  stats: HtmlStats;
  mainBlocks: MainBlock[];
  repeatedStructures: RepeatedStructureCandidate[];
  absolutePositioning: AbsolutePositionInfo;
  suitableForStaticMpx: boolean;
  riskTips: string[];
  componentSplitSuggestions: string[];
}

export interface DesignTokens {
  colors: string[];
  fontSizes: string[];
  lineHeights: string[];
  radii: string[];
  spacings: string[];
  shadows: string[];
}

export interface MpxPromptContextResult {
  htmlPath: string;
  cssPath?: string;
  structure: StructureAnalysisResult;
  tokens?: DesignTokens;
  mpxRules: string[];
  llmContext: {
    pageSummary: string;
    recommendedComponentSplit: string[];
    layoutRisks: string[];
    staticGenerationRules: string[];
  };
}
