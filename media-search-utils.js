function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("ko-KR");
}

export function searchMediaCatalog(catalog, query, type) {
  const normalizedQuery = normalize(query);
  return catalog
    .filter((item) => item.type === type)
    .filter((item) => {
      if (!normalizedQuery) return true;
      return [item.title, item.creator, item.description].some((value) => normalize(value).includes(normalizedQuery));
    });
}
