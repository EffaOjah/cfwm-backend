/**
 * Utility to convert text to URL-friendly slug
 */
function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')                     // Split accented characters
        .replace(/[\u0300-\u036f]/g, '')     // Remove diacritics
        .replace(/[^\w\s-]/g, '')            // Remove non-word characters except spaces and hyphens
        .replace(/[\s_-]+/g, '-')            // Replace spaces, underscores and dashes with single hyphen
        .replace(/^-+|-+$/g, '');            // Remove leading and trailing hyphens
}

module.exports = { slugify };
