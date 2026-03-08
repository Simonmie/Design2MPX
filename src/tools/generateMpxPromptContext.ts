import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateMpxPromptContextByPath } from "../services/promptContextService.js";

const inputSchema = {
  htmlPath: z.string().min(1, "htmlPath 不能为空"),
  cssPath: z.string().min(1).optional(),
};

export function registerGenerateMpxPromptContextTool(server: McpServer): void {
  server.tool(
    "generate_mpx_prompt_context",
    "输出面向大模型的 MPX 静态页面生成上下文，不直接生成 MPX 文件。",
    inputSchema,
    async (args: { htmlPath: string; cssPath?: string }) => {
      const { htmlPath, cssPath } = args;
      const result = await generateMpxPromptContextByPath(htmlPath, cssPath);

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
