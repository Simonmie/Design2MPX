import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readUtf8File } from "../utils/file.js";
import { getHtmlStats } from "../utils/htmlStats.js";

const inputSchema = {
  htmlPath: z.string().min(1, "htmlPath 不能为空"),
};

export function registerReadDesignHtmlTool(server: McpServer): void {
  server.tool(
    "read_design_html",
    "读取 HTML 设计稿原文并返回基础统计信息。",
    inputSchema,
    async (args: { htmlPath: string }) => {
      const { htmlPath } = args;
      const htmlFile = await readUtf8File(htmlPath);
      const stats = getHtmlStats(htmlFile.content);

      const result = {
        htmlPath: htmlFile.absolutePath,
        html: htmlFile.content,
        stats,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
