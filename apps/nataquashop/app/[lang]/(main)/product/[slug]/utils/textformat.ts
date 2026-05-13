export function extractTextFromLexical(json: any): string {
  if (!json?.root?.children) return "";

  return json.root.children
    .map((node: any) => {
      if (!node.children) return "";
      return node.children
        .map((child: any) => (child.text ? child.text : ""))
        .join("");
    })
    .join("\n");
}


export function isJsonString(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null;
  } catch (e) {
    return false;
  }
}
