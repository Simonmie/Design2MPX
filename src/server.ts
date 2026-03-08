import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAnalyzeDesignStructureTool } from "./tools/analyzeDesignStructure.js";
import { registerExtractDesignTokensTool } from "./tools/extractDesignTokens.js";
import { registerGenerateMpxPromptContextTool } from "./tools/generateMpxPromptContext.js";
import { registerReadDesignHtmlTool } from "./tools/readDesignHtml.js";

async function bootstrap(): Promise<void> {
  const server = new McpServer({
    name: "design-to-mpx-mcp",
    version: "0.1.0"
  });

  registerReadDesignHtmlTool(server);
  registerAnalyzeDesignStructureTool(server);
  registerExtractDesignTokensTool(server);
  registerGenerateMpxPromptContextTool(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

bootstrap().catch((error) => {
  console.error("[design-to-mpx-mcp] server failed:", error);
  process.exit(1);
});
