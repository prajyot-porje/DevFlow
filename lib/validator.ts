import { parse } from "@babel/parser";

export function checkSyntax(code: string, filename: string): string | null {
  // Only check JS/JSX/TS/TSX files
  const ext = filename.split(".").pop() ?? "";
  if (!["js", "jsx", "ts", "tsx"].includes(ext)) return null;

  try {
    parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    return null; // no error
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err.message;
    }
    return String(err) || "Syntax error";
  }
}
