import { SerializedEditorState } from "lexical";
import DOMPurify from "dompurify";

// SSR-safe fallback for sanitize-html
let sanitizeHtml: ((dirty: string) => string) | null = null;
if (typeof window === "undefined") {
  try {
    sanitizeHtml = require("sanitize-html");
  } catch {
    console.warn("sanitize-html not available in SSR environment.");
  }
}

const ALIGNMENT_OPTIONS = ["left", "center", "right", "justify"];

const getAlignmentStyle = (node: any): string => {
  const align = node.align || node.format;
  return ALIGNMENT_OPTIONS.includes(align) ? `text-align: ${align}` : "";
};

const getIndentStyle = (node: any): string => {
  return node.indent ? `margin-left: ${node.indent * 20}px` : "";
};

const getFontFamily = (font: string): string => {
  const fontMap: Record<string, string> = {
    Arial: "Arial, sans-serif",
    Verdana: "Verdana, sans-serif",
    "Times New Roman": '"Times New Roman", Times, serif',
    Georgia: "Georgia, serif",
    "Courier New": '"Courier New", Courier, monospace',
    "Trebuchet MS": '"Trebuchet MS", Helvetica, sans-serif',
  };
  return fontMap[font] || font;
};

const buildStyleAttr = (styles: string[]): string => {
  const filtered = styles.filter(Boolean);
  return filtered.length ? ` style="${filtered.join("; ")}"` : "";
};

const wrapWithTags = (text: string, tags: string[]): string => {
  return tags.reduceRight((acc, tag) => `<${tag}>${acc}</${tag}>`, text);
};


export const parseEditorStateString = (state: string): SerializedEditorState | any => {

  try {
    return JSON.parse(state) as SerializedEditorState;
  } catch {
    return {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: state.replace(/<[^>]*>/g, ""),
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };
  }
}


export function serializeEditorStateToHtml(state: SerializedEditorState): string {
  const processNode = (node: any): string => {
    switch (node.type) {
      case "text": {
        let text = node.text;
        const tags: string[] = [];
        const styles: string[] = [];


        if (node.format & 1) tags.push("strong");
        if (node.format & 2) tags.push("em");
        if (node.format & 8) tags.push("u");
        if (node.format & 4) tags.push("s");
        if (node.format & 16) tags.push("sub");
        if (node.format & 32) tags.push("sup");
        if (node.format & 64) tags.push("code");
        if (node.format & 128) tags.push("mark");


        if (node.color) styles.push(`color: ${node.color}`);
        if (node.backgroundColor) styles.push(`background-color: ${node.backgroundColor}`);
        if (node.fontSize) styles.push(`font-size: ${node.fontSize}`);
        if (node.fontFamily) styles.push(`font-family: ${getFontFamily(node.fontFamily)}`);
        if (node.style) styles.push(node.style);

        const styledText = wrapWithTags(text, tags);
        return styles.length ? `<span${buildStyleAttr(styles)}>${styledText}</span>` : styledText;
      }

      case "paragraph":
        return `<p${buildStyleAttr([getAlignmentStyle(node), getIndentStyle(node)])}>${node.children.map(processNode).join("")}</p>`;

      case "heading": {
        const level = Math.max(1, Math.min(node.tag || 1, 6));
        return `<h${level}${buildStyleAttr([getAlignmentStyle(node), getIndentStyle(node)])}>${node.children.map(processNode).join("")}</h${level}>`;
      }

      case "list": {
        const tag = node.listType === "number" ? "ol" : "ul";
        const start = node.start && node.start !== 1 ? ` start="${node.start}"` : "";
        const classAttr = node.listType === "check" ? ' class="check-list"' : "";
        return `<${tag}${classAttr}${start}>${node.children.map(processNode).join("")}</${tag}>`;
      }

      case "listitem": {
        const checkbox = typeof node.checked === "boolean"
          ? `<input type="checkbox"${node.checked ? " checked" : ""} disabled> `
          : "";
        return `<li${buildStyleAttr([getAlignmentStyle(node)])}>${checkbox}${node.children.map(processNode).join("")}</li>`;
      }

      case "blockquote":
      case "quote":
        return `<blockquote${buildStyleAttr([getAlignmentStyle(node), getIndentStyle(node)])}>${node.children.map(processNode).join("")}</blockquote>`;

      case "link":
        const attrs = [
          `href="${node.url}"`,
          node.target ? `target="${node.target}"` : "",
          node.title ? `title="${node.title}"` : "",
          node.rel ? `rel="${node.rel}"` : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<a ${attrs}>${node.children.map(processNode).join("")}</a>`;

      case "image":
        const imageAttrs = [
          `src="${node.src}"`,
          node.alt ? `alt="${node.alt}"` : "",
          node.title ? `title="${node.title}"` : "",
          node.width ? `width="${node.width}"` : "",
          node.height ? `height="${node.height}"` : "",
        ]
          .filter(Boolean)
          .join(" ");
        const imageStyle = buildStyleAttr([node.style]);
        return `<img ${imageAttrs}${imageStyle ? imageStyle : ""} />`;

      case "code":
        return `<pre${node.language ? ` class="language-${node.language}"` : ""}><code>${node.code || node.children.map(processNode).join("")}</code></pre>`;

      case "horizontalrule":
        return "<hr />";

      case "linebreak":
        return "<br />";

      case "emoji":
        return node.text || node.emojiText || "";

      default:
        if (Array.isArray(node.children)) {
          return node.children.map(processNode).join("");
        }
        return node.text || "";
    }
  };

  const rawHtml = state?.root?.children?.map(processNode).join("") || "";

  // sanitize
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
  } else if (sanitizeHtml) {
    return sanitizeHtml(rawHtml);
  }

  console.warn("No sanitizer found — returning raw HTML (unsafe).");
  return rawHtml;
}
