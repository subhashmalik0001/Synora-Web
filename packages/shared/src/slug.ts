/**
 * Generate a URL-friendly slug from a name
 * "NSE Premium Signals" → "nse-premium-signals"
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // remove non-word chars except spaces and hyphens
        .replace(/[\s_]+/g, "-") // replace spaces and underscores with hyphens
        .replace(/-+/g, "-") // collapse multiple hyphens
        .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * Ensure a slug is unique by appending -1, -2, etc.
 * @param slug The base slug
 * @param existingSlugs Array of existing slugs to check against
 */
export function ensureUniqueSlug(slug: string, existingSlugs: string[]): string {
    if (!existingSlugs.includes(slug)) return slug;

    let counter = 1;
    while (existingSlugs.includes(`${slug}-${counter}`)) {
        counter++;
    }
    return `${slug}-${counter}`;
}
