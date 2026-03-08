import type { DesignTokens } from "../types/index.js";
import { readUtf8File } from "../utils/file.js";
import { extractCssDesignTokens } from "../utils/cssTokens.js";

export async function extractDesignTokensByPath(cssPath: string): Promise<{
  cssPath: string;
  tokens: DesignTokens;
}> {
  const cssFile = await readUtf8File(cssPath);
  const tokens = extractCssDesignTokens(cssFile.content);

  return {
    cssPath: cssFile.absolutePath,
    tokens
  };
}
