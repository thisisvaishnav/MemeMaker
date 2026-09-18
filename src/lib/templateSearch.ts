/**
 * Utility for case-insensitive template search matching across id, name, and aliases
 */
export function matchesTemplateSearch(
  id: number,
  query: string,
  templateNames: Record<number, string> = {},
  aliasMap: Record<string, number> = {}
): boolean {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return true;

  if (String(id).includes(cleanQuery)) return true;

  const name = templateNames[id]?.toLowerCase() || "";
  if (name.includes(cleanQuery)) return true;

  return Object.entries(aliasMap).some(
    ([alias, aliasId]) => aliasId === id && alias.includes(cleanQuery)
  );
}
