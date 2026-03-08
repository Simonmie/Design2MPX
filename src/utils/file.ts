import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

export async function readUtf8File(inputPath: string): Promise<{ absolutePath: string; content: string }> {
  const absolutePath = path.resolve(inputPath);
  await access(absolutePath, constants.R_OK);
  const content = await readFile(absolutePath, "utf-8");
  return { absolutePath, content };
}
