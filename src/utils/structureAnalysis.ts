import { load } from "cheerio";
import type { AbsolutePositionInfo, MainBlock, RepeatedStructureCandidate } from "../types/index.js";

function buildSelectorHint(tag: string, id?: string, className?: string): string {
  if (id) return `${tag}#${id}`;
  if (className) {
    const firstClass = className.trim().split(/\s+/)[0];
    if (firstClass) return `${tag}.${firstClass}`;
  }
  return tag;
}

export function extractMainBlocks(html: string): MainBlock[] {
  const $ = load(html);

  let candidates = $("body").children();
  if (candidates.length === 0) {
    candidates = $("#app, #root").children();
  }
  if (candidates.length === 0) {
    candidates = $("html").children();
  }

  const blocks: MainBlock[] = [];
  candidates.each((_: number, el: any) => {
    const node = $(el);
    const tag = el.tagName?.toLowerCase() ?? "unknown";
    const className = node.attr("class");
    const id = node.attr("id");

    blocks.push({
      selectorHint: buildSelectorHint(tag, id, className),
      tag,
      className: className ?? undefined,
      id: id ?? undefined,
      childrenCount: node.children().length,
      imgCount: node.find("img").length,
      textLength: node.text().trim().length
    });
  });

  return blocks.slice(0, 20);
}

function getStructureSignature(elementHtml: string): string {
  const $ = load(elementHtml);
  const root = $.root().children().first();
  const tag = root.get(0)?.tagName ?? "unknown";
  const childTags = root
    .children()
    .map((_: number, el: any) => el.tagName?.toLowerCase() ?? "unknown")
    .get()
    .slice(0, 8);
  const textBucket = Math.min(Math.floor(root.text().trim().length / 20), 6);

  return `${tag}|children:${childTags.join(",")}|textBucket:${textBucket}|htmlLen:${Math.min(
    elementHtml.length,
    300
  )}`;
}

export function detectRepeatedStructures(html: string): RepeatedStructureCandidate[] {
  const $ = load(html);
  const map = new Map<string, { count: number; sampleSelector: string }>();
  const selector = "section,article,li,div,header,footer,nav";

  $(selector).each((_: number, el: any) => {
    const node = $(el);
    const outer = $.html(node);
    if (!outer) return;

    const childrenCount = node.children().length;
    if (childrenCount < 1) return;

    const signature = getStructureSignature(outer);
    const tag = el.tagName?.toLowerCase() ?? "div";
    const sampleSelector = buildSelectorHint(tag, node.attr("id"), node.attr("class"));

    const prev = map.get(signature);
    if (prev) {
      prev.count += 1;
    } else {
      map.set(signature, { count: 1, sampleSelector });
    }
  });

  return [...map.entries()]
    .filter(([, value]) => value.count >= 3)
    .map(([signature, value]) => ({
      signature,
      count: value.count,
      sampleSelector: value.sampleSelector
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function detectAbsolutePositioning(html: string, cssText?: string): AbsolutePositionInfo {
  const inlineAbsoluteCount =
    (html.match(/style\s*=\s*["'][^"']*position\s*:\s*absolute[^"']*["']/gi) ?? []).length;
  const inlineFixedCount =
    (html.match(/style\s*=\s*["'][^"']*position\s*:\s*fixed[^"']*["']/gi) ?? []).length;

  const cssAbsoluteCount = (cssText?.match(/position\s*:\s*absolute/gi) ?? []).length;
  const cssFixedCount = (cssText?.match(/position\s*:\s*fixed/gi) ?? []).length;
  const totalStyleSignals = (cssText?.match(/:/g) ?? []).length + (html.match(/style=/gi) ?? []).length;

  const absoluteCount = inlineAbsoluteCount + cssAbsoluteCount;
  const fixedCount = inlineFixedCount + cssFixedCount;
  const absoluteRatio = (absoluteCount + fixedCount) / Math.max(totalStyleSignals, 1);

  return {
    absoluteCount,
    fixedCount,
    totalStyleSignals,
    absoluteRatio: Number(absoluteRatio.toFixed(4)),
    isAbsoluteHeavy: absoluteRatio >= 0.08 || absoluteCount + fixedCount >= 20
  };
}

export function buildRiskTips(
  repeated: RepeatedStructureCandidate[],
  absoluteInfo: AbsolutePositionInfo
): string[] {
  const risks: string[] = [];

  if (absoluteInfo.isAbsoluteHeavy) {
    risks.push("页面中 absolute/fixed 使用偏多，直接还原到文档流可能需要人工调整。");
  }
  if (repeated.length === 0) {
    risks.push("暂未识别到明显重复结构，组件拆分价值可能受限。");
  }
  if (repeated.some((item) => item.count >= 8)) {
    risks.push("存在高频重复结构，需优先抽离组件避免模板冗余。");
  }

  if (risks.length === 0) {
    risks.push("结构风险较低，可直接进入 MPX 静态页初稿生成。");
  }

  return risks;
}

export function buildComponentSplitSuggestions(
  mainBlocks: MainBlock[],
  repeated: RepeatedStructureCandidate[]
): string[] {
  const suggestions: string[] = [];

  if (mainBlocks.length > 0) {
    suggestions.push(`按主区块拆分容器组件（建议先处理 ${mainBlocks[0]?.selectorHint} 起始区域）。`);
  }

  repeated.forEach((item, index) => {
    if (index < 5) {
      suggestions.push(`将重复结构（count=${item.count}）抽象为可复用区块组件：${item.sampleSelector}。`);
    }
  });

  if (suggestions.length < 2) {
    suggestions.push("先拆 Header / Content / Footer 三段式骨架，再逐步细化内部组件。");
  }

  return suggestions;
}
