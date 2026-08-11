export function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '-');
}

export function findCategoryBySlug(categories, slug) {
  return categories.find((c) => slugify(c) === slug);
}
