import postcss from "postcss";
import type { DesignTokens } from "../types/index.js";

const COLOR_PATTERN =
  /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)|\b(black|white|red|green|blue|gray|grey|orange|yellow|purple|pink|transparent)\b)/gi;

const LENGTH_PATTERN = /-?\d*\.?\d+(px|rpx|rem|em|vh|vw|%)?/gi;

function normalizeValue(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function sortValues(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const na = Number.parseFloat(a);
    const nb = Number.parseFloat(b);
    const aNum = Number.isFinite(na);
    const bNum = Number.isFinite(nb);

    if (aNum && bNum) return na - nb;
    if (aNum) return -1;
    if (bNum) return 1;
    return a.localeCompare(b);
  });
}

function pushLengthSet(target: Set<string>, value: string): void {
  const matches = value.match(LENGTH_PATTERN) ?? [];
  matches.forEach((item) => target.add(normalizeValue(item)));
}

export function extractCssDesignTokens(cssText: string): DesignTokens {
  const root = postcss.parse(cssText);

  const colors = new Set<string>();
  const fontSizes = new Set<string>();
  const lineHeights = new Set<string>();
  const radii = new Set<string>();
  const spacings = new Set<string>();
  const shadows = new Set<string>();

  root.walkDecls((decl: any) => {
    const prop = decl.prop.toLowerCase();
    const value = normalizeValue(decl.value);

    const colorMatches = value.match(COLOR_PATTERN) ?? [];
    colorMatches.forEach((color) => colors.add(normalizeValue(color)));

    if (prop === "font-size") {
      pushLengthSet(fontSizes, value);
    }

    if (prop === "line-height") {
      if (/normal/i.test(value)) {
        lineHeights.add("normal");
      }
      pushLengthSet(lineHeights, value);
    }

    if (prop.includes("radius")) {
      pushLengthSet(radii, value);
    }

    if (
      prop.startsWith("margin") ||
      prop.startsWith("padding") ||
      prop === "gap" ||
      prop === "row-gap" ||
      prop === "column-gap"
    ) {
      pushLengthSet(spacings, value);
    }

    if (prop.includes("shadow")) {
      shadows.add(value);
    }
  });

  return {
    colors: sortValues([...colors]),
    fontSizes: sortValues([...fontSizes]),
    lineHeights: sortValues([...lineHeights]),
    radii: sortValues([...radii]),
    spacings: sortValues([...spacings]),
    shadows: sortValues([...shadows]),
  };
}
