import type { StructureAnalysisResult } from "../types/index.js";
import { readUtf8File } from "../utils/file.js";
import { getHtmlStats } from "../utils/htmlStats.js";
import {
  buildComponentSplitSuggestions,
  buildRiskTips,
  detectAbsolutePositioning,
  detectRepeatedStructures,
  extractMainBlocks
} from "../utils/structureAnalysis.js";

function evaluateSuitableForStaticMpx(
  absoluteRatio: number,
  repeatedCount: number,
  totalTags: number
): boolean {
  if (absoluteRatio > 0.12) return false;
  if (totalTags > 2500 && repeatedCount === 0) return false;
  return true;
}

export function analyzeDesignStructureFromRaw(
  htmlPath: string,
  htmlText: string,
  cssPath?: string,
  cssText?: string
): StructureAnalysisResult {
  const stats = getHtmlStats(htmlText);
  const mainBlocks = extractMainBlocks(htmlText);
  const repeatedStructures = detectRepeatedStructures(htmlText);
  const absolutePositioning = detectAbsolutePositioning(htmlText, cssText);

  const suitableForStaticMpx = evaluateSuitableForStaticMpx(
    absolutePositioning.absoluteRatio,
    repeatedStructures.length,
    stats.totalTags
  );

  const riskTips = buildRiskTips(repeatedStructures, absolutePositioning);
  const componentSplitSuggestions = buildComponentSplitSuggestions(mainBlocks, repeatedStructures);

  return {
    htmlPath,
    cssPath,
    stats,
    mainBlocks,
    repeatedStructures,
    absolutePositioning,
    suitableForStaticMpx,
    riskTips,
    componentSplitSuggestions
  };
}

export async function analyzeDesignStructureByPath(
  htmlPath: string,
  cssPath?: string
): Promise<StructureAnalysisResult> {
  const htmlFile = await readUtf8File(htmlPath);
  const cssFile = cssPath ? await readUtf8File(cssPath) : undefined;

  return analyzeDesignStructureFromRaw(
    htmlFile.absolutePath,
    htmlFile.content,
    cssFile?.absolutePath,
    cssFile?.content
  );
}
