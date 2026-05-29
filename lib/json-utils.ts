export function safeParseJSON(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
      try {
        const cleaned = match[0].replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleaned);
      } catch {}
    }
    throw new Error('Unparseable JSON: ' + raw.slice(0, 200));
  }
}
