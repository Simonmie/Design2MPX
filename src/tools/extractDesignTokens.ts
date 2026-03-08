import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { extractDesignTokensByPath } from "../services/designTokenService.js";

const inputSchema = {
  cssPath: z.string().min(1, "cssPath 不能为空"),
};

export function registerExtractDesignTokensTool(server: McpServer): void {
  server.tool(
    "extract_design_tokens",
    "从 CSS 中提取颜色、字号、行高、圆角、间距、阴影等 token。",
    inputSchema,
    async (args: { cssPath: string }) => {
      const { cssPath } = args;
      const result = await extractDesignTokensByPath(cssPath);

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
