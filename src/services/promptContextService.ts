import type { MpxPromptContextResult } from "../types/index.js";
import { MPX_STATIC_PAGE_RULES } from "../constants/mpxRules.js";
import { analyzeDesignStructureByPath } from "./designAnalysisService.js";
import { extractDesignTokensByPath } from "./designTokenService.js";

function buildPageSummary(result: MpxPromptContextResult): string {
  const blockCount = result.structure.mainBlocks.length;
  const repeatCount = result.structure.repeatedStructures.length;
  const absRatio = result.structure.absolutePositioning.absoluteRatio;

  return `页面包含 ${blockCount} 个主区块，识别到 ${repeatCount} 组重复结构，absolute/fixed 比例信号为 ${absRatio}。`;
}

export async function generateMpxPromptContextByPath(
  htmlPath: string,
  cssPath?: string
): Promise<MpxPromptContextResult> {
  const structure = await analyzeDesignStructureByPath(htmlPath, cssPath);
  const tokenResult = cssPath ? await extractDesignTokensByPath(cssPath) : undefined;

  const base: MpxPromptContextResult = {
    htmlPath: structure.htmlPath,
    cssPath: structure.cssPath,
    structure,
    tokens: tokenResult?.tokens,
    mpxRules: MPX_STATIC_PAGE_RULES,
    llmContext: {
      pageSummary: "",
      recommendedComponentSplit: structure.componentSplitSuggestions,
      layoutRisks: structure.riskTips,
      staticGenerationRules: MPX_STATIC_PAGE_RULES
    }
  };

  base.llmContext.pageSummary = buildPageSummary(base);
  return base;
}
