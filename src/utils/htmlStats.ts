import { load } from "cheerio";
import type { HtmlStats } from "../types/index.js";

export function getHtmlStats(html: string): HtmlStats {
  const $ = load(html);
  const allTags = $("*");
  const tagCounts: Record<string, number> = {};

  allTags.each((_: number, el: any) => {
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;
    tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  });

  return {
    totalTags: allTags.length,
    uniqueTagCount: Object.keys(tagCounts).length,
    divCount: $("div").length,
    imgCount: $("img").length,
    aCount: $("a").length,
    buttonCount: $("button").length,
    tagCounts
  };
}
