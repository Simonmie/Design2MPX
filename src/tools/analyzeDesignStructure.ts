import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { analyzeDesignStructureByPath } from "../services/designAnalysisService.js";

const inputSchema = {
  htmlPath: z.string().min(1, "htmlPath 不能为空"),
  cssPath: z.string().min(1).optional(),
};

export function registerAnalyzeDesignStructureTool(server: McpServer): void {
  server.tool(
    "analyze_design_structure",
    "分析设计稿结构、重复区块、absolute 使用风险与组件拆分建议。",
    inputSchema,
    async (args: { htmlPath: string; cssPath?: string }) => {
      const { htmlPath, cssPath } = args;
      const result = await analyzeDesignStructureByPath(htmlPath, cssPath);

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
